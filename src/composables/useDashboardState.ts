import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useTheme } from "./useTheme";
import { useOwnedFilter } from "./useOwnedFilter";
import { useCsvUpload } from "./useCsvUpload";
import { useCsvUploadMode } from "./useCsvUploadMode";
import { useBackgroundPreference } from "./useBackgroundPreference";
import { useLayoutDensity } from "./useLayoutDensity";
import { useCommanderSpotlight } from "./useCommanderSpotlight";
import { useEdhrecRouteState } from "./useEdhrecRouteState";
import { useUploadModal } from "./useUploadModal";
import { requestCache } from "../api/requestCache";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import type { CommanderSelection, DecklistPayload, EdhrecData } from "../types/edhrec";
import type { OwnedFilterOption } from "../types/dashboard";

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
  const {
    rows: csvRows,
    sourceName: csvSourceName,
    importedAt: csvImportedAt,
    clearCsvData,
  } = useCsvUpload();
  const { mode: csvUploadMode } = useCsvUploadMode();
  const { showOwned, setOwnedFilter } = useOwnedFilter();
  const { density, setDensity, densityOptions } = useLayoutDensity();
  const { currentCommanderSlug, commanderUrl } = useEdhrecRouteState();
  const { openUploadModal: openGlobalUploadModal } = useUploadModal();

  const decklistExport = ref<DecklistPayload | null>(null);
  const decklistCopied = ref(false);
  const mainContentRef = ref<HTMLElement | null>(null);
  const controlPanelOpen = ref(false);
  const utilityTrayOpen = ref(false);
  const commanderSelection = ref<CommanderSelection>({
    primary: "",
    partner: "",
    hasPartner: false,
  });
  const {
    commanderProfiles,
    spotlightLoading: commanderSpotlightLoading,
    backdropUrl: commanderSpotlightBackdropUrl,
    showNextPrinting,
    showPreviousPrinting,
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
  const canonicalEdhrecHref = computed(() => {
    const slug = currentCommanderSlug.value || localCommanderSlug.value;
    if (!slug) {
      return null;
    }
    return `https://edhrec.com/commanders/${slug}`;
  });

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
    controlPanelOpen.value = false;
    utilityTrayOpen.value = false;
    openGlobalUploadModal();
    focusWorkspace();
  };

  const clearUploadedCollection = () => {
    clearCsvData();
    controlPanelOpen.value = false;
    utilityTrayOpen.value = false;
    focusWorkspace();
  };

  const openControlPanel = () => {
    utilityTrayOpen.value = false;
    controlPanelOpen.value = true;
    focusWorkspace();
  };

  const closeControlPanel = () => {
    controlPanelOpen.value = false;
  };

  const toggleControlPanel = () => {
    utilityTrayOpen.value = false;
    controlPanelOpen.value = !controlPanelOpen.value;
    if (controlPanelOpen.value) {
      focusWorkspace();
    }
  };

  const openUtilityTray = () => {
    controlPanelOpen.value = false;
    utilityTrayOpen.value = true;
    focusWorkspace();
  };

  const closeUtilityTray = () => {
    utilityTrayOpen.value = false;
  };

  const toggleUtilityTray = () => {
    controlPanelOpen.value = false;
    utilityTrayOpen.value = !utilityTrayOpen.value;
    if (utilityTrayOpen.value) {
      focusWorkspace();
    }
  };

  const inventorySummary = computed(() => {
    if (!csvCount.value) {
      return "Upload your collection to compare owned and missing cards.";
    }
    const count = csvCount.value;
    if (csvUploadMode.value === "top-50") {
      return `${count} card${count === 1 ? "" : "s"} loaded. Top commander scan ready.`;
    }
    return `${count} card${count === 1 ? "" : "s"} loaded. Deck view now reflects your collection.`;
  });

  const collectionModeLabel = computed(() =>
    csvUploadMode.value === "top-50" ? "Top commander scan" : "Commander compare"
  );

  const collectionModeHint = computed(() =>
    csvUploadMode.value === "top-50"
      ? "This upload was last used for the ranking scan and is also available in compare."
      : "This upload is active for owned and missing deck views in the compare workflow."
  );

  const nextStepLabel = computed(() => {
    if (!hasCommander.value) {
      return "Choose a commander to load decklists.";
    }
    if (!hasCsvData.value) {
      return "Upload your collection to unlock owned and missing views.";
    }
    if (!decklistExport.value) {
      return "Fetching decklists from EDHREC.";
    }
    if (!decklistExport.value.text) {
      return "No cards match the current deck view.";
    }
    return "Decklist ready to export.";
  });

  const exportHelperText = computed(() => {
    if (!hasCommander.value) {
      return "Choose a commander to generate decklists.";
    }
    if (!decklistExport.value) {
      return "Fetching decklists from EDHREC.";
    }
    if (!decklistExport.value.text) {
      return "No cards match the current deck view. Try another filter.";
    }
    return "Copy or download the filtered decklist for your deck builder.";
  });

  const filterOptions = computed<OwnedFilterOption[]>(() => [
    { label: "Owned", value: true, active: showOwned.value === true },
    { label: "Missing", value: false, active: showOwned.value === false },
    { label: "All cards", value: null, active: showOwned.value === null },
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
    if (payload.primary && (!payload.hasPartner || Boolean(payload.partner))) {
      controlPanelOpen.value = false;
    }
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

  const showNextCommanderPrinting = (profileIndex = 0) => {
    showNextPrinting(profileIndex);
  };

  const showPreviousCommanderPrinting = (profileIndex = 0) => {
    showPreviousPrinting(profileIndex);
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
    decklistExport,
    decklistCopied,
    mainContentRef,
    controlPanelOpen,
    utilityTrayOpen,
    commanderSelection,
    commanderProfiles,
    commanderSpotlightLoading,
    commanderSpotlightBackdropUrl,
    canonicalEdhrecHref,
    hasCommander,
    hasCsvData,
    hasDecklist,
    decklistSectionCount,
    csvCount,
    inventorySummary,
    collectionModeLabel,
    collectionModeHint,
    collectionSourceName: csvSourceName,
    collectionImportedAt: csvImportedAt,
    nextStepLabel,
    exportHelperText,
    filterOptions,
    focusWorkspace,
    openUploadModal,
    clearUploadedCollection,
    openControlPanel,
    closeControlPanel,
    toggleControlPanel,
    openUtilityTray,
    closeUtilityTray,
    toggleUtilityTray,
    browseRailOpen: controlPanelOpen,
    openBrowseRail: openControlPanel,
    closeBrowseRail: closeControlPanel,
    toggleBrowseRail: toggleControlPanel,
    handleDecklistUpdate,
    handleSelectionChange,
    copyDecklistFromHeader,
    downloadDecklistFromHeader,
    showNextCommanderPrinting,
    showPreviousCommanderPrinting,
    setOwnedFilter,
  };
};
