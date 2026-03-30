<template>
  <div class="space-y-4">
    <CSurface variant="dense" size="sm" class="space-y-3">
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <CText tag="p" variant="eyebrow" tone="muted"> Collection </CText>
          <CText tag="p" variant="title">
            {{ hasCsvData ? "Collection match active" : "CSV match pending" }}
          </CText>
        </div>
        <CButton type="button" variant="secondary" size="sm" @click="emit('open-upload')">
          {{ hasCsvData ? "Replace CSV" : "Upload CSV" }}
        </CButton>
      </div>
      <CText tag="p" variant="body" tone="muted">
        {{ inventorySummary }}
      </CText>
    </CSurface>

    <CSurface variant="dense" size="sm" class="space-y-3">
      <div class="space-y-1">
        <CText tag="p" variant="eyebrow" tone="muted"> Export </CText>
        <CText tag="p" variant="title"> Route decklist output </CText>
      </div>
      <CText tag="p" variant="helper" tone="muted">
        {{ exportHelperText }}
      </CText>
      <DecklistExport
        :disabled="!decklistText"
        :copied="copied"
        @copy="emit('copy')"
        @download="emit('download')"
      />
    </CSurface>

    <CSurface variant="dense" size="sm" class="space-y-3">
      <div class="space-y-1">
        <CText tag="p" variant="eyebrow" tone="muted"> Display </CText>
        <CText tag="p" variant="title"> Density, theme, and accessibility </CText>
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
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import DashboardDisplaySettings from "./DashboardDisplaySettings.vue";
import { CButton, CSurface, CText } from "../core";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";

const DecklistExport = defineAsyncComponent(() => import("../DecklistExport.vue"));

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
