<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterView } from "vue-router";
import AppShellHeader from "./components/AppShellHeader.vue";
import GlobalNoticeStack from "./components/GlobalNoticeStack.vue";
import SiteNotice from "./components/SiteNotice.vue";
import { useBackgroundPreference } from "./composables/useBackgroundPreference";
import { useUploadModal } from "./composables/useUploadModal";
import { scheduleWhenPageIdle } from "./utils/idle";

const environment = import.meta.env.PROD;
const { backgroundEnabled } = useBackgroundPreference();
const telemetryReady = ref(false);

// Lazy load non-critical components
const NebulaBackground = defineAsyncComponent({
  loader: () => import("./components/NebulaBackground.vue"),
  delay: 200, // Wait 200ms before showing loading state
});

// Lazy load analytics components (non-critical)
const SpeedInsights = defineAsyncComponent(() =>
  import("@vercel/speed-insights/vue").then((m) => m.SpeedInsights)
);

const Analytics = defineAsyncComponent(() =>
  import("@vercel/analytics/vue").then((m) => m.Analytics)
);

const CsvUploadModal = defineAsyncComponent(() => import("./components/CsvUploadModal.vue"));
const { uploadModalOpen, closeUploadModal } = useUploadModal();

let cancelTelemetrySchedule: () => void = () => undefined;

onMounted(() => {
  if (!environment) {
    return;
  }

  cancelTelemetrySchedule = scheduleWhenPageIdle(() => {
    telemetryReady.value = true;
  }, 2500);
});

onBeforeUnmount(() => {
  cancelTelemetrySchedule();
});
</script>

<template>
  <SpeedInsights v-if="environment && telemetryReady" />
  <Analytics v-if="environment && telemetryReady" />
  <NebulaBackground v-if="backgroundEnabled" />

  <div class="relative z-10 min-h-screen">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppShellHeader />
    <RouterView />

    <div
      class="app-postscript mx-auto w-full max-w-7xl px-4 pb-6 pt-2 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10"
    >
      <SiteNotice />
    </div>
  </div>

  <CsvUploadModal v-if="uploadModalOpen" :open="uploadModalOpen" @close="closeUploadModal" />
  <GlobalNoticeStack />
</template>

<style scoped>
.app-postscript {
  content-visibility: auto;
  contain-intrinsic-size: 7rem;
}
</style>
