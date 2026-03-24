<template>
  <CSurface size="md">
    <CStack gap="md">
      <CStack gap="xs">
        <CText tag="p" variant="eyebrow" tone="muted">
          Collection insights
        </CText>
        <CText tag="h2" variant="title" class="text-lg">
          Top 50 commander scan
        </CText>
        <CText tag="p" variant="body" tone="muted">
          Compare your CSV against average decklists from EDHREC's
          {{ sourceLabel }}. No brackets, companions, or price filters applied.
        </CText>
      </CStack>

      <CNotice
        v-if="!hasCsvData"
        tone="info"
        message="Upload a CSV to run this scan."
        class="border-dashed bg-[color:var(--surface-muted)]"
      />

      <CNotice
        v-else-if="!isScoutMode"
        tone="info"
        message='Choose "Top 50 scan" in the upload modal to run this comparison.'
        class="border-dashed bg-[color:var(--surface-muted)]"
      />

      <CStack v-else gap="md">
        <CInline gap="md" class="text-xs">
          <CButton
            type="button"
            variant="primary"
            size="sm"
            :disabled="isLoading"
            @click="handleRunScan"
          >
            {{ runButtonLabel }}
          </CButton>
          <CText v-if="lastUpdated" tag="span" variant="helper" tone="muted">
            Last updated {{ formattedLastUpdated }}
          </CText>
          <CText v-if="failedCount" tag="span" variant="helper" tone="warn">
            {{ failedCount }} commanders failed to load.
          </CText>
        </CInline>

        <GlobalLoadingBanner
          :scope="scope"
          inline
          placement-class="w-full"
        >
          Scanning commander averages...
        </GlobalLoadingBanner>

        <CNotice
          v-if="error"
          tone="danger"
          :message="error"
        />

        <CGrid
          v-if="results.length"
          variant="halves"
          gap="md"
        >
          <CSurface
            v-for="commander in results"
            :key="commander.slug"
            variant="panel"
            size="sm"
          >
            <CStack gap="md">
              <CInline align="center" justify="between" gap="md">
                <CStack gap="xs">
                  <CText tag="p" variant="body" weight="semibold">
                    #{{ commander.rank }} {{ commander.name }}
                  </CText>
                  <CText tag="p" variant="helper" tone="muted">
                    {{ commander.ownedCards }} / {{ commander.totalCards }} cards owned
                    | {{ formatCount(commander.deckCount) }} decks
                  </CText>
                </CStack>
                <CText tag="span" variant="body" weight="semibold">
                  {{ formatPercent(commander.ownedPercent) }}
                </CText>
              </CInline>

              <CProgress
                :value="Math.min(commander.ownedPercent, 100)"
                size="md"
                aria-label="Owned percentage"
              />
            </CStack>
          </CSurface>
        </CGrid>

        <CText
          v-else-if="!isLoading"
          tag="p"
          variant="body"
          tone="muted"
        >
          {{
            failedCount
              ? "No commander lists could be loaded. Try the scan again."
              : "Run the scan to see how your collection matches each top commander."
          }}
        </CText>
      </CStack>
    </CStack>
  </CSurface>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import { CButton, CGrid, CInline, CNotice, CProgress, CStack, CSurface, CText } from "./core";
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
