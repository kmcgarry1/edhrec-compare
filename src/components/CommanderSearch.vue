<template>
  <Card
    role="search"
    as="section"
    rounded="rounded-2xl"
    class="w-full max-w-2xl text-slate-900 dark:text-slate-100"
  >
    <label
      class="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300"
    >
      Search commanders
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Teysa Karlov, Atraxa..."
        aria-label="Search Commanders"
        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 dark:border-slate-600/70 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400"
      />
    </label>

    <template v-if="isSearchLoading">
      <GlobalLoadingBanner scope="commander-search" class="mt-4">
        Searching commanders...
      </GlobalLoadingBanner>
    </template>
    <p v-else-if="error" class="mt-4 text-sm text-rose-600 dark:text-rose-300">
      Error: {{ error }}
    </p>

    <Card
      v-else
      as="div"
      padding="p-0"
      rounded="rounded-xl"
      border="border border-slate-200 dark:border-slate-700/70"
      background="bg-slate-50 dark:bg-slate-900/50"
      shadow="shadow-inner shadow-slate-900/5 dark:shadow-black/50"
      class="mt-4 max-h-72 overflow-y-auto"
      aria-live="polite"
    >
      <ul class="divide-y divide-slate-200 dark:divide-slate-800/70">
        <li
          v-for="commander in filteredCommanders"
          :key="commander.id"
          tabindex="0"
          @click="emitUpName(commander.name)"
          @keydown.enter="emitUpName(commander.name)"
          @keydown.space.prevent="emitUpName(commander.name)"
          class="cursor-pointer px-4 py-3 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:focus-visible:ring-emerald-400/70"
        >
          {{ commander.name }}
        </li>
      </ul>
    </Card>
  </Card>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { searchCardNames } from "../api/scryfallApi";
import { Card, GlobalLoadingBanner } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const searchScope = "commander-search";

const searchQuery = ref("");
const filteredCommanders = ref<Array<{ id: string; name: string }>>([]);
const error = ref("");

const { withLoading, getScopeLoading } = useGlobalLoading();
const isSearchLoading = getScopeLoading(searchScope);

const emit = defineEmits(["commanderSelected"]);

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (query.length <= 3) {
    filteredCommanders.value = [];
    error.value = "";
    return;
  }

  error.value = "";

  await withLoading(
    async () => {
      try {
        const commanders = await searchCardNames(query);
        filteredCommanders.value = commanders
          .slice(0, 20)
          .map((name, index) => ({ id: `${index}-${name}`, name }));
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to fetch commanders";
        filteredCommanders.value = [];
      }
    },
    "Searching commanders...",
    searchScope
  );
}, 300);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

function emitUpName(name: string) {
  emit("commanderSelected", name);
}
</script>
