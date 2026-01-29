<template>
  <section>
    <Card
      as="section"
      padding="p-4 sm:p-6"
      rounded="rounded-3xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface)]"
      shadow="shadow-[var(--shadow)]"
      class="backdrop-blur space-y-6"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <p
            class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
          >
            Commander context
          </p>
          <h2 class="text-xl font-semibold text-[color:var(--text)]">
            Preview the chosen commander
          </h2>
          <p class="text-sm text-[color:var(--muted)]">
            This panel updates after you select a commander in Step 1 and keeps color identity visible.
          </p>
          <p class="text-xs text-[color:var(--muted)]">
            Status: {{ hasSelection ? "Commander selected." : "No commander selected yet." }}
          </p>
        </div>
      </div>

      <div
        class="grid gap-6 lg:grid-cols-2"
        :aria-live="hasSelection ? 'polite' : 'off'"
      >
        <CommanderDisplay
          v-if="hasSelection"
          :commanderName="primaryName"
          label="Primary Commander"
          description="Scryfall-powered preview for the current focus."
        />
        <CommanderDisplay
          v-if="hasSelection && partnerCommander"
          :commanderName="partnerName"
          label="Partner Commander"
          description="Optional partner preview shown outside the header."
        />
        <div
          v-if="!hasSelection"
          class="col-span-full rounded-3xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] p-6 text-center text-sm text-[color:var(--muted)]"
        >
          Choose a commander in the search panel to populate previews and color identity badges here.
        </div>
      </div>

      <div
        class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-inner"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Color Identity
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="color in commanderColorBadges"
            :key="color"
            class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            :class="colorPillClass(color)"
          >
            <span class="h-2 w-2 rounded-full" :class="colorDotClass(color)" aria-hidden="true"></span>
            {{ colorLabel(color) }}
          </span>
          <span
            v-if="!commanderColorBadges.length"
            class="text-xs text-[color:var(--muted)]"
          >
            Select a commander to see their color identity decoding.
          </span>
        </div>
      </div>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "./Card.vue";
import CommanderDisplay from "./CommanderDisplay.vue";
import { useCommanderColors } from "../composables/useCommanderColors";
import { COLOR_IDENTITY_META, COLOR_IDENTITY_ORDER, type CommanderColor } from "../utils/colorIdentity";

const props = defineProps<{
  primaryCommander?: string;
  partnerCommander?: string;
}>();

const { commanderColors } = useCommanderColors();

const hasSelection = computed(() => Boolean(props.primaryCommander));
const primaryName = computed(() => props.primaryCommander ?? "");
const partnerName = computed(() => props.partnerCommander ?? "");

const commanderColorBadges = computed(() => {
  const normalized = new Set(
    (commanderColors.value ?? [])
      .map((color) => color?.toUpperCase())
      .filter((value): value is CommanderColor => Boolean(value) && value in COLOR_IDENTITY_META)
  );
  return COLOR_IDENTITY_ORDER.filter((color) => normalized.has(color));
});

const colorPillClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.pill ?? "";
const colorDotClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.dot ?? "";
const colorLabel = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.label ?? color;
</script>
