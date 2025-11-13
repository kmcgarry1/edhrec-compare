<script setup lang="ts">
import { Dashboard, GlobalNoticeStack } from "./components";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { Analytics } from "@vercel/analytics/vue";
</script>

<template>
  <SpeedInsights />
  <Dashboard />
  <GlobalNoticeStack />
  <Analytics />
</template>

<style scoped></style>
