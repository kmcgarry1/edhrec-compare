<template>
  <details ref="detailsRef" class="relative" @toggle="handleToggle" @keydown="handleKeydown">
    <summary
      :aria-controls="panelId"
      :aria-expanded="panelOpen ? 'true' : 'false'"
      class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      View
    </summary>

    <div :id="panelId" class="absolute right-0 z-40 mt-2 w-[21rem] max-w-[calc(100vw-2rem)]">
      <Card
        padding="p-4"
        rounded="rounded-[26px]"
        border="border border-[color:var(--border)]"
        background="bg-[color:var(--surface)]"
        shadow="shadow-[var(--shadow)]"
        class="space-y-4 text-sm text-[color:var(--text)]"
      >
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">View tools</p>
          <p class="text-xs text-[color:var(--muted)]">
            Density, theme, background, and accessibility preferences apply across the app.
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Density
          </p>
          <div
            class="inline-flex w-full items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.72rem] font-semibold text-[color:var(--muted)]"
            role="group"
            aria-label="Adjust layout density"
          >
            <button
              v-for="option in densityOptions"
              :key="option.value"
              type="button"
              class="flex-1 rounded-full px-2.5 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              :class="
                density === option.value
                  ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                  : 'hover:text-[color:var(--text)]'
              "
              :aria-pressed="density === option.value"
              @click="setDensity(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-left transition hover:border-[color:var(--accent)]"
            :aria-pressed="theme === 'dark'"
            @click="toggleTheme"
          >
            <p class="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Theme
            </p>
            <p class="mt-1 text-sm font-semibold text-[color:var(--text)]">
              {{ theme === "dark" ? "Dark" : "Light" }}
            </p>
          </button>

          <button
            type="button"
            class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-left transition hover:border-[color:var(--accent)]"
            :aria-pressed="backgroundEnabled"
            @click="toggleBackground"
          >
            <p class="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Backdrop
            </p>
            <p class="mt-1 text-sm font-semibold text-[color:var(--text)]">
              {{ backgroundEnabled ? "Enabled" : "Disabled" }}
            </p>
          </button>
        </div>

        <fieldset class="space-y-2">
          <legend class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Accessibility
          </legend>

          <label
            v-for="toggle in accessibilityToggles"
            :key="toggle.id"
            class="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2"
          >
            <input
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              :checked="toggle.checked"
              @change="toggle.onChange(($event.target as HTMLInputElement).checked)"
            />
            <span class="space-y-0.5">
              <span class="block text-sm font-semibold text-[color:var(--text)]">
                {{ toggle.label }}
              </span>
              <span class="block text-xs text-[color:var(--muted)]">
                {{ toggle.help }}
              </span>
            </span>
          </label>
        </fieldset>

        <div class="space-y-2">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Text size
          </p>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="option in textScaleOptions"
              :key="option.value"
              class="flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[color:var(--text)]"
            >
              <input
                type="radio"
                :name="textScaleName"
                :value="option.value"
                class="h-3.5 w-3.5 border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                :checked="preferences.textScale === option.value"
                @change="setTextScale(option.value)"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>
        </div>

        <div class="flex justify-between gap-3">
          <button
            type="button"
            class="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            @click="resetPreferences"
          >
            Reset
          </button>
          <button
            type="button"
            class="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent-strong)]"
            @click="closePanel"
          >
            Close
          </button>
        </div>
      </Card>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Card from "./Card.vue";
import { textScaleOptions, useAccessibilityPreferences } from "../composables/useAccessibilityPreferences";
import { useBackgroundPreference } from "../composables/useBackgroundPreference";
import { useLayoutDensity } from "../composables/useLayoutDensity";
import { useTheme } from "../composables/useTheme";

const { theme, toggleTheme } = useTheme();
const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
const { density, densityOptions, setDensity } = useLayoutDensity();
const {
  preferences,
  setReduceMotion,
  setHighContrast,
  setFocusRing,
  setLinkUnderlines,
  setTextScale,
  setTextSpacing,
  resetPreferences,
} = useAccessibilityPreferences();

const detailsRef = ref<HTMLDetailsElement | null>(null);
const panelOpen = ref(false);
const idBase = `view-menu-${Math.random().toString(36).slice(2, 9)}`;
const panelId = `${idBase}-panel`;
const textScaleName = `${idBase}-text-scale`;

const accessibilityToggles = computed(() => [
  {
    id: "high-contrast",
    label: "High contrast mode",
    help: "Boosts contrast and removes extra texture.",
    checked: preferences.highContrast,
    onChange: setHighContrast,
  },
  {
    id: "focus-ring",
    label: "Enhanced focus indicators",
    help: "Shows a stronger outline on focused controls.",
    checked: preferences.focusRing,
    onChange: setFocusRing,
  },
  {
    id: "link-underlines",
    label: "Always underline links",
    help: "Makes links easier to distinguish from body copy.",
    checked: preferences.linkUnderlines,
    onChange: setLinkUnderlines,
  },
  {
    id: "text-spacing",
    label: "Increase text spacing",
    help: "Adds more line, letter, and word spacing.",
    checked: preferences.textSpacing,
    onChange: setTextSpacing,
  },
  {
    id: "reduce-motion",
    label: "Reduce motion",
    help: "Minimizes animations and transitions.",
    checked: preferences.reduceMotion,
    onChange: setReduceMotion,
  },
]);

const closePanel = () => {
  if (!detailsRef.value) {
    return;
  }
  detailsRef.value.open = false;
  panelOpen.value = false;
};

const handleToggle = (event: Event) => {
  const target = event.target as HTMLDetailsElement;
  panelOpen.value = target.open;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || !panelOpen.value) {
    return;
  }
  event.preventDefault();
  closePanel();
  detailsRef.value?.querySelector("summary")?.focus();
};
</script>

<style scoped>
summary {
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}
</style>
