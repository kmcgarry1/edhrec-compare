<script setup lang="ts">
import { ref } from "vue";
import { Dashboard, GlobalNoticeStack, NebulaBackground } from "./components";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from "@vercel/analytics/vue";
const environment = ref<boolean>(import.meta.env.PROD);
</script>

<template>
  <SpeedInsights v-if="environment" />
  <Analytics v-if="environment" />
  <NebulaBackground />
  <Dashboard />
  <GlobalNoticeStack />
</template>

<style scoped></style>
