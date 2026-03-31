<template>
  <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
    <div class="space-y-1">
      <CText tag="p" variant="eyebrow" tone="muted"> Display settings </CText>
      <CText tag="p" variant="title">Density, theme, and accessibility</CText>
      <CText tag="p" variant="helper" tone="muted">
        Tune the dashboard shell without interrupting commander search or results scanning.
      </CText>
    </div>

    <DashboardDisplaySettings
      :density="density"
      :density-options="densityOptions"
      :theme="theme"
      :background-enabled="backgroundEnabled"
      @density-change="emit('density-change', $event)"
      @toggle-theme="emit('toggle-theme')"
      @toggle-background="emit('toggle-background')"
    />
  </CSurface>
</template>

<script setup lang="ts">
import DashboardDisplaySettings from "./DashboardDisplaySettings.vue";
import { CSurface, CText } from "../core";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";

defineProps<{
  hasCsvData: boolean;
  inventorySummary: string;
  decklistText?: string | null;
  decklistSectionCount: number;
  exportHelperText: string;
  copied: boolean;
  density: Density;
  densityOptions: ReadonlyArray<{ value: Density; label: string }>;
  theme: Theme;
  backgroundEnabled: boolean;
}>();

const emit = defineEmits<{
  "open-upload": [];
  copy: [];
  download: [];
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
}>();
</script>
