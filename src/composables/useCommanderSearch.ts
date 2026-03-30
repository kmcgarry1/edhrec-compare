import { computed, ref, watch, type Ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { getCard, searchCardNames } from "../api/scryfallApi";
import { useGlobalLoading } from "./useGlobalLoading";
import { useGlobalNotices } from "./useGlobalNotices";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import type { CommanderSelection } from "../types/edhrec";

export type CommanderOption = { id: string; name: string };

type CommanderSearchOptions = {
  selectedSlug: Ref<string | null | undefined>;
  selectedSelection?: Ref<CommanderSelection | null | undefined>;
  onCommanderSelected: (slug: string) => void;
  onSelectionChange: (payload: CommanderSelection) => void;
};

const RECENT_COMMANDERS_KEY = "commander-scout:recent-commanders";
const RECENT_COMMANDERS_LIMIT = 5;
const recentCommanders = ref<string[]>([]);
let recentInitialized = false;

const formatSlugForDisplay = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatManaCost = (value: string) => {
  if (!value) {
    return "";
  }
  const symbols = value.match(/\{[^}]+\}/g);
  if (!symbols) {
    return value;
  }
  return symbols.map((symbol) => symbol.replace(/[{}]/g, "")).join(" ");
};

const ensureRecentInitialized = () => {
  if (recentInitialized || typeof window === "undefined") {
    return;
  }
  try {
    const stored = window.localStorage.getItem(RECENT_COMMANDERS_KEY);
    if (!stored) {
      recentInitialized = true;
      return;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      recentCommanders.value = parsed
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .slice(0, RECENT_COMMANDERS_LIMIT);
    }
  } catch {
    recentCommanders.value = [];
  }
  recentInitialized = true;
};

const persistRecentCommanders = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    RECENT_COMMANDERS_KEY,
    JSON.stringify(recentCommanders.value.slice(0, RECENT_COMMANDERS_LIMIT))
  );
};

const rememberCommander = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    return;
  }
  ensureRecentInitialized();
  recentCommanders.value = [
    trimmed,
    ...recentCommanders.value.filter((existing) => existing !== trimmed),
  ].slice(0, RECENT_COMMANDERS_LIMIT);
  persistRecentCommanders();
};

export const useCommanderSearch = (options: CommanderSearchOptions) => {
  ensureRecentInitialized();

  const searchScope = "commander-search";
  const { withLoading } = useGlobalLoading();
  const { notifyError } = useGlobalNotices();

  const primarySelection = ref("");
  const partnerSelection = ref("");
  const hasPartner = ref(false);
  const partnerDisabled = computed(() => !primarySelection.value);

  const currentSlug = computed(() =>
    buildCommanderSlug(
      primarySelection.value,
      hasPartner.value ? partnerSelection.value : ""
    )
  );

  const primaryManaCost = ref("");
  const partnerManaCost = ref("");
  const primaryManaRequestId = ref<symbol | null>(null);
  const partnerManaRequestId = ref<symbol | null>(null);

  const summaryName = computed(() => {
    if (!primarySelection.value) {
      return "";
    }
    if (hasPartner.value && partnerSelection.value) {
      return `${primarySelection.value} + ${partnerSelection.value}`;
    }
    return primarySelection.value;
  });

  const summaryManaCost = computed(() => {
    if (!primarySelection.value) {
      return "";
    }
    const primaryCost = formatManaCost(primaryManaCost.value);
    const partnerCost = formatManaCost(partnerManaCost.value);
    if (hasPartner.value && partnerSelection.value) {
      const combined = [primaryCost, partnerCost].filter(Boolean).join(" + ");
      return combined || "...";
    }
    return primaryCost || "...";
  });

  const loadManaCost = async (
    commanderName: string,
    target: typeof primaryManaCost,
    requestRef: typeof primaryManaRequestId
  ) => {
    if (!commanderName) {
      target.value = "";
      return;
    }

    const requestId = Symbol("mana-cost");
    requestRef.value = requestId;

    try {
      const card = await getCard(commanderName);
      if (requestRef.value !== requestId) {
        return;
      }
      target.value = card?.mana_cost ?? "";
    } catch {
      if (requestRef.value === requestId) {
        target.value = "";
      }
    }
  };

  watch(primarySelection, (value) => {
    void loadManaCost(value, primaryManaCost, primaryManaRequestId);
  });

  watch(partnerSelection, (value) => {
    void loadManaCost(value, partnerManaCost, partnerManaRequestId);
  });

  const createSearchField = (label: string, disabled?: () => boolean) => {
    const query = ref("");
    const results = ref<CommanderOption[]>([]);
    const error = ref("");
    const loading = ref(false);

    const performSearch = useDebounceFn(async (value: string) => {
      if (disabled?.()) {
        results.value = [];
        error.value = "";
        loading.value = false;
        return;
      }

      const trimmed = value.trim();
      if (trimmed.length < 2) {
        results.value = [];
        error.value = "";
        loading.value = false;
        return;
      }

      error.value = "";
      loading.value = true;

      await withLoading(
        async () => {
          try {
            const commanders = await searchCardNames(trimmed);
            results.value = commanders.slice(0, 20).map((name, index) => ({
              id: `${label}-${index}-${name}`,
              name,
            }));
          } catch (err) {
            error.value =
              err instanceof Error ? err.message : "Failed to fetch commanders";
            results.value = [];
            notifyError(
              err instanceof Error ? err.message : "Failed to fetch commanders.",
              `${label} search failed`
            );
          } finally {
            loading.value = false;
          }
        },
        `Searching ${label.toLowerCase()} commanders...`,
        searchScope
      );
    }, 300);

    watch(query, (newValue) => {
      void performSearch(newValue);
    });

    if (disabled) {
      watch(
        disabled,
        (isDisabled) => {
          if (isDisabled) {
            query.value = "";
            results.value = [];
            error.value = "";
            loading.value = false;
          }
        },
        { immediate: false }
      );
    }

    return { query, results, error, loading };
  };

  const primaryField = createSearchField("Primary");
  const partnerField = createSearchField("Partner", () => partnerDisabled.value);

  const primaryQuery = primaryField.query;
  const primaryResults = primaryField.results;
  const primaryError = primaryField.error;
  const primaryLoading = primaryField.loading;

  const partnerQuery = partnerField.query;
  const partnerResults = partnerField.results;
  const partnerError = partnerField.error;
  const partnerLoading = partnerField.loading;

  const primaryRecentResults = computed<CommanderOption[]>(() =>
    recentCommanders.value
      .filter((name) => name !== primarySelection.value)
      .map((name, index) => ({
        id: `recent-primary-${index}-${name}`,
        name,
      }))
  );

  const clearPartnerState = () => {
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
    partnerError.value = "";
    partnerManaCost.value = "";
    partnerManaRequestId.value = null;
  };

  const hydrateFromSlug = (slug: string | null | undefined) => {
    if (!slug) {
      primarySelection.value = "";
      primaryQuery.value = "";
      primaryResults.value = [];
      hasPartner.value = false;
      clearPartnerState();
      return;
    }

    if (currentSlug.value === slug) {
      return;
    }

    const displayName = formatSlugForDisplay(slug);
    primarySelection.value = displayName;
    primaryQuery.value = displayName;
    primaryResults.value = [];
    hasPartner.value = false;
    clearPartnerState();
  };

  const hydrateFromSelection = (selection: CommanderSelection | null | undefined) => {
    if (!selection?.primary) {
      return false;
    }

    primarySelection.value = selection.primary;
    primaryQuery.value = selection.primary;
    primaryResults.value = [];
    primaryError.value = "";
    hasPartner.value = Boolean(selection.hasPartner);
    partnerSelection.value = selection.partner || "";
    partnerQuery.value = selection.partner || "";
    partnerResults.value = [];
    partnerError.value = "";
    return true;
  };

  if (options.selectedSelection) {
    watch(
      () => options.selectedSelection?.value,
      (selection) => {
        if (hydrateFromSelection(selection)) {
          return;
        }
        if (!selection?.primary) {
          hydrateFromSlug(options.selectedSlug.value);
        }
      },
      { immediate: true }
    );
  }

  watch(
    () => options.selectedSlug.value,
    (slug) => {
      if (options.selectedSelection?.value?.primary) {
        return;
      }
      hydrateFromSlug(slug);
    },
    { immediate: true }
  );

  watch(hasPartner, (value) => {
    if (value) {
      return;
    }
    if (
      partnerSelection.value ||
      partnerQuery.value ||
      partnerResults.value.length ||
      partnerError.value ||
      partnerManaCost.value
    ) {
      clearPartnerState();
      emitCommanderSelection();
    }
  });

  watch([primarySelection, partnerSelection, hasPartner], () => {
    options.onSelectionChange({
      primary: primarySelection.value,
      partner: partnerSelection.value,
      hasPartner: hasPartner.value,
    });
  });

  const emitCommanderSelection = () => {
    if (!primarySelection.value) {
      options.onCommanderSelected("");
      return;
    }

    options.onCommanderSelected(currentSlug.value);
  };

  const handleSelection = (field: "primary" | "partner", commanderName: string) => {
    if (field === "primary") {
      const name = commanderName.trim();
      primarySelection.value = name;
      primaryQuery.value = name;
      primaryResults.value = [];
      primaryError.value = "";
      hasPartner.value = false;
      clearPartnerState();
      rememberCommander(name);
    } else {
      const name = commanderName.trim();
      hasPartner.value = true;
      partnerSelection.value = name;
      partnerQuery.value = name;
      partnerResults.value = [];
      partnerError.value = "";
    }

    emitCommanderSelection();
  };

  const clearSelection = (field: "primary" | "partner") => {
    if (field === "primary") {
      primarySelection.value = "";
      primaryQuery.value = "";
      primaryResults.value = [];
      primaryError.value = "";
      hasPartner.value = false;
      clearPartnerState();
    } else {
      hasPartner.value = false;
      clearPartnerState();
    }

    emitCommanderSelection();
  };

  const clearSearch = (field: "primary" | "partner") => {
    if (field === "primary") {
      if (primarySelection.value) {
        clearSelection("primary");
        return;
      }
      primaryQuery.value = "";
      primaryResults.value = [];
      primaryError.value = "";
      return;
    }

    if (partnerSelection.value) {
      clearSelection("partner");
      return;
    }
    partnerQuery.value = "";
    partnerResults.value = [];
    partnerError.value = "";
  };

  const selectPrimaryCommander = (commanderName: string) => {
    const name = commanderName.trim();
    primarySelection.value = name;
    primaryQuery.value = name;
    primaryResults.value = [];
    primaryError.value = "";
    hasPartner.value = false;
    clearPartnerState();
    rememberCommander(name);
    emitCommanderSelection();
  };

  const addPartner = () => {
    hasPartner.value = true;
  };

  const removePartner = () => {
    hasPartner.value = false;
    clearPartnerState();
    emitCommanderSelection();
  };

  return {
    primarySelection,
    partnerSelection,
    hasPartner,
    partnerDisabled,
    summaryName,
    summaryManaCost,
    primaryQuery,
    primaryResults,
    primaryRecentResults,
    primaryError,
    primaryLoading,
    partnerQuery,
    partnerResults,
    partnerError,
    partnerLoading,
    handleSelection,
    clearSelection,
    clearSearch,
    selectPrimaryCommander,
    addPartner,
    removePartner,
  };
};
