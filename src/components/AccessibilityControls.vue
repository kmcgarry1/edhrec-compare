<template>
  <details
    ref="detailsRef"
    class="relative"
    @toggle="handleToggle"
    @keydown="handleKeydown"
  >
    <summary
      :aria-controls="panelId"
      :aria-expanded="panelOpen ? 'true' : 'false'"
      class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      Accessibility
    </summary>
    <div :id="panelId" class="absolute right-0 z-40 mt-2 w-[18rem] sm:w-80">
      <Card
        padding="p-4"
        rounded="rounded-2xl"
        border="border border-[color:var(--border)]"
        background="bg-[color:var(--surface)]"
        shadow="shadow-[var(--shadow-soft)]"
        class="space-y-4 text-sm text-[color:var(--text)]"
      >
        <div class="space-y-1">
          <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            Accessibility
          </p>
          <p class="text-xs text-[color:var(--muted)]">
            Preferences are saved locally on this device.
          </p>
        </div>

        <fieldset class="space-y-2">
          <legend class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Visibility
          </legend>
          <div class="flex items-start gap-2">
            <input
              :id="idFor('high-contrast')"
              data-testid="a11y-high-contrast"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              :aria-describedby="idFor('high-contrast-help')"
              :checked="preferences.highContrast"
              @change="handleToggleChange($event, setHighContrast)"
            />
            <div>
              <label :for="idFor('high-contrast')" class="font-semibold">
                High contrast mode
              </label>
              <p :id="idFor('high-contrast-help')" class="text-xs text-[color:var(--muted)]">
                Boosts contrast and removes background texture.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <input
              :id="idFor('link-underlines')"
              data-testid="a11y-link-underlines"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              :aria-describedby="idFor('link-underlines-help')"
              :checked="preferences.linkUnderlines"
              @change="handleToggleChange($event, setLinkUnderlines)"
            />
            <div>
              <label :for="idFor('link-underlines')" class="font-semibold">
                Always underline links
              </label>
              <p :id="idFor('link-underlines-help')" class="text-xs text-[color:var(--muted)]">
                Makes links easier to distinguish.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2">
            <input
              :id="idFor('focus-ring')"
              data-testid="a11y-focus-ring"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              :aria-describedby="idFor('focus-ring-help')"
              :checked="preferences.focusRing"
              @change="handleToggleChange($event, setFocusRing)"
            />
            <div>
              <label :for="idFor('focus-ring')" class="font-semibold">
                Enhanced focus indicators
              </label>
              <p :id="idFor('focus-ring-help')" class="text-xs text-[color:var(--muted)]">
                Adds a bold outline on focused controls.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Text
          </legend>
          <div class="space-y-2">
            <p class="text-xs text-[color:var(--muted)]">Text size</p>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="option in textScaleOptions"
                :key="option.value"
                class="flex items-center gap-2 rounded-xl border border-[color:var(--border)] px-2 py-1.5 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)]"
              >
                <input
                  :id="idFor(`text-scale-${option.value}`)"
                  data-testid="a11y-text-scale"
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
          <div class="flex items-start gap-2">
            <input
              :id="idFor('text-spacing')"
              data-testid="a11y-text-spacing"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              :aria-describedby="idFor('text-spacing-help')"
              :checked="preferences.textSpacing"
              @change="handleToggleChange($event, setTextSpacing)"
            />
            <div>
              <label :for="idFor('text-spacing')" class="font-semibold">
                Increase text spacing
              </label>
              <p :id="idFor('text-spacing-help')" class="text-xs text-[color:var(--muted)]">
                Adds more line, letter, and word spacing.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset class="space-y-2">
          <legend class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Motion
          </legend>
          <div class="flex items-start gap-2">
            <input
              :id="idFor('reduce-motion')"
              data-testid="a11y-reduce-motion"
              type="checkbox"
              class="mt-0.5 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
              :aria-describedby="idFor('reduce-motion-help')"
              :checked="preferences.reduceMotion"
              @change="handleToggleChange($event, setReduceMotion)"
            />
            <div>
              <label :for="idFor('reduce-motion')" class="font-semibold">
                Reduce motion
              </label>
              <p :id="idFor('reduce-motion-help')" class="text-xs text-[color:var(--muted)]">
                Minimizes animations and transitions.
              </p>
            </div>
          </div>
        </fieldset>

        <div class="flex items-center justify-between">
          <button
            type="button"
            class="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            data-testid="a11y-reset"
            @click="resetPreferences"
          >
            Reset
          </button>
        </div>
      </Card>
    </div>
  </details>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Card } from ".";
import {
  textScaleOptions,
  useAccessibilityPreferences,
} from "../composables/useAccessibilityPreferences";

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
const idBase = `a11y-${Math.random().toString(36).slice(2, 9)}`;
const panelId = `${idBase}-panel`;
const textScaleName = `${idBase}-text-scale`;

const idFor = (suffix: string) => `${idBase}-${suffix}`;

const handleToggle = (event: Event) => {
  const target = event.target as HTMLDetailsElement;
  panelOpen.value = target.open;
};

const closePanel = () => {
  if (!detailsRef.value) {
    return;
  }
  detailsRef.value.open = false;
  panelOpen.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || !panelOpen.value) {
    return;
  }
  event.preventDefault();
  closePanel();
  detailsRef.value?.querySelector("summary")?.focus();
};

const handleToggleChange = (
  event: Event,
  setter: (value: boolean) => void
) => {
  const target = event.target as HTMLInputElement;
  setter(target.checked);
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
