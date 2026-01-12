<template>
  <section class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Commander
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
          class="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
          aria-label="Clear commander selection"
          @click="clearSelection('primary')"
        >
          Reset
        </button>
        <button
          v-if="primarySelection"
          type="button"
          class="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          :aria-expanded="showDetails ? 'true' : 'false'"
          @click="toggleDetails"
        >
          {{ showDetails ? "Collapse" : "Details" }}
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-show="showDetails" class="mt-4 space-y-4">
        <GlobalLoadingBanner
          scope="commander-search"
          inline
          placementClass="flex justify-start text-xs"
        >
          Searching commanders...
        </GlobalLoadingBanner>

        <div class="grid gap-4 lg:grid-cols-2">
          <div class="space-y-2">
            <label
              for="primary-commander-search"
              class="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]"
            >
              Primary commander
            </label>
            <div class="flex gap-2">
              <div
                class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-base text-[color:var(--text)] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4 text-[color:var(--muted)]" fill="currentColor" aria-hidden="true">
                  <path d="M9.5 3A6.5 6.5 0 0116 9.5a6.47 6.47 0 01-1.17 3.72l5.47 5.47-1.06 1.06-5.47-5.47A6.47 6.47 0 019.5 16 6.5 6.5 0 113 9.5 6.5 6.5 0 019.5 3m0 2A4.5 4.5 0 005 9.5 4.5 4.5 0 109.5 5z" />
                </svg>
                <input
                  id="primary-commander-search"
                  v-model="primaryQuery"
                  type="text"
                  placeholder="Atraxa, Grand Unifier..."
                  aria-label="Search primary commander"
                  :aria-describedby="primaryError ? 'primary-helper-text primary-error-text' : 'primary-helper-text'"
                  class="w-full bg-transparent text-base text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none"
                />
              </div>
              <button
                v-if="primarySelection"
                type="button"
                class="rounded-xl border border-[color:var(--border)] px-3 text-sm font-medium text-[color:var(--text)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
                aria-label="Clear primary commander selection"
                @click="clearSelection('primary')"
              >
                Clear
              </button>
            </div>
            <p id="primary-helper-text" class="text-xs text-[color:var(--muted)]">
              Select the main deck commander.
            </p>
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
              background="bg-[color:var(--surface-muted)]"
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
            <div class="mt-3 flex items-center gap-2">
              <input
                id="has-partner-toggle"
                v-model="hasPartner"
                type="checkbox"
                class="h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              />
              <label
                for="has-partner-toggle"
                class="cursor-pointer text-sm text-[color:var(--text)]"
              >
                This commander has partner
              </label>
            </div>
          </div>

          <div v-show="hasPartner" class="space-y-2">
            <label
              for="partner-commander-search"
              class="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]"
            >
              Partner commander
            </label>
            <div class="flex gap-2">
              <div
                class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-base text-[color:var(--text)] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
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
                  aria-label="Search partner commander"
                  :aria-describedby="partnerDisabled ? 'partner-helper-text partner-warning-text' : (partnerError ? 'partner-helper-text partner-error-text' : 'partner-helper-text')"
                  :disabled="partnerDisabled"
                  class="w-full bg-transparent text-base text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none disabled:cursor-not-allowed"
                />
              </div>
              <button
                v-if="partnerSelection"
                type="button"
                class="rounded-xl border border-[color:var(--border)] px-3 text-sm font-medium text-[color:var(--text)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
                aria-label="Clear partner commander selection"
                @click="clearSelection('partner')"
              >
                Clear
              </button>
            </div>
            <p id="partner-helper-text" class="text-xs text-[color:var(--muted)]">
              Optional - add a partner to build a combined decklist.
            </p>
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
              background="bg-[color:var(--surface-muted)]"
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
    </Transition>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { getCard, searchCardNames } from "../api/scryfallApi";
import { Card, GlobalLoadingBanner, CommanderDisplay } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import { useGlobalNotices } from "../composables/useGlobalNotices";

const searchScope = "commander-search";

type CommanderOption = { id: string; name: string };

const { withLoading } = useGlobalLoading();
const { notifyError } = useGlobalNotices();

const emit = defineEmits<{
  "commander-selected": [slug: string];
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
const expanded = ref(true);

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

const showDetails = computed(() => {
  if (!primarySelection.value) {
    return true;
  }
  if (hasPartner.value && !partnerSelection.value) {
    return true;
  }
  return expanded.value;
});

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

const createSearchField = (label: string, disabled?: () => boolean) => {
  const query = ref("");
  const results = ref<CommanderOption[]>([]);
  const error = ref("");

  const performSearch = useDebounceFn(async (value: string) => {
    if (disabled?.()) {
      results.value = [];
      error.value = "";
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length <= 3) {
      results.value = [];
      error.value = "";
      return;
    }

    error.value = "";

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
        }
      },
      { immediate: false }
    );
  }

  return { label, query, results, error };
};

const primaryField = createSearchField("Primary");
const partnerField = createSearchField("Partner", () => partnerDisabled.value);

const primaryQuery = primaryField.query;
const primaryResults = primaryField.results;
const primaryError = primaryField.error;

const partnerQuery = partnerField.query;
const partnerResults = partnerField.results;
const partnerError = partnerField.error;

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
  if (!value) {
    expanded.value = true;
    return;
  }
  if (!hasPartner.value) {
    expanded.value = false;
  }
});

watch(partnerSelection, (value) => {
  void loadManaCost(value, partnerManaCost, partnerManaLoading, partnerManaRequestId);
  if (value && hasPartner.value) {
    expanded.value = false;
  }
});

watch(hasPartner, (value) => {
  if (!value && partnerSelection.value) {
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
  }
  if (value && primarySelection.value && !partnerSelection.value) {
    expanded.value = true;
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
    expanded.value = true;
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
  expanded.value = false;
};

watch(
  () => props.selectedSlug,
  (slug) => {
    hydrateFromSlug(slug);
  },
  { immediate: true }
);

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
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
    hasPartner.value = false;
    expanded.value = true;
  } else {
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
  }

  emitCommanderSelection();
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
  expanded.value = false;
};

const toggleDetails = () => {
  if (!primarySelection.value) {
    expanded.value = true;
    return;
  }
  expanded.value = !expanded.value;
};

defineExpose({
  selectPrimaryCommander,
});
</script>
