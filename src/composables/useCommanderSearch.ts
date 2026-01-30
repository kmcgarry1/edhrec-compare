import { computed, ref, watch, type Ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { getCard, searchCardNames } from "../api/scryfallApi";
import { useGlobalLoading } from "./useGlobalLoading";
import { useGlobalNotices } from "./useGlobalNotices";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import type { CommanderSelection } from "../types/edhrec";

type CommanderOption = { id: string; name: string };

type CommanderSearchOptions = {
  selectedSlug: Ref<string | null | undefined>;
  onCommanderSelected: (slug: string) => void;
  onSelectionChange: (payload: CommanderSelection) => void;
};

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

export const useCommanderSearch = (options: CommanderSearchOptions) => {
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

  watch(hasPartner, (value) => {
    if (!value && partnerSelection.value) {
      partnerSelection.value = "";
      partnerQuery.value = "";
      partnerResults.value = [];
    }
  });

  const hydrateFromSlug = (slug: string | null | undefined) => {
    if (!slug) {
      primarySelection.value = "";
      primaryQuery.value = "";
      primaryResults.value = [];
      partnerSelection.value = "";
      partnerQuery.value = "";
      partnerResults.value = [];
      hasPartner.value = false;
      return;
    }

    if (currentSlug.value === slug) {
      return;
    }

    const displayName = formatSlugForDisplay(slug);
    primarySelection.value = displayName;
    primaryQuery.value = displayName;
    primaryResults.value = [];
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
    hasPartner.value = false;
  };

  watch(
    () => options.selectedSlug.value,
    (slug) => {
      hydrateFromSlug(slug);
    },
    { immediate: true }
  );

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

    const slug = buildCommanderSlug(
      primarySelection.value,
      partnerSelection.value
    );

    options.onCommanderSelected(slug);
  };

  const handleSelection = (field: "primary" | "partner", commanderName: string) => {
    if (field === "primary") {
      primarySelection.value = commanderName;
      primaryQuery.value = commanderName;
      primaryResults.value = [];
      partnerSelection.value = "";
      partnerQuery.value = "";
      partnerResults.value = [];
    } else {
      partnerSelection.value = commanderName;
      partnerQuery.value = commanderName;
      partnerResults.value = [];
    }

    emitCommanderSelection();
  };

  const clearSelection = (field: "primary" | "partner") => {
    if (field === "primary") {
      primarySelection.value = "";
      primaryQuery.value = "";
      primaryResults.value = [];
      primaryError.value = "";
      partnerSelection.value = "";
      partnerQuery.value = "";
      partnerResults.value = [];
      partnerError.value = "";
      hasPartner.value = false;
    } else {
      partnerSelection.value = "";
      partnerQuery.value = "";
      partnerResults.value = [];
      partnerError.value = "";
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
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
    hasPartner.value = false;
    emitCommanderSelection();
  };

  const addPartner = () => {
    hasPartner.value = true;
  };

  const removePartner = () => {
    hasPartner.value = false;
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
    partnerError.value = "";
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
