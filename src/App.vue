<script setup lang="ts">
import { ref, defineAsyncComponent } from "vue";
import { Dashboard, GlobalNoticeStack } from "./components";
import { useBackgroundPreference } from "./composables/useBackgroundPreference";

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
</script>

<template>
  <SpeedInsights v-if="environment" />
  <Analytics v-if="environment" />
  <NebulaBackground v-if="backgroundEnabled" />
  <Dashboard />
  <GlobalNoticeStack />
</template>

<style scoped></style>
