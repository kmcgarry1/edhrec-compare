<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-1">
      <div class="inline-flex items-center gap-2">
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-emerald-500" fill="currentColor" aria-hidden="true">
          <path d="M12 1l3 4 4 1-3 3 .5 4.5L12 12l-4.5 1.5L8 9 5 6l4-1 3-4z" />
        </svg>
        <CText tag="span" variant="body" weight="semibold">
          Find commanders
        </CText>
      </div>
      <CText variant="helper" tone="muted">
        Pick a primary commander, then (optionally) add a partner to fetch the
        combined EDHREC page.
      </CText>
    </div>

    <GlobalLoadingBanner
      scope="commander-search"
      inline
      placementClass="flex justify-start text-xs"
    >
      Searching commanders...
    </GlobalLoadingBanner>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="space-y-2">
        <CText
          tag="label"
          variant="label"
          tone="default"
          class="text-slate-600 dark:text-slate-300"
        >
          Primary commander
        </CText>
        <div class="flex gap-2">
          <div class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-400/60 dark:border-slate-600/70 dark:bg-slate-900/80 dark:text-slate-100 dark:focus-within:border-emerald-400">
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-slate-400" fill="currentColor" aria-hidden="true">
              <path d="M9.5 3A6.5 6.5 0 0116 9.5a6.47 6.47 0 01-1.17 3.72l5.47 5.47-1.06 1.06-5.47-5.47A6.47 6.47 0 019.5 16 6.5 6.5 0 113 9.5 6.5 6.5 0 019.5 3m0 2A4.5 4.5 0 005 9.5 4.5 4.5 0 109.5 5z" />
            </svg>
            <input
              v-model="primaryQuery"
              type="text"
              placeholder="Atraxa, Grand Unifier..."
              aria-label="Search primary commander"
              class="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            v-if="primarySelection"
            type="button"
            class="rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/60 dark:hover:text-rose-200"
            @click="clearSelection('primary')"
          >
            Clear
          </button>
        </div>
        <CText variant="helper" tone="muted">
          Select the main deck commander.
        </CText>
        <CText
          v-if="primaryError"
          variant="helper"
          tone="danger"
        >
          {{ primaryError }}
        </CText>
        <Card
          v-if="primaryResults.length"
          as="div"
          padding="p-0"
          rounded="rounded-xl"
          border="border border-slate-200 dark:border-slate-700/70"
          background="bg-slate-50 dark:bg-slate-900/50"
          shadow="shadow-inner shadow-slate-900/5 dark:shadow-black/50"
          class="max-h-64 overflow-y-auto"
          aria-live="polite"
        >
          <ul class="divide-y divide-slate-200 dark:divide-slate-800/70">
            <li
              v-for="option in primaryResults"
              :key="option.id"
              tabindex="0"
              @click="handleSelection('primary', option.name)"
              @keydown.enter="handleSelection('primary', option.name)"
              @keydown.space.prevent="handleSelection('primary', option.name)"
              class="cursor-pointer px-4 py-3 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:focus-visible:ring-emerald-400/70"
            >
              {{ option.name }}
            </li>
          </ul>
        </Card>
        <CommanderDisplay
          v-if="primarySelection"
          class="mt-4"
          :commanderName="primarySelection"
          label="Primary Commander"
          description="Preview of the selected primary commander."
        />
        <div class="flex items-center gap-2 mt-4">
          <input
            id="has-partner-toggle"
            v-model="hasPartner"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-800"
          />
          <CText
            tag="label"
            for="has-partner-toggle"
            variant="body"
            tone="default"
            class="cursor-pointer text-sm text-slate-700 dark:text-slate-300"
          >
            This commander has partner
          </CText>
        </div>
      </div>

      <div v-show="hasPartner" class="space-y-2">
        <CText
          tag="label"
          variant="label"
          tone="default"
          class="text-slate-600 dark:text-slate-300"
        >
          Partner commander (optional)
        </CText>
        <div class="flex gap-2">
          <div
            class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-400/60 dark:border-slate-600/70 dark:bg-slate-900/80 dark:text-slate-100 dark:focus-within:border-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
            :class="partnerDisabled ? 'opacity-60' : ''"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-slate-400" fill="currentColor" aria-hidden="true">
              <path d="M12 13c2.7 0 5.8 1.29 6 3.89V19H6v-2.11C6.2 14.29 9.3 13 12 13m0-2a4 4 0 114-4 4 4 0 01-4 4m0 6c-3.33 0-8 1.66-8 5v2h16v-2c0-3.34-4.67-5-8-5z" />
            </svg>
            <input
              v-model="partnerQuery"
              type="text"
              placeholder="Choose a partner..."
              aria-label="Search partner commander"
              :disabled="partnerDisabled"
              class="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
          <button
            v-if="partnerSelection"
            type="button"
            class="rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/60 dark:hover:text-rose-200"
            @click="clearSelection('partner')"
          >
            Clear
          </button>
        </div>
        <CText variant="helper" tone="muted">
          Optional - add a partner to build a combined decklist.
        </CText>
        <CText
          v-if="partnerDisabled"
          variant="helper"
          tone="warn"
        >
          Select a primary commander before choosing a partner.
        </CText>
        <CText
          v-else-if="partnerError"
          variant="helper"
          tone="danger"
        >
          {{ partnerError }}
        </CText>
        <Card
          v-if="partnerResults.length"
          as="div"
          padding="p-0"
          rounded="rounded-xl"
          border="border border-slate-200 dark:border-slate-700/70"
          background="bg-slate-50 dark:bg-slate-900/50"
          shadow="shadow-inner shadow-slate-900/5 dark:shadow-black/50"
          class="max-h-64 overflow-y-auto"
          aria-live="polite"
        >
          <ul class="divide-y divide-slate-200 dark:divide-slate-800/70">
            <li
              v-for="option in partnerResults"
              :key="option.id"
              tabindex="0"
              @click="handleSelection('partner', option.name)"
              @keydown.enter="handleSelection('partner', option.name)"
              @keydown.space.prevent="handleSelection('partner', option.name)"
              class="cursor-pointer px-4 py-3 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:focus-visible:ring-emerald-400/70"
            >
              {{ option.name }}
            </li>
          </ul>
        </Card>
        <CommanderDisplay
          v-if="partnerSelection"
          class="mt-4"
          :commanderName="partnerSelection"
          label="Partner Commander"
          description="Optional partner preview."
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { searchCardNames } from "../api/scryfallApi";
import { Card, GlobalLoadingBanner, CommanderDisplay } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import { useGlobalNotices } from "../composables/useGlobalNotices";
import { CText } from "./core";

const searchScope = "commander-search";

type CommanderOption = { id: string; name: string };

const { withLoading } = useGlobalLoading();
const { notifyError } = useGlobalNotices();

const emit = defineEmits<{
  commanderSelected: [slug: string];
}>();

const primarySelection = ref("");
const partnerSelection = ref("");
const hasPartner = ref(false);

const partnerDisabled = computed(() => !primarySelection.value);

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

const emitCommanderSelection = () => {
  if (!primarySelection.value) {
    emit("commanderSelected", "");
    return;
  }

  const slug = buildCommanderSlug(
    primarySelection.value,
    partnerSelection.value
  );

  emit("commanderSelected", slug);
};

const handleSelection = (
  field: "primary" | "partner",
  commanderName: string
) => {
  if (field === "primary") {
    primarySelection.value = commanderName;
    primaryQuery.value = commanderName;
    primaryResults.value = [];
    // Reset partner selection when primary changes
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
  } else {
    partnerSelection.value = "";
    partnerQuery.value = "";
    partnerResults.value = [];
  }

  emitCommanderSelection();
};
</script>
