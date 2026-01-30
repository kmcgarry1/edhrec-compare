<template>
  <Card padding="p-4 sm:p-5" class="space-y-4">
    <div class="space-y-1">
      <p
        class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
      >
        Collection insights
      </p>
      <h2 class="text-lg font-semibold text-[color:var(--text)]">
        Top 50 commander scan
      </h2>
      <p class="text-sm text-[color:var(--muted)]">
        Compare your CSV against average decklists from EDHREC's
        {{ sourceLabel }}. No brackets, companions, or price filters applied.
      </p>
    </div>

    <div
      v-if="!hasCsvData"
      class="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--muted)]"
    >
      Upload a CSV to run this scan.
    </div>

    <div
      v-else-if="!isScoutMode"
      class="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--muted)]"
    >
      Choose "Top 50 scan" in the upload modal to run this comparison.
    </div>

    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-1.5 text-xs font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="handleRunScan"
        >
          {{ runButtonLabel }}
        </button>
        <span v-if="lastUpdated">
          Last updated {{ formattedLastUpdated }}
        </span>
        <span v-if="failedCount" class="text-[color:var(--warn)]">
          {{ failedCount }} commanders failed to load.
        </span>
      </div>

      <GlobalLoadingBanner
        :scope="scope"
        inline
        placement-class="w-full"
      >
        Scanning commander averages...
      </GlobalLoadingBanner>

      <div
        v-if="error"
        class="rounded-2xl border border-[color:var(--danger)] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]"
        role="status"
      >
        {{ error }}
      </div>

      <div
        v-if="results.length"
        class="grid gap-3 sm:grid-cols-2"
      >
        <div
          v-for="commander in results"
          :key="commander.slug"
          class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-[color:var(--text)]">
                #{{ commander.rank }} {{ commander.name }}
              </p>
              <p class="text-xs text-[color:var(--muted)]">
                {{ commander.ownedCards }} / {{ commander.totalCards }} cards owned
                | {{ formatCount(commander.deckCount) }} decks
              </p>
            </div>
            <div class="text-sm font-semibold text-[color:var(--text)]">
              {{ formatPercent(commander.ownedPercent) }}
            </div>
          </div>
          <div class="mt-3 h-2 w-full rounded-full bg-[color:var(--surface-muted)]">
            <div
              class="h-full rounded-full bg-[color:var(--accent)] transition-all duration-300"
              :style="{ width: `${Math.min(commander.ownedPercent, 100)}%` }"
              :aria-label="`Owned ${formatPercent(commander.ownedPercent)}`"
            />
          </div>
        </div>
      </div>

      <p
        v-else-if="!isLoading"
        class="text-sm text-[color:var(--muted)]"
      >
        {{
          failedCount
            ? "No commander lists could be loaded. Try the scan again."
            : "Run the scan to see how your collection matches each top commander."
        }}
      </p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { Card, GlobalLoadingBanner } from ".";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useCsvUploadMode } from "../composables/useCsvUploadMode";
import { useTopCommanderScan } from "../composables/useTopCommanderScan";

const { rows, headers } = useCsvUpload();
const { mode } = useCsvUploadMode();
const {
  results,
  lastUpdated,
  error,
  failedCount,
  sourceLabel,
  isLoading,
  scope,
  runScan,
  clearResults,
} = useTopCommanderScan();

const hasCsvData = computed(() => rows.value.length > 0);
const isScoutMode = computed(() => mode.value === "top-50");

const runButtonLabel = computed(() =>
  results.value.length ? "Refresh scan" : "Run scan"
);

const formatPercent = (value: number) => {
  const fixed = value.toFixed(1);
  const trimmed = fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
  return `${trimmed}%`;
};

const numberFormatter = new Intl.NumberFormat("en-US");
const formatCount = (value: number) => numberFormatter.format(value);

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) {
    return "";
  }
  return lastUpdated.value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const handleRunScan = () => {
  if (!hasCsvData.value) {
    return;
  }
  void runScan(rows.value, headers.value, { force: true });
};

watch(
  [rows, headers, isScoutMode],
  ([nextRows, nextHeaders, scout]) => {
    if (!nextRows.length) {
      clearResults();
      return;
    }
    if (!nextHeaders.length) {
      return;
    }
    if (!scout) {
      return;
    }
    void runScan(nextRows, nextHeaders);
  },
  { immediate: true }
);
</script>
