import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useTheme } from "./useTheme";
import { useOwnedFilter } from "./useOwnedFilter";
import { useCsvUpload } from "./useCsvUpload";
import { useCsvUploadMode } from "./useCsvUploadMode";
import { useBackgroundPreference } from "./useBackgroundPreference";
import { useLayoutDensity } from "./useLayoutDensity";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import type { CommanderSelection, DecklistPayload } from "../types/edhrec";
import type { DashboardTab, OwnedFilterOption, TabOption } from "../types/dashboard";

type NextStepAction = "search" | "collection" | "upload" | "export" | null;

export const useDashboardState = () => {
  const { theme, toggleTheme } = useTheme();
  const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
  const { rows: csvRows } = useCsvUpload();
  const { mode: csvUploadMode } = useCsvUploadMode();
  const { showOwned, setOwnedFilter } = useOwnedFilter();
  const { density, setDensity, densityOptions } = useLayoutDensity();

  const showUploadModal = ref(false);
  const decklistExport = ref<DecklistPayload | null>(null);
  const decklistCopied = ref(false);
  const mainContentRef = ref<HTMLElement | null>(null);
  const activeTab = ref<DashboardTab>("search");
  const commanderSelection = ref<CommanderSelection>({
    primary: "",
    partner: "",
    hasPartner: false,
  });
  const onboardingDismissed = ref(false);
  let decklistCopyHandle: ReturnType<typeof setTimeout> | null = null;

  const tabOptions: ReadonlyArray<TabOption> = [
    { id: "search", label: "Search" },
    { id: "collection", label: "Collection" },
    { id: "export", label: "Export" },
  ];

  const csvCount = computed(() => csvRows.value.length);
  const hasCsvData = computed(() => csvCount.value > 0);
  const hasCommander = computed(() => Boolean(commanderSelection.value.primary));
  const showOnboarding = computed(
    () => !onboardingDismissed.value && !hasCsvData.value
  );

  const setActiveTab = (tab: DashboardTab) => {
    activeTab.value = tab;
  };

  const jumpToTab = (tab: DashboardTab) => {
    activeTab.value = tab;
    nextTick(() => {
      mainContentRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
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
      return "search";
    }
    if (!hasCsvData.value) {
      return "upload";
    }
    if (!decklistExport.value) {
      return null;
    }
    if (!decklistExport.value.text) {
      return "collection";
    }
    return "export";
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
      case "search":
        return "Search commanders";
      case "upload":
        return "Upload CSV";
      case "collection":
        return "Adjust filter";
      case "export":
        return "Go to export";
      default:
        return null;
    }
  });

  const handleNextStepAction = () => {
    switch (nextStepAction.value) {
      case "search":
        jumpToTab("search");
        break;
      case "collection":
        jumpToTab("collection");
        break;
      case "upload":
        jumpToTab("collection");
        showUploadModal.value = true;
        break;
      case "export":
        jumpToTab("export");
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

  watch(hasCsvData, (value) => {
    if (value) {
      onboardingDismissed.value = true;
    }
  });

  const dismissOnboarding = () => {
    onboardingDismissed.value = true;
  };

  const openUploadModalFromOnboarding = () => {
    onboardingDismissed.value = true;
    showUploadModal.value = true;
  };

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
    activeTab,
    tabOptions,
    commanderSelection,
    showOnboarding,
    csvCount,
    inventorySummary,
    nextStepLabel,
    nextStepActionLabel,
    exportHelperText,
    filterOptions,
    setActiveTab,
    jumpToTab,
    handleNextStepAction,
    handleDecklistUpdate,
    handleSelectionChange,
    copyDecklistFromHeader,
    downloadDecklistFromHeader,
    setOwnedFilter,
    dismissOnboarding,
    openUploadModalFromOnboarding,
  };
};
