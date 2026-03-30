<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { RouterView } from "vue-router";
import { AppShellHeader, GlobalNoticeStack, SiteNotice } from "./components";
import { useBackgroundPreference } from "./composables/useBackgroundPreference";
import { useUploadModal } from "./composables/useUploadModal";

const environment = ref<boolean>(import.meta.env.PROD);
const { backgroundEnabled } = useBackgroundPreference();

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
</script>

<template>
  <SpeedInsights v-if="environment" />
  <Analytics v-if="environment" />
  <NebulaBackground v-if="backgroundEnabled" />

  <div class="relative z-10 min-h-screen">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <AppShellHeader />
    <RouterView />

    <div class="mx-auto w-full max-w-7xl px-4 pb-6 pt-2 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10">
      <SiteNotice />
    </div>
  </div>

  <CsvUploadModal :open="uploadModalOpen" @close="closeUploadModal" />
  <GlobalNoticeStack />
</template>

<style scoped></style>
