<template>
  <div class="sticky top-4 z-40 mb-6">
    <Card
      as="header"
      padding="p-3 sm:p-4"
      rounded="rounded-3xl"
      border="border border-slate-200/70 dark:border-slate-700/70"
      background="bg-white/95 dark:bg-slate-900/85"
      shadow="shadow-lg shadow-slate-900/10 dark:shadow-black/40"
      class="backdrop-blur flex flex-col gap-3 text-xs"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 text-[0.7rem]">
        <div class="flex flex-wrap items-baseline gap-2">
          <span class="uppercase tracking-[0.4em] text-emerald-500/80 dark:text-emerald-300/80">
            Toolkit
          </span>
          <h1 class="text-lg font-semibold normal-case tracking-tight text-slate-900 dark:text-white">
            Commander Scout
          </h1>
          <span class="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            CSV • EDHREC • Scryfall
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-slate-500 shadow-sm transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
            @click="$emit('collapse')"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiClose" />
            </svg>
            <span class="hidden sm:inline">Hide</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
            :aria-pressed="theme === 'dark'"
            @click="$emit('toggle-theme')"
          >
            <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="theme === 'dark' ? mdiSunCompass : mdiMoonWaningCrescent" />
            </svg>
            <span>{{ theme === "dark" ? "Light" : "Dark" }}</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
            :aria-pressed="backgroundEnabled"
            @click="$emit('toggle-background')"
          >
            <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="backgroundEnabled ? mdiPalette : mdiPaletteOutline" />
            </svg>
            <span>{{ backgroundEnabled ? "Hide BG" : "Show BG" }}</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/80 bg-emerald-50 px-3 py-1.5 text-[0.7rem] font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-500/10 dark:border-emerald-300/70 dark:bg-emerald-900/40 dark:text-emerald-200"
            @click="$emit('show-upload')"
          >
            <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiUploadOutline" />
            </svg>
            <span>Upload CSV</span>
          </button>
        </div>
      </div>
      <p class="text-[0.7rem] text-slate-600 dark:text-slate-300">
        Match your collection against live commander recommendations, then tag owned cards by uploading your CSV.
      </p>
      <div class="flex flex-wrap gap-2 text-[0.7rem] font-semibold">
        <button
          v-for="option in filterOptions"
          :key="option.label"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
          :class="option.active ? activeFilterClass : inactiveFilterClass"
          @click="$emit('set-owned', option.value)"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path :d="option.icon" />
          </svg>
          <span>{{ option.label }}</span>
        </button>
      </div>
      <DecklistExport
        :disabled="!decklistAvailable"
        :copied="decklistCopied"
        @copy="$emit('copy-decklist')"
        @download="$emit('download-decklist')"
      />
    </Card>
  </div>
</template>

<script setup lang="ts">
import {
  mdiUploadOutline,
  mdiMoonWaningCrescent,
  mdiSunCompass,
  mdiPalette,
  mdiPaletteOutline,
  mdiCardsOutline,
  mdiBookmarkOffOutline,
  mdiCheckDecagram,
  mdiClose,
} from "@mdi/js";
import { computed } from "vue";
import { Card, DecklistExport } from ".";

const props = defineProps<{
  theme: string;
  backgroundEnabled: boolean;
  showOwned: boolean | null;
  decklistAvailable: boolean;
  decklistCopied: boolean;
}>();

defineEmits<{
  "set-owned": [boolean | null];
  "toggle-theme": [];
  "toggle-background": [];
  "show-upload": [];
  collapse: [];
  "copy-decklist": [];
  "download-decklist": [];
}>();

const activeFilterClass =
  "border-emerald-500 bg-emerald-100 text-emerald-900 shadow-sm dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100";
const inactiveFilterClass =
  "border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300";

const filterOptions = computed(() => [
  { label: "Owned", value: true, icon: mdiCardsOutline, active: props.showOwned === true },
  { label: "Unowned", value: false, icon: mdiBookmarkOffOutline, active: props.showOwned === false },
  { label: "Show All", value: null, icon: mdiCheckDecagram, active: props.showOwned === null },
]);
</script>
