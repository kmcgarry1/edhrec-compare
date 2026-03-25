import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useTheme } from "./useTheme";
import { useOwnedFilter } from "./useOwnedFilter";
import { useCsvUpload } from "./useCsvUpload";
import { useCsvUploadMode } from "./useCsvUploadMode";
import { useBackgroundPreference } from "./useBackgroundPreference";
import { useLayoutDensity } from "./useLayoutDensity";
import { useCommanderSpotlight } from "./useCommanderSpotlight";
import { useEdhrecRouteState } from "./useEdhrecRouteState";
import { requestCache } from "../api/requestCache";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import type { CommanderSelection, DecklistPayload, EdhrecData } from "../types/edhrec";
import type { OwnedFilterOption } from "../types/dashboard";

type NextStepAction = "browse" | "upload" | "filter" | "copy" | null;

const EMPTY_COMMANDER_SELECTION: CommanderSelection = {
  primary: "",
  partner: "",
  hasPartner: false,
};

const formatSlugForDisplay = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const parseCommanderSelectionLabel = (value: string | null | undefined): CommanderSelection => {
  const normalized = value?.replace(/\s+\(Commander\)\s*$/, "").trim() ?? "";
  if (!normalized) {
    return EMPTY_COMMANDER_SELECTION;
  }

  const [primary = "", partner = ""] = normalized
    .split(/\s*\/\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (primary && partner) {
    return {
      primary,
      partner,
      hasPartner: true,
    };
  }

  return {
    primary: normalized,
    partner: "",
    hasPartner: false,
  };
};

const sameCommanderSelection = (left: CommanderSelection, right: CommanderSelection) =>
  left.primary === right.primary &&
  left.partner === right.partner &&
  left.hasPartner === right.hasPartner;

export const useDashboardState = () => {
  const { theme, toggleTheme } = useTheme();
  const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
  const { rows: csvRows } = useCsvUpload();
  const { mode: csvUploadMode } = useCsvUploadMode();
  const { showOwned, setOwnedFilter } = useOwnedFilter();
  const { density, setDensity, densityOptions } = useLayoutDensity();
  const { currentCommanderSlug, commanderUrl } = useEdhrecRouteState();

  const showUploadModal = ref(false);
  const decklistExport = ref<DecklistPayload | null>(null);
  const decklistCopied = ref(false);
  const mainContentRef = ref<HTMLElement | null>(null);
  const browseRailOpen = ref(true);
  const utilityDrawerOpen = ref(false);
  const commanderSelection = ref<CommanderSelection>({
    primary: "",
    partner: "",
    hasPartner: false,
  });
  const {
    spotlightCards: commanderSpotlightCards,
    spotlightLoading: commanderSpotlightLoading,
    backdropUrl: commanderSpotlightBackdropUrl,
  } = useCommanderSpotlight(commanderSelection);
  const routeCommanderLabel = ref<string | null>(null);
  let routeCommanderRequestId: symbol | null = null;
  let decklistCopyHandle: ReturnType<typeof setTimeout> | null = null;

  const csvCount = computed(() => csvRows.value.length);
  const hasCsvData = computed(() => csvCount.value > 0);
  const localCommanderSlug = computed(() =>
    buildCommanderSlug(
      commanderSelection.value.primary,
      commanderSelection.value.hasPartner ? commanderSelection.value.partner : ""
    )
  );
  const hasCommander = computed(
    () => Boolean(commanderSelection.value.primary) || Boolean(currentCommanderSlug.value)
  );
  const hasDecklist = computed(() => Boolean(decklistExport.value?.text));
  const decklistSectionCount = computed(() => decklistExport.value?.sections.length ?? 0);

  watch(
    commanderUrl,
    async (url) => {
      if (!url || !currentCommanderSlug.value) {
        routeCommanderLabel.value = null;
        routeCommanderRequestId = null;
        return;
      }

      const requestId = Symbol("route-commander");
      routeCommanderRequestId = requestId;

      try {
        const payload = await requestCache.dedupe(`edhrec:${url}`, async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return (await response.json()) as EdhrecData;
        });

        if (routeCommanderRequestId !== requestId) {
          return;
        }

        routeCommanderLabel.value =
          payload.container?.json_dict?.card?.name ?? payload.header ?? null;
      } catch {
        if (routeCommanderRequestId === requestId) {
          routeCommanderLabel.value = null;
        }
      }
    },
    { immediate: true }
  );

  watch(
    [currentCommanderSlug, routeCommanderLabel],
    ([routeSlug, resolvedLabel]) => {
      if (!routeSlug) {
        if (!sameCommanderSelection(commanderSelection.value, EMPTY_COMMANDER_SELECTION)) {
          commanderSelection.value = { ...EMPTY_COMMANDER_SELECTION };
        }
        return;
      }

      if (resolvedLabel) {
        const resolvedSelection = parseCommanderSelectionLabel(resolvedLabel);
        if (!sameCommanderSelection(commanderSelection.value, resolvedSelection)) {
          commanderSelection.value = resolvedSelection;
        }
        return;
      }

      if (!localCommanderSlug.value) {
        commanderSelection.value = parseCommanderSelectionLabel(formatSlugForDisplay(routeSlug));
        return;
      }

      if (localCommanderSlug.value !== routeSlug) {
        commanderSelection.value = parseCommanderSelectionLabel(formatSlugForDisplay(routeSlug));
      }
    },
    { immediate: true }
  );

  const focusWorkspace = () => {
    nextTick(() => {
      mainContentRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openUploadModal = () => {
    showUploadModal.value = true;
    focusWorkspace();
  };

  const openBrowseRail = () => {
    browseRailOpen.value = true;
    focusWorkspace();
  };

  const closeBrowseRail = () => {
    browseRailOpen.value = false;
  };

  const toggleBrowseRail = () => {
    browseRailOpen.value = !browseRailOpen.value;
    if (browseRailOpen.value) {
      focusWorkspace();
    }
  };

  const toggleUtilityDrawer = () => {
    utilityDrawerOpen.value = !utilityDrawerOpen.value;
  };

  const inventorySummary = computed(() => {
    if (!csvCount.value) {
      return "Upload a CSV to enable owned/unowned filters and collection matching.";
    }
    const count = csvCount.value;
    if (csvUploadMode.value === "top-50") {
      return `${count} card${count === 1 ? "" : "s"} loaded. Top commander scan ready.`;
    }
    return `${count} card${count === 1 ? "" : "s"} loaded. Filters now match your collection.`;
  });

  const nextStepAction = computed<NextStepAction>(() => {
    if (!hasCommander.value) {
      return "browse";
    }
    if (!hasCsvData.value) {
      return "upload";
    }
    if (!hasDecklist.value) {
      return "filter";
    }
    return "copy";
  });

  const nextStepLabel = computed(() => {
    if (!hasCommander.value) {
      return "Select a commander to load cardlists.";
    }
    if (!hasCsvData.value) {
      return "Upload your collection to enable owned/unowned filters.";
    }
    if (!decklistExport.value) {
      return "Fetching decklists from EDHREC.";
    }
    if (!decklistExport.value.text) {
      return "No cards match this filter.";
    }
    return "Decklist ready to export.";
  });

  const nextStepActionLabel = computed(() => {
    switch (nextStepAction.value) {
      case "browse":
        return "Browse commanders";
      case "upload":
        return "Upload CSV";
      case "filter":
        return "Review filters";
      case "copy":
        return "Copy decklist";
      default:
        return null;
    }
  });

  const handleNextStepAction = () => {
    switch (nextStepAction.value) {
      case "browse":
        openBrowseRail();
        break;
      case "filter":
        focusWorkspace();
        break;
      case "upload":
        openUploadModal();
        break;
      case "copy":
        void copyDecklistFromHeader();
        break;
      default:
        break;
    }
  };

  const exportHelperText = computed(() => {
    if (!hasCommander.value) {
      return "Select a commander in Search to generate decklists.";
    }
    if (!decklistExport.value) {
      return "Fetching decklists from EDHREC.";
    }
    if (!decklistExport.value.text) {
      return "No cards match the current filter. Try another filter.";
    }
    return "Copy or download the filtered decklist for your deck builder.";
  });

  const filterOptions = computed<OwnedFilterOption[]>(() => [
    { label: "Owned", value: true, active: showOwned.value === true },
    { label: "Unowned", value: false, active: showOwned.value === false },
    { label: "All", value: null, active: showOwned.value === null },
  ]);

  const clearDecklistCopiedState = () => {
    if (decklistCopyHandle) {
      clearTimeout(decklistCopyHandle);
      decklistCopyHandle = null;
    }
    decklistCopied.value = false;
  };

  const handleDecklistUpdate = (payload: DecklistPayload) => {
    decklistExport.value = payload;
  };

  const handleSelectionChange = (payload: CommanderSelection) => {
    commanderSelection.value = payload;
    browseRailOpen.value = false;
  };

  const copyDecklistFromHeader = async () => {
    if (!decklistExport.value?.text) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      console.warn("Clipboard API unavailable in this environment.");
      return;
    }
    try {
      clearDecklistCopiedState();
      decklistCopied.value = true;
      await navigator.clipboard.writeText(decklistExport.value.text);
      decklistCopyHandle = setTimeout(() => {
        decklistCopied.value = false;
        decklistCopyHandle = null;
      }, 1600);
    } catch (error) {
      handleError(error, {
        notify: true,
        fallbackMessage: "Unable to copy that decklist to your clipboard.",
        context: "Dashboard decklist copy",
      });
    }
  };

  const downloadDecklistFromHeader = () => {
    if (!decklistExport.value?.text) {
      return;
    }
    const filename = `commander-scout-${decklistExport.value.filterLabel
      .toLowerCase()
      .replace(/\s+/g, "-")}.txt`;
    downloadTextFile(decklistExport.value.text, filename);
  };

  onBeforeUnmount(() => {
    clearDecklistCopiedState();
  });

  return {
    theme,
    toggleTheme,
    backgroundEnabled,
    toggleBackground,
    density,
    setDensity,
    densityOptions,
    showUploadModal,
    decklistExport,
    decklistCopied,
    mainContentRef,
    browseRailOpen,
    utilityDrawerOpen,
    commanderSelection,
    commanderSpotlightCards,
    commanderSpotlightLoading,
    commanderSpotlightBackdropUrl,
    hasCommander,
    hasCsvData,
    hasDecklist,
    decklistSectionCount,
    csvCount,
    inventorySummary,
    nextStepLabel,
    nextStepActionLabel,
    exportHelperText,
    filterOptions,
    focusWorkspace,
    openUploadModal,
    openBrowseRail,
    closeBrowseRail,
    toggleBrowseRail,
    toggleUtilityDrawer,
    handleNextStepAction,
    handleDecklistUpdate,
    handleSelectionChange,
    copyDecklistFromHeader,
    downloadDecklistFromHeader,
    setOwnedFilter,
  };
};
