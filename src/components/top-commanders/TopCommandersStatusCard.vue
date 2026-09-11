<template>
  <CSurface variant="utility" size="sm" radius="lg" shadow="none">
    <CStack gap="sm">
      <CInline align="center" justify="between" gap="md" class="flex-col sm:flex-row">
        <CStack gap="xs">
          <CText tag="p" variant="label" tone="muted">
            CSV Status
          </CText>
          <CText tag="p" variant="body" weight="semibold">
            {{ statusLabel }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            Ownership percentages appear on ranked rows after a collection scan.
          </CText>
        </CStack>

        <CInline v-if="formattedLastUpdated || failedCount" gap="md" class="text-xs flex-wrap">
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

      <GlobalLoadingBanner
        v-if="isScanVisible"
        :scope="scanScope"
        inline
        placement-class="w-full"
      >
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
import { useGlobalLoading } from "../../composables/useGlobalLoading";
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

const { getScopeLoading } = useGlobalLoading();
const isScanVisible = getScopeLoading(props.scanScope);

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
