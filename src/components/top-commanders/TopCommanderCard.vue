<template>
  <RouterLink :to="commanderLink" class="group block h-full">
    <CSurface
      variant="content"
      size="sm"
      :background="highlightBackground"
      :border="highlightBorder"
      :class="highlightClass"
      class="flex h-full flex-col gap-4 overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
    >
      <div class="flex items-start justify-between gap-3">
        <CStack gap="xs">
          <CText tag="p" variant="overline" tone="muted" class="text-[0.65rem]">
            Rank #{{ commander.rank }}
          </CText>
          <CText tag="p" variant="body" weight="semibold" class="text-left text-base">
            {{ commander.name }}
          </CText>
        </CStack>

        <CSurface
          variant="utility"
          size="none"
          radius="pill"
          class="shrink-0 px-3 py-1.5 text-right"
        >
          <CText tag="p" variant="helper" tone="muted" class="uppercase tracking-[0.22em]">
            Owned
          </CText>
          <CText tag="p" variant="title" :class="percentToneClass">
            {{ percentValue !== null ? `${Math.round(percentValue)}%` : "--" }}
          </CText>
        </CSurface>
      </div>

      <div class="grid gap-3 sm:grid-cols-[5rem,minmax(0,1fr)]">
        <CSurface
          variant="muted"
          size="none"
          radius="xl"
          class="flex h-28 w-20 items-center justify-center overflow-hidden"
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
              class="absolute bottom-2 right-2 h-16 w-12 rounded-md object-cover shadow-[var(--shadow)]"
            />
          </div>
          <CText
            v-else
            tag="span"
            variant="helper"
            tone="muted"
          >
            {{ imageLoading ? "Loading..." : "No image" }}
          </CText>
        </CSurface>

        <CStack gap="sm" class="min-w-0">
          <CText tag="p" variant="title" :class="percentToneClass">
            {{ percentLabel }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ ownedSummary }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ detailLabel }}
          </CText>

          <div class="relative pt-1">
            <div
              class="h-2 w-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-80"
              aria-hidden="true"
            />
            <span
              v-if="percentValue !== null"
              class="absolute -top-0.5 h-5 w-1.5 -translate-x-1/2 rounded-full bg-[color:var(--surface)] shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--border)]"
              :style="{ left: `${percentValue}%` }"
              aria-hidden="true"
            />
          </div>
        </CStack>
      </div>

      <CText tag="p" variant="helper" tone="muted" class="mt-auto">
        Open commander route
      </CText>
    </CSurface>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { CStack, CSurface, CText } from "../core";
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
  return `${numberFormatter.format(props.commander.deckCount)} decks`;
});

const ownedSummary = computed(() => {
  if (!props.hasCsvData) {
    return "Upload a CSV to calculate ownership overlap.";
  }
  if (!props.scanResult) {
    return "Waiting for scan results.";
  }
  return `${props.scanResult.ownedCards} / ${props.scanResult.totalCards} cards owned`;
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
