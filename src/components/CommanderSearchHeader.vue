<template>
  <section class="sticky top-4 z-40 mb-6">
    <Card
      as="header"
      padding="p-4 sm:p-6"
      rounded="rounded-3xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface)]"
      shadow="shadow-[var(--shadow)]"
      class="backdrop-blur space-y-5"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent)]">
            Commander Finder
          </p>
          <h1 class="text-2xl font-semibold text-[color:var(--text)]">Search & select a commander</h1>
        </div>
        <div
          class="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-2 py-1 shadow-inner"
        >
          <button
            type="button"
            class="rounded-full p-1.5 text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
            :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
            :title="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
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
          </button>
          <button
            type="button"
            class="rounded-full p-1.5 text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
            :aria-label="`${backgroundEnabled ? 'Hide' : 'Show'} nebula background`"
            :title="`${backgroundEnabled ? 'Hide' : 'Show'} nebula background`"
            @click="$emit('toggle-background')"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="backgroundEnabled ? mdiPalette : mdiPaletteOutline" />
            </svg>
          </button>
        </div>
      </div>

      <CommanderSearch
        class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-inner"
        @commander-selected="$emit('commander-selected', $event)"
        @selection-change="$emit('selection-change', $event)"
      />
    </Card>
  </section>
</template>

<script setup lang="ts">
import {
  mdiMoonWaningCrescent,
  mdiPalette,
  mdiPaletteOutline,
  mdiSunCompass,
} from "@mdi/js";
import { computed } from "vue";
import CommanderSearch from "./CommanderSearch.vue";
import Card from "./Card.vue";

type SelectionState = {
  primary: string;
  partner: string;
  hasPartner: boolean;
};

const props = defineProps<{
  theme: string;
  backgroundEnabled: boolean;
}>();

defineEmits<{
  "toggle-theme": [];
  "toggle-background": [];
  "commander-selected": [slug: string];
  "selection-change": [SelectionState];
}>();

const theme = computed(() => props.theme);
const backgroundEnabled = computed(() => props.backgroundEnabled);
</script>
