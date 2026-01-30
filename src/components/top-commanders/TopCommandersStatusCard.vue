<template>
  <Card padding="p-4 sm:p-5" class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-1">
        <p
          class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
        >
          CSV Status
        </p>
        <p class="text-sm text-[color:var(--muted)]">
          {{ statusLabel }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
        <span v-if="formattedLastUpdated">
          Last updated {{ formattedLastUpdated }}
        </span>
        <span v-if="failedCount" class="text-[color:var(--warn)]">
          {{ failedCount }} commanders failed to load.
        </span>
      </div>
    </div>
    <GlobalLoadingBanner :scope="scanScope" inline placement-class="w-full">
      Scanning commander averages...
    </GlobalLoadingBanner>
    <div
      v-if="scanError"
      class="rounded-2xl border border-[color:var(--danger)] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]"
      role="status"
    >
      {{ scanError }}
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "../Card.vue";
import GlobalLoadingBanner from "../GlobalLoadingBanner.vue";

declare type MaybeDate = Date | null;

const props = defineProps<{
  hasCsvData: boolean;
  csvCount: number;
  lastUpdated: MaybeDate;
  failedCount: number;
  scanScope: string;
  scanError: string | null;
}>();

const statusLabel = computed(() => {
  if (!props.hasCsvData) {
    return "Upload a CSV to calculate owned percentages.";
  }
  const count = props.csvCount;
  return `${count} card${count === 1 ? "" : "s"} loaded.`;
});

const formattedLastUpdated = computed(() => {
  if (!props.lastUpdated) {
    return "";
  }
  return props.lastUpdated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>
