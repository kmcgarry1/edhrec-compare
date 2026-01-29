<template>
  <section class="surface-sheen rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Commander
        </span>
        <span v-if="primarySelection" class="text-sm text-[color:var(--muted)]">
          Selected:
        </span>
        <div v-if="primarySelection" class="flex flex-wrap items-center gap-2 text-sm">
          <span class="font-semibold text-[color:var(--text)]">
            {{ summaryName }}
          </span>
          <span class="text-xs font-mono text-[color:var(--muted)]">
            {{ summaryManaCost }}
          </span>
        </div>
        <span v-else class="text-sm text-[color:var(--muted)]">
          Search for a commander to start.
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="primarySelection"
          type="button"
          class="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
          aria-label="Clear commander selection"
          @click="clearSelection('primary')"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="mt-4 space-y-4">
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-2">
          <label
            for="primary-commander-search"
            class="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text)]"
          >
            Primary commander
          </label>
          <div class="flex">
            <div
              class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-base text-[color:var(--text)] shadow-[var(--shadow-soft)] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4 text-[color:var(--muted)]" fill="currentColor" aria-hidden="true">
                <path d="M9.5 3A6.5 6.5 0 0116 9.5a6.47 6.47 0 01-1.17 3.72l5.47 5.47-1.06 1.06-5.47-5.47A6.47 6.47 0 019.5 16 6.5 6.5 0 113 9.5 6.5 6.5 0 019.5 3m0 2A4.5 4.5 0 005 9.5 4.5 4.5 0 109.5 5z" />
              </svg>
              <input
                id="primary-commander-search"
                v-model="primaryQuery"
                type="text"
                placeholder="Atraxa, Grand Unifier..."
                aria-label="Primary commander"
                :aria-describedby="primaryError ? 'primary-helper-text primary-error-text' : 'primary-helper-text'"
                class="min-w-0 flex-1 bg-transparent text-base text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none"
              />
              <button
                v-if="primaryQuery || primarySelection"
                type="button"
                class="rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                aria-label="Clear primary commander search"
                @click="clearSearch('primary')"
              >
                Clear
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-[color:var(--muted)]">
            <p id="primary-helper-text">
              Type at least 2 characters to search.
            </p>
            <span v-if="primaryLoading">Searching...</span>
          </div>
          <p
            v-if="primaryError"
            id="primary-error-text"
            class="text-xs text-[color:var(--danger)]"
            role="alert"
          >
            {{ primaryError }}
          </p>
          <Card
            v-if="primaryResults.length"
            as="div"
            padding="p-0"
            rounded="rounded-xl"
            border="border border-[color:var(--border)]"
            background="bg-[color:var(--surface-strong)]"
            shadow="shadow-[var(--shadow-soft)]"
            class="max-h-64 overflow-y-auto"
            aria-live="polite"
          >
            <ul class="divide-y divide-[color:var(--border)]">
              <li
                v-for="option in primaryResults"
                :key="option.id"
                tabindex="0"
                class="cursor-pointer px-3.5 py-2.5 text-[color:var(--text)] transition hover:bg-[color:var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                @click="handleSelection('primary', option.name)"
                @keydown.enter="handleSelection('primary', option.name)"
                @keydown.space.prevent="handleSelection('primary', option.name)"
              >
                {{ option.name }}
              </li>
            </ul>
          </Card>
          <button
            v-if="primarySelection && !hasPartner"
            type="button"
            class="mt-1 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            @click="hasPartner = true"
          >
            Add partner
          </button>
          <button
            v-if="primarySelection && hasPartner"
            type="button"
            class="mt-1 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
            @click="removePartner"
          >
            Remove partner
          </button>
        </div>

        <div v-show="hasPartner" class="space-y-2">
          <label
            for="partner-commander-search"
            class="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text)]"
          >
            Partner commander
          </label>
          <div class="flex">
            <div
              class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-base text-[color:var(--text)] shadow-[var(--shadow-soft)] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
              :class="partnerDisabled ? 'opacity-60' : ''"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4 text-[color:var(--muted)]" fill="currentColor" aria-hidden="true">
                <path d="M12 13c2.7 0 5.8 1.29 6 3.89V19H6v-2.11C6.2 14.29 9.3 13 12 13m0-2a4 4 0 114-4 4 4 0 01-4 4m0 6c-3.33 0-8 1.66-8 5v2h16v-2c0-3.34-4.67-5-8-5z" />
              </svg>
              <input
                id="partner-commander-search"
                v-model="partnerQuery"
                type="text"
                placeholder="Choose a partner..."
                aria-label="Partner commander"
                :aria-describedby="partnerDisabled ? 'partner-helper-text partner-warning-text' : (partnerError ? 'partner-helper-text partner-error-text' : 'partner-helper-text')"
                :disabled="partnerDisabled"
                class="min-w-0 flex-1 bg-transparent text-base text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none disabled:cursor-not-allowed"
              />
              <button
                v-if="(partnerQuery || partnerSelection) && !partnerDisabled"
                type="button"
                class="rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                aria-label="Clear partner commander search"
                @click="clearSearch('partner')"
              >
                Clear
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-[color:var(--muted)]">
            <p id="partner-helper-text">
              Optional - add a partner for a combined decklist.
            </p>
            <span v-if="partnerLoading">Searching...</span>
          </div>
          <p
            v-if="partnerDisabled"
            id="partner-warning-text"
            class="text-xs text-[color:var(--warn)]"
            role="status"
          >
            Select a primary commander before choosing a partner.
          </p>
          <p
            v-else-if="partnerError"
            id="partner-error-text"
            class="text-xs text-[color:var(--danger)]"
            role="alert"
          >
            {{ partnerError }}
          </p>
          <Card
            v-if="partnerResults.length"
            as="div"
            padding="p-0"
            rounded="rounded-xl"
            border="border border-[color:var(--border)]"
            background="bg-[color:var(--surface-strong)]"
            shadow="shadow-[var(--shadow-soft)]"
            class="max-h-64 overflow-y-auto"
            aria-live="polite"
          >
            <ul class="divide-y divide-[color:var(--border)]">
              <li
                v-for="option in partnerResults"
                :key="option.id"
                tabindex="0"
                class="cursor-pointer px-3.5 py-2.5 text-[color:var(--text)] transition hover:bg-[color:var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                @click="handleSelection('partner', option.name)"
                @keydown.enter="handleSelection('partner', option.name)"
                @keydown.space.prevent="handleSelection('partner', option.name)"
              >
                {{ option.name }}
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <div v-if="primarySelection" class="grid gap-4 lg:grid-cols-2">
        <CommanderDisplay
          v-if="primarySelection"
          :commanderName="primarySelection"
          label="Primary Commander"
        />
        <CommanderDisplay
          v-if="partnerSelection"
          :commanderName="partnerSelection"
          label="Partner Commander"
        />
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { getCard, searchCardNames } from "../api/scryfallApi";
import { Card, CommanderDisplay } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import { useGlobalNotices } from "../composables/useGlobalNotices";

const searchScope = "commander-search";

type CommanderOption = { id: string; name: string };

const { withLoading } = useGlobalLoading();
const { notifyError } = useGlobalNotices();

type SelectionState = {
  primary: string;
  partner: string;
  hasPartner: boolean;
};

const emit = defineEmits<{
  "commander-selected": [slug: string];
  "selection-change": [state: SelectionState];
}>();

const props = defineProps<{
  selectedSlug?: string | null;
}>();

const formatSlugForDisplay = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const primarySelection = ref("");
const partnerSelection = ref("");
const hasPartner = ref(false);

const primaryManaCost = ref("");
const partnerManaCost = ref("");
const primaryManaLoading = ref(false);
const partnerManaLoading = ref(false);
const primaryManaRequestId = ref<symbol | null>(null);
const partnerManaRequestId = ref<symbol | null>(null);

const currentSlug = computed(() =>
  buildCommanderSlug(
    primarySelection.value,
    hasPartner.value ? partnerSelection.value : ""
  )
);

const partnerDisabled = computed(() => !primarySelection.value);

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

const emitSelectionChange = () => {
  emit("selection-change", {
    primary: primarySelection.value,
    partner: partnerSelection.value,
    hasPartner: hasPartner.value,
  });
};

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

  return { label, query, results, error, loading };
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

const loadManaCost = async (
  commanderName: string,
  target: typeof primaryManaCost,
  loadingRef: typeof primaryManaLoading,
  requestRef: typeof primaryManaRequestId
) => {
  if (!commanderName) {
    target.value = "";
    loadingRef.value = false;
    return;
  }

  const requestId = Symbol("mana-cost");
  requestRef.value = requestId;
  loadingRef.value = true;

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
  } finally {
    if (requestRef.value === requestId) {
      loadingRef.value = false;
    }
  }
};

watch(primarySelection, (value) => {
  void loadManaCost(value, primaryManaCost, primaryManaLoading, primaryManaRequestId);
});

watch(partnerSelection, (value) => {
  void loadManaCost(value, partnerManaCost, partnerManaLoading, partnerManaRequestId);
});

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
  () => props.selectedSlug,
  (slug) => {
    hydrateFromSlug(slug);
  },
  { immediate: true }
);

watch([primarySelection, partnerSelection, hasPartner], () => {
  emitSelectionChange();
});

const emitCommanderSelection = () => {
  if (!primarySelection.value) {
    emit("commander-selected", "");
    return;
  }

  const slug = buildCommanderSlug(
    primarySelection.value,
    partnerSelection.value
  );

  emit("commander-selected", slug);
};

const handleSelection = (
  field: "primary" | "partner",
  commanderName: string
) => {
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
const removePartner = () => {
  hasPartner.value = false;
  partnerSelection.value = "";
  partnerQuery.value = "";
  partnerResults.value = [];
  partnerError.value = "";
  emitCommanderSelection();
};

defineExpose({
  selectPrimaryCommander,
});
</script>
