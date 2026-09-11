<template>
  <RouterLink :to="commanderLink" class="group block">
    <CSurface
      variant="panel"
      size="none"
      radius="lg"
      shadow="none"
      :background="highlightBackground"
      :border="highlightBorder"
      class="h-full overflow-hidden transition hover:border-[color:var(--accent)]"
    >
      <div class="relative aspect-[16/10] bg-[color:var(--surface-muted)]">
        <div v-if="imageStack.length" class="relative h-full w-full">
          <img :src="imageStack[0]" :alt="commander.name" class="h-full w-full object-cover" />
          <img
            v-if="imageStack.length > 1"
            :src="imageStack[1]"
            :alt="`${commander.name} partner`"
            class="absolute bottom-3 right-3 h-24 w-16 rounded border border-[color:var(--surface)] object-cover"
          />
        </div>
        <span
          v-else
          class="flex h-full items-center justify-center px-4 text-center text-sm text-[color:var(--muted)]"
        >
          {{ imageLoading ? "Loading" : "No image" }}
        </span>

        <div
          class="absolute left-3 top-3 rounded border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-2 py-1"
        >
          <CText tag="p" variant="caption" tone="muted">Rank</CText>
          <CText tag="p" variant="title" class="text-lg leading-none">#{{ commander.rank }}</CText>
        </div>
      </div>

      <div class="space-y-4 p-4">
        <div class="min-w-0 space-y-2">
          <CText
            tag="p"
            variant="title"
            class="text-xl leading-tight group-hover:text-[color:var(--accent)]"
          >
            {{ commander.name }}
          </CText>
          <div v-if="colors.length" class="flex flex-wrap items-center gap-1.5">
            <span
              v-for="color in colors"
              :key="`${commander.slug}-${color}`"
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/20 text-[0.65rem] font-bold leading-none text-black/75"
              :class="colorDotClass(color)"
              :title="colorLabel(color)"
              :aria-label="colorLabel(color)"
            >
              {{ color }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 border-t border-[color:var(--border)] pt-3">
          <div>
            <CText tag="p" variant="caption" tone="muted">Decks</CText>
            <CText tag="p" variant="body" weight="semibold">
              {{ detailLabel }}
            </CText>
          </div>

          <div>
            <CText tag="p" variant="caption" tone="muted">Ownership</CText>
            <CText tag="p" variant="body" weight="semibold" :class="percentToneClass">
              {{ percentLabel }}
            </CText>
            <CText tag="p" variant="caption" tone="muted">
              {{ ownedSummary }}
            </CText>
          </div>
        </div>
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
  return "bg-[color:color-mix(in_srgb,var(--accent-soft)_58%,var(--surface-strong)_42%)]";
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
