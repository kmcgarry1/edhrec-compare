<template>
  <p class="text-sm text-[color:var(--muted)]">
    Adjust density, theme, and accessibility preferences.
  </p>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <span
        class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]"
      >
        Density
      </span>
      <div
        class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
        role="group"
        aria-label="Adjust layout density"
      >
        <button
          v-for="option in densityOptions"
          :key="option.value"
          type="button"
          class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :class="
            density === option.value
              ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
          "
          :aria-pressed="density === option.value"
          @click="emit('density-change', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
        :aria-pressed="theme === 'dark'"
        @click="emit('toggle-theme')"
      >
        <span
          class="uppercase tracking-[0.2em] text-[0.62rem] text-[color:var(--muted)]"
        >
          Theme
        </span>
        <span>{{ theme === "dark" ? "Dark" : "Light" }}</span>
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        :aria-label="`${backgroundEnabled ? 'Hide' : 'Show'} background texture`"
        :aria-pressed="backgroundEnabled"
        @click="emit('toggle-background')"
      >
        <span
          class="uppercase tracking-[0.2em] text-[0.62rem] text-[color:var(--muted)]"
        >
          Backdrop
        </span>
        <span>{{ backgroundEnabled ? "On" : "Off" }}</span>
      </button>
      <AccessibilityControls />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";
import AccessibilityControls from "../AccessibilityControls.vue";

defineProps<{
  density: Density;
  densityOptions: ReadonlyArray<{ value: Density; label: string }>;
  theme: Theme;
  backgroundEnabled: boolean;
}>();

const emit = defineEmits<{
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
}>();
</script>
