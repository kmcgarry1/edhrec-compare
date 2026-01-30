<template>
  <RouterLink :to="commanderLink" class="group block h-full">
    <Card
      padding="p-4"
      :background="highlightBackground"
      :border="highlightBorder"
      class="flex h-full flex-col items-center gap-3 text-center transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
      :class="highlightClass"
    >
      <div class="space-y-1">
        <p class="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
          Rank #{{ commander.rank }}
        </p>
        <p class="text-sm font-semibold text-[color:var(--text)]">
          {{ commander.name }}
        </p>
      </div>
      <div class="flex flex-col items-center gap-2">
        <div
          class="flex h-52 w-36 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-[var(--shadow-soft)]"
        >
          <div v-if="imageStack.length" class="relative h-full w-full">
            <img
              :src="imageStack[0]"
              :alt="commander.name"
              class="absolute inset-0 h-full w-full object-cover"
            />
            <img
              v-if="imageStack.length > 1"
              :src="imageStack[1]"
              :alt="commander.name"
              class="absolute left-5 top-5 h-[85%] w-[85%] rounded-xl object-cover shadow-[var(--shadow)]"
            />
          </div>
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-xs text-[color:var(--muted)]"
          >
            {{ imageLoading ? "Loading..." : "No image" }}
          </div>
        </div>
        <div class="w-full space-y-2">
          <p class="text-sm font-semibold" :class="percentToneClass">
            {{ percentLabel }}
          </p>
          <div class="relative h-2 w-full rounded-full bg-[color:var(--surface-muted)]">
            <div
              class="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-80"
              aria-hidden="true"
            ></div>
            <span
              v-if="percentValue !== null"
              class="absolute -top-1.5 h-5 w-1.5 rounded-full bg-[color:var(--surface)] shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--border)]"
              :style="{ left: `${percentValue}%` }"
              aria-hidden="true"
            ></span>
          </div>
        </div>
      </div>
      <p class="text-xs text-[color:var(--muted)]">
        {{ detailLabel }}
      </p>
    </Card>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card } from "..";
import type { TopCommander } from "../../api/edhrecApi";
import type { CommanderScanResult } from "../../composables/useTopCommanderScan";

type ScanResult = CommanderScanResult | null;

const props = defineProps<{
  commander: TopCommander;
  scanResult: ScanResult;
  hasCsvData: boolean;
  imageStack: string[];
  imageLoading: boolean;
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
    return "Upload CSV";
  }
  if (!props.scanResult) {
    return "--";
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
  return "text-emerald-500";
});

const detailLabel = computed(() => {
  if (props.scanResult) {
    return `${props.scanResult.ownedCards} / ${props.scanResult.totalCards} cards | ${
      numberFormatter.format(props.commander.deckCount)
    } decks`;
  }
  return `${numberFormatter.format(props.commander.deckCount)} decks`;
});

const highlightBackground = computed(() => {
  const value = percentValue.value;
  if (value === null) {
    return "bg-[color:var(--surface)]";
  }
  if (value >= 90) {
    return "bg-[color:var(--accent)]";
  }
  if (value >= 70) {
    return "bg-[color:var(--accent-soft)]";
  }
  if (value >= 50) {
    return "bg-[color:var(--warn-soft)]";
  }
  if (value >= 30) {
    return "bg-[color:var(--surface-muted)]";
  }
  if (value >= 10) {
    return "bg-[color:var(--danger-soft)]";
  }
  return "bg-[color:var(--surface-muted)]";
});

const highlightBorder = computed(() => {
  const value = percentValue.value;
  if (value === null) {
    return "border border-[color:var(--border)]";
  }
  if (value >= 90) {
    return "border border-[color:var(--accent-strong)]";
  }
  if (value >= 70) {
    return "border border-[color:var(--accent)]";
  }
  if (value >= 50) {
    return "border border-[color:var(--warn)]";
  }
  if (value >= 30) {
    return "border border-[color:var(--border-strong)]";
  }
  if (value >= 10) {
    return "border border-[color:var(--danger)]";
  }
  return "border border-[color:var(--border)]";
});

const highlightClass = computed(() => {
  const value = percentValue.value;
  if (value !== null && value >= 70) {
    return "shadow-[0_0_0_1px_var(--accent),0_10px_25px_rgba(0,0,0,0.18)]";
  }
  return "";
});

const commanderLink = computed(() => ({
  name: "commander",
  params: { slug: props.commander.slug },
  query: { pageType: "average-decks" },
}));
</script>
