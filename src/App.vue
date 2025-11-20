<script setup lang="ts">
import { ref } from "vue";
import { Dashboard, GlobalNoticeStack, NebulaBackground } from "./components";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from "@vercel/analytics/vue";
import { useBackgroundPreference } from "./composables/useBackgroundPreference";

const environment = ref<boolean>(import.meta.env.PROD);
const { backgroundEnabled } = useBackgroundPreference();
</script>

<template>
  <SpeedInsights v-if="environment" />
  <Analytics v-if="environment" />
  <NebulaBackground v-if="backgroundEnabled" />
  <Dashboard />
  <GlobalNoticeStack />
</template>

<style scoped></style>
