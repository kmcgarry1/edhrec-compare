<template>
  <CSurface size="md">
    <CStack gap="md">
      <CInline align="start" justify="between" gap="md">
        <CStack gap="xs">
          <CText tag="p" variant="eyebrow" tone="muted">
            CSV Status
          </CText>
          <CText tag="p" variant="body" tone="muted">
            {{ statusLabel }}
          </CText>
        </CStack>

        <CInline gap="md" class="text-xs">
          <CText
            v-if="formattedLastUpdated"
            tag="span"
            variant="helper"
            tone="muted"
          >
            Last updated {{ formattedLastUpdated }}
          </CText>
          <CText
            v-if="failedCount"
            tag="span"
            variant="helper"
            tone="warn"
          >
            {{ failedCount }} commanders failed to load.
          </CText>
        </CInline>
      </CInline>

      <GlobalLoadingBanner :scope="scanScope" inline placement-class="w-full">
        Scanning commander averages...
      </GlobalLoadingBanner>

      <CNotice
        v-if="scanError"
        tone="danger"
        :message="scanError"
        role="alert"
        aria-live="assertive"
      />
    </CStack>
  </CSurface>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GlobalLoadingBanner from "../GlobalLoadingBanner.vue";
import { CInline, CNotice, CStack, CSurface, CText } from "../core";

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
