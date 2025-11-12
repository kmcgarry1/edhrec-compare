<template>
  <div class="space-y-4">
    <div>
      <p class="text-sm font-medium text-slate-600 dark:text-slate-300">
        Find commanders
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Pick a primary commander, then (optionally) add a partner to fetch the
        combined EDHREC page.
      </p>
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
        <label
          class="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          Primary commander
        </label>
        <div class="flex gap-2">
          <input
            v-model="primaryQuery"
            type="text"
            placeholder="Atraxa, Grand Unifier..."
            aria-label="Search primary commander"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 dark:border-slate-600/70 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
          />
          <button
            v-if="primarySelection"
            type="button"
            class="rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/60 dark:hover:text-rose-200"
            @click="clearSelection('primary')"
          >
            Clear
          </button>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Select the main deck commander.
        </p>
        <p v-if="primaryError" class="text-xs text-rose-600 dark:text-rose-300">
          {{ primaryError }}
        </p>
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
          <label
            for="has-partner-toggle"
            class="text-sm text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            This commander has partner
          </label>
        </div>
      </div>

      <div v-show="hasPartner" class="space-y-2">
        <label
          class="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
        >
          Partner commander (optional)
        </label>
        <div class="flex gap-2">
          <input
            v-model="partnerQuery"
            type="text"
            placeholder="Choose a partner..."
            aria-label="Search partner commander"
            :disabled="partnerDisabled"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600/70 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
          />
          <button
            v-if="partnerSelection"
            type="button"
            class="rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/60 dark:hover:text-rose-200"
            @click="clearSelection('partner')"
          >
            Clear
          </button>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Optional—add a partner to build a combined decklist.
        </p>
        <p
          v-if="partnerDisabled"
          class="text-xs text-amber-600 dark:text-amber-300"
        >
          Select a primary commander before choosing a partner.
        </p>
        <p
          v-else-if="partnerError"
          class="text-xs text-rose-600 dark:text-rose-300"
        >
          {{ partnerError }}
        </p>
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
import { Card, GlobalLoadingBanner } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { buildCommanderSlug } from "../utils/slugifyCommander";
import { CommanderDisplay } from ".";

const searchScope = "commander-search";

type CommanderOption = { id: string; name: string };

const { withLoading } = useGlobalLoading();

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
