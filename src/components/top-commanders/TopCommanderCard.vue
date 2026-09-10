<template>
  <RouterLink :to="commanderLink" class="group block">
    <CSurface
      variant="panel"
      size="none"
      radius="lg"
      shadow="none"
      :background="highlightBackground"
      :border="highlightBorder"
      class="grid gap-3 p-3 transition hover:border-[color:var(--accent)] sm:grid-cols-[3.25rem,4rem,minmax(0,1fr),8rem,9rem] sm:items-center"
    >
      <div class="flex items-center justify-between gap-3 sm:block">
        <CText tag="p" variant="caption" tone="muted">Rank</CText>
        <CText tag="p" variant="title">#{{ commander.rank }}</CText>
      </div>

      <div class="h-20 w-14 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)] sm:h-20 sm:w-14">
        <div v-if="imageStack.length" class="relative h-full w-full">
          <img
            :src="imageStack[0]"
            :alt="commander.name"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <img
            v-if="imageStack.length > 1"
            :src="imageStack[1]"
            :alt="`${commander.name} partner`"
            class="absolute bottom-1 right-1 h-8 w-6 rounded-sm object-cover shadow-[var(--shadow-soft)]"
          />
        </div>
        <span
          v-else
          class="flex h-full items-center justify-center px-1 text-center text-xs text-[color:var(--muted)]"
        >
          {{ imageLoading ? "Loading" : "No image" }}
        </span>
      </div>

      <div class="min-w-0 space-y-1">
        <CText tag="p" variant="title" class="truncate group-hover:text-[color:var(--accent)]">
          {{ commander.name }}
        </CText>
        <div v-if="colors.length" class="flex flex-wrap items-center gap-1.5">
          <span
            v-for="color in colors"
            :key="`${commander.slug}-${color}`"
            class="inline-flex h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
            :class="colorDotClass(color)"
            :title="colorLabel(color)"
            :aria-label="colorLabel(color)"
          />
        </div>
      </div>

      <div class="text-sm sm:text-right">
        <CText tag="p" variant="caption" tone="muted">Decks</CText>
        <CText tag="p" variant="body" weight="semibold">
          {{ detailLabel }}
        </CText>
      </div>

      <div class="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm">
        <CText tag="p" variant="caption" tone="muted">Ownership</CText>
        <CText tag="p" variant="body" weight="semibold" :class="percentToneClass">
          {{ percentLabel }}
        </CText>
        <CText tag="p" variant="caption" tone="muted">
          {{ ownedSummary }}
        </CText>
      </div>
    </CSurface>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { CSurface, CText } from "../core";
import type { TopCommander } from "../../api/edhrecApi";
import type { CommanderScanResult } from "../../composables/useTopCommanderScan";
import { COLOR_IDENTITY_META, type CommanderColor } from "../../utils/colorIdentity";

type ScanResult = CommanderScanResult | null;

const props = defineProps<{
  commander: TopCommander;
  scanResult: ScanResult;
  hasCsvData: boolean;
  imageStack: string[];
  imageLoading: boolean;
  colors: CommanderColor[];
}>();

const numberFormatter = new Intl.NumberFormat("en-US");

const formatPercent = (value: number) => {
  const fixed = value.toFixed(1);
  const trimmed = fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
  return `${trimmed}%`;
};

const percentValue = computed(() => {
  if (!props.hasCsvData || !props.scanResult) {
    return null;
  }
  return Math.min(Math.max(props.scanResult.ownedPercent, 0), 100);
});

const percentLabel = computed(() => {
  if (!props.hasCsvData) {
    return "Unknown";
  }
  if (!props.scanResult) {
    return "Scanning";
  }
  return `${formatPercent(props.scanResult.ownedPercent)} owned`;
});

const percentToneClass = computed(() => {
  if (percentValue.value === null) {
    return "text-[color:var(--muted)]";
  }
  if (percentValue.value < 34) {
    return "text-rose-500";
  }
  if (percentValue.value < 67) {
    return "text-amber-500";
  }
  return "text-emerald-600";
});

const detailLabel = computed(() => `${numberFormatter.format(props.commander.deckCount)} decks`);

const ownedSummary = computed(() => {
  if (!props.hasCsvData) {
    return "Upload collection";
  }
  if (!props.scanResult) {
    return "Waiting for results";
  }
  return `${props.scanResult.ownedCards} of ${props.scanResult.totalCards}`;
});

const highlightBackground = computed(() => {
  const value = percentValue.value;
  if (value === null || value < 70) {
    return "bg-[color:var(--surface-strong)]";
  }
  return "bg-[color:var(--accent-soft)]";
});

const highlightBorder = computed(() => {
  const value = percentValue.value;
  if (value !== null && value >= 70) {
    return "border border-[color:var(--accent)]";
  }
  return "border border-[color:var(--border)]";
});

const commanderLink = computed(() => ({
  name: "commander",
  params: { slug: props.commander.slug },
  query: { pageType: "average-decks" },
}));

const colorDotClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.dot ?? "";
const colorLabel = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.label ?? color;
</script>
