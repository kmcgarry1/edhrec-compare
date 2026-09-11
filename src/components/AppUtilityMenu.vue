<template>
  <div>
    <CButton
      type="button"
      variant="secondary"
      size="sm"
      :aria-expanded="panelOpen ? 'true' : 'false'"
      :aria-controls="panelId"
      @click="openPanel"
    >
      Settings
    </CButton>

    <Teleport to="body">
      <div
        v-if="panelOpen"
        class="fixed inset-0 z-[80] bg-black/35 p-3 sm:p-6"
        role="presentation"
        @click.self="closePanel"
      >
        <section
          :id="panelId"
          ref="panelRef"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          class="ml-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[28rem] flex-col overflow-hidden rounded border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text)] shadow-[var(--shadow)] sm:max-h-[calc(100dvh-3rem)]"
          @escape-pressed="closePanel"
        >
          <header
            class="flex min-h-14 items-center justify-between gap-3 border-b border-[color:var(--border)] px-4 py-3"
          >
            <div>
              <h2 id="settings-title" class="text-base font-semibold">Settings</h2>
              <p class="text-xs text-[color:var(--muted)]">
                Display and accessibility preferences.
              </p>
            </div>
            <CButton type="button" variant="ghost" size="sm" @click="closePanel">Close</CButton>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4 text-sm">
            <section class="space-y-2" aria-labelledby="density-title">
              <h3 id="density-title" class="text-sm font-semibold">Density</h3>
              <div
                class="grid grid-cols-3 gap-1 rounded-[3px] border border-[color:var(--border)] bg-[color:var(--surface)] p-1 text-xs font-semibold text-[color:var(--muted)]"
                role="group"
                aria-label="Adjust layout density"
              >
                <button
                  v-for="option in densityOptions"
                  :key="option.value"
                  type="button"
                  class="min-h-11 rounded-[2px] px-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                  :class="
                    density === option.value
                      ? 'bg-[color:var(--accent)] text-[color:var(--accent-contrast)]'
                      : 'hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text)]'
                  "
                  :aria-pressed="density === option.value"
                  @click="setDensity(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </section>

            <section class="grid gap-2 sm:grid-cols-2" aria-label="Appearance">
              <button
                type="button"
                class="min-h-16 rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-left transition hover:border-[color:var(--accent)]"
                :aria-pressed="theme === 'dark'"
                @click="toggleTheme"
              >
                <span class="block text-xs font-semibold text-[color:var(--muted)]">Theme</span>
                <span class="mt-1 block text-sm font-semibold">
                  {{ theme === "dark" ? "Dark" : "Light" }}
                </span>
              </button>

              <button
                type="button"
                class="min-h-16 rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-left transition hover:border-[color:var(--accent)]"
                :aria-pressed="backgroundEnabled"
                @click="toggleBackground"
              >
                <span class="block text-xs font-semibold text-[color:var(--muted)]"
                  >Background texture</span
                >
                <span class="mt-1 block text-sm font-semibold">
                  {{ backgroundEnabled ? "On" : "Off" }}
                </span>
              </button>
            </section>

            <fieldset class="space-y-2">
              <legend class="text-sm font-semibold">Accessibility</legend>

              <label
                v-for="toggle in accessibilityToggles"
                :key="toggle.id"
                class="flex min-h-14 items-start gap-3 rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
              >
                <input
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                  :checked="toggle.checked"
                  @change="toggle.onChange(($event.target as HTMLInputElement).checked)"
                />
                <span>
                  <span class="block text-sm font-semibold">{{ toggle.label }}</span>
                  <span class="block text-xs text-[color:var(--muted)]">{{ toggle.help }}</span>
                </span>
              </label>
            </fieldset>

            <section class="space-y-2" aria-labelledby="text-size-title">
              <h3 id="text-size-title" class="text-sm font-semibold">Text size</h3>
              <div class="grid grid-cols-2 gap-2">
                <label
                  v-for="option in textScaleOptions"
                  :key="option.value"
                  class="flex min-h-11 items-center gap-2 rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm font-semibold"
                >
                  <input
                    type="radio"
                    :name="textScaleName"
                    :value="option.value"
                    class="h-4 w-4 border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                    :checked="preferences.textScale === option.value"
                    @change="setTextScale(option.value)"
                  />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </section>
          </div>

          <footer
            class="flex min-h-14 justify-between gap-3 border-t border-[color:var(--border)] px-4 py-3"
          >
            <CButton type="button" variant="ghost" size="sm" @click="resetPreferences"
              >Reset</CButton
            >
            <CButton type="button" variant="secondary" size="sm" @click="closePanel">Close</CButton>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import {
  textScaleOptions,
  useAccessibilityPreferences,
} from "../composables/useAccessibilityPreferences";
import { useBackgroundPreference } from "../composables/useBackgroundPreference";
import { useFocusTrap } from "../composables/useFocusTrap";
import { useLayoutDensity } from "../composables/useLayoutDensity";
import { useTheme } from "../composables/useTheme";
import { CButton } from "./core";

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

const panelRef = ref<HTMLElement | null>(null);
const panelOpen = ref(false);
const idBase = `settings-${Math.random().toString(36).slice(2, 9)}`;
const panelId = `${idBase}-panel`;
const textScaleName = `${idBase}-text-scale`;
const { activate, deactivate } = useFocusTrap(panelRef, panelOpen);

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

const openPanel = async () => {
  panelOpen.value = true;
  await nextTick();
  activate();
};

const closePanel = () => {
  panelOpen.value = false;
  deactivate();
};
</script>
