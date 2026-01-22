<template>
  <div class="sticky top-4 z-40 mb-6">
    <Card
      as="header"
      padding="p-3 sm:p-4"
      rounded="rounded-3xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface)]"
      shadow="shadow-[var(--shadow-soft)]"
      class="backdrop-blur flex flex-col gap-2.5 text-xs"
    >
      <div class="flex flex-wrap items-center justify-between gap-2 text-[0.72rem]">
        <div class="flex flex-wrap items-baseline gap-2">
          <span class="uppercase tracking-[0.4em] text-[color:var(--muted)]">
            Toolkit
          </span>
          <h1 class="text-lg font-semibold normal-case tracking-tight text-[color:var(--text)]">
            Commander Scout
          </h1>
          <span class="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-[color:var(--muted)]">
            CSV • EDHREC • Scryfall
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div
            class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-[0.7rem] font-semibold text-[color:var(--muted)]"
            role="group"
            aria-label="Adjust layout density"
          >
            <span class="hidden lg:inline uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Density
            </span>
            <div class="flex items-center gap-1">
              <button
                v-for="option in densityOptions"
                :key="option.value"
                type="button"
                class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                :class="
                  density === option.value
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                    : 'text-[color:var(--muted)] hover:text-[color:var(--accent)]'
                "
                :aria-pressed="density === option.value"
                @click="setDensity(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-[0.7rem] font-semibold text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            aria-label="Hide toolkit"
            @click="$emit('collapse')"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiClose" />
            </svg>
            <span class="hidden sm:inline">Hide</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-[0.7rem] font-semibold text-[color:var(--text)] shadow-sm transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
            :aria-pressed="theme === 'dark'"
            @click="$emit('toggle-theme')"
          >
            <Transition name="icon-flip" mode="out-in">
              <svg
                v-if="theme === 'dark'"
                key="sun"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="mdiSunCompass" />
              </svg>
              <svg
                v-else
                key="moon"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="mdiMoonWaningCrescent" />
              </svg>
            </Transition>
            <span>{{ theme === "dark" ? "Light" : "Dark" }}</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-[0.7rem] font-semibold text-[color:var(--text)] shadow-sm transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            :aria-label="`${backgroundEnabled ? 'Hide' : 'Show'} nebula background`"
            :aria-pressed="backgroundEnabled"
            @click="$emit('toggle-background')"
          >
            <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="backgroundEnabled ? mdiPalette : mdiPaletteOutline" />
            </svg>
            <span>{{ backgroundEnabled ? "Hide BG" : "Show BG" }}</span>
          </button>
          <AccessibilityControls />
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-3 py-1.5 text-[0.7rem] font-semibold text-[color:var(--text)] shadow-sm transition hover:border-[color:var(--accent-strong)]"
            aria-label="Upload CSV collection file"
            @click="$emit('show-upload')"
          >
            <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiUploadOutline" />
            </svg>
            <span>Upload CSV</span>
          </button>
        </div>
      </div>
      <p class="text-[0.75rem] leading-relaxed text-[color:var(--muted)]">
        Match your collection against live commander recommendations, then tag owned cards by uploading your CSV.
      </p>
      <div class="flex flex-wrap gap-2 text-[0.7rem] font-semibold" role="group" aria-label="Filter cards by ownership">
        <button
          v-for="option in filterOptions"
          :key="option.label"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :class="option.active ? activeFilterClass : inactiveFilterClass"
          :aria-label="`Show ${option.label.toLowerCase()} cards`"
          :aria-pressed="option.active"
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
import { computed, defineAsyncComponent } from "vue";
import { AccessibilityControls, Card } from ".";
import { useLayoutDensity } from "../composables/useLayoutDensity";

// Lazy load export component (only needed when decklist is available)
const DecklistExport = defineAsyncComponent(() =>
  import("./DecklistExport.vue")
);

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
  "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)] shadow-sm";
const inactiveFilterClass =
  "border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--accent)]";

const filterOptions = computed(() => [
  { label: "Owned", value: true, icon: mdiCardsOutline, active: props.showOwned === true },
  { label: "Unowned", value: false, icon: mdiBookmarkOffOutline, active: props.showOwned === false },
  { label: "Show All", value: null, icon: mdiCheckDecagram, active: props.showOwned === null },
]);

const { density, setDensity, densityOptions } = useLayoutDensity();
</script>
