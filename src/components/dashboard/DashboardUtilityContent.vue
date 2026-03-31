<template>
  <div class="space-y-4">
    <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <CText tag="p" variant="eyebrow" tone="muted"> Collection utilities </CText>
            <CBadge
              :tone="hasCsvData ? 'accent' : 'muted'"
              variant="soft"
              size="sm"
              text-case="normal"
            >
              {{ hasCsvData ? "Collection loaded" : "CSV pending" }}
            </CBadge>
            <CBadge tone="muted" variant="outline" size="sm" text-case="normal">
              {{ collectionModeLabel }}
            </CBadge>
          </div>
          <CText tag="p" variant="title">
            {{ hasCsvData ? "Collection overlays are ready" : "Upload when you want collection overlays" }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ hasCsvData ? inventorySummary : collectionModeHint }}
          </CText>
        </div>

        <div class="flex flex-wrap gap-2">
          <CButton type="button" variant="primary" size="sm" @click="emit('open-upload')">
            {{ hasCsvData ? "Replace CSV" : "Upload CSV" }}
          </CButton>
          <CButton
            v-if="hasCsvData"
            type="button"
            variant="secondary"
            size="sm"
            @click="emit('clear-upload')"
          >
            Clear collection
          </CButton>
        </div>
      </div>

      <CText tag="p" variant="helper" tone="muted">
        {{ collectionSourceSummary }}
      </CText>
    </CSurface>

    <CSurface v-if="hasCommander" variant="utility" size="sm" radius="2xl" class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <CText tag="p" variant="eyebrow" tone="muted"> Export finish </CText>
        <CBadge
          :tone="decklistText ? 'accent' : 'muted'"
          variant="soft"
          size="sm"
          text-case="normal"
        >
          {{ decklistText ? "Decklist ready" : "Awaiting results" }}
        </CBadge>
      </div>

      <div class="space-y-1">
        <CText tag="p" variant="title">Copy or download the filtered list</CText>
        <CText tag="p" variant="helper" tone="muted">
          {{ exportHelperText }}
        </CText>
      </div>

      <DecklistExport
        :disabled="!decklistText"
        :copied="decklistCopied"
        @copy="emit('copy-decklist')"
        @download="emit('download-decklist')"
      />
    </CSurface>

    <DashboardSettingsContent
      :density="density"
      :density-options="densityOptions"
      :theme="theme"
      :background-enabled="backgroundEnabled"
      @density-change="emit('density-change', $event)"
      @toggle-theme="emit('toggle-theme')"
      @toggle-background="emit('toggle-background')"
    />

    <TopCommanderScanPanel />
    <SiteNotice />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import TopCommanderScanPanel from "../TopCommanderScanPanel.vue";
import SiteNotice from "../SiteNotice.vue";
import DecklistExport from "../DecklistExport.vue";
import DashboardSettingsContent from "./DashboardSettingsContent.vue";
import { CBadge, CButton, CSurface, CText } from "../core";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";

const props = withDefaults(
  defineProps<{
    hasCommander: boolean;
    hasCsvData: boolean;
    inventorySummary: string;
    collectionModeLabel: string;
    collectionModeHint: string;
    collectionSourceName?: string | null;
    collectionImportedAt?: Date | null;
    decklistText?: string | null;
    decklistCopied: boolean;
    exportHelperText: string;
    density: Density;
    densityOptions: ReadonlyArray<{ value: Density; label: string }>;
    theme: Theme;
    backgroundEnabled: boolean;
  }>(),
  {
    collectionSourceName: null,
    collectionImportedAt: null,
    decklistText: null,
  }
);

const emit = defineEmits<{
  "open-upload": [];
  "clear-upload": [];
  "copy-decklist": [];
  "download-decklist": [];
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
}>();

const collectionSourceSummary = computed(() => {
  if (!props.hasCsvData) {
    return "Open this tray whenever you need collection status, upload actions, or the top-50 scan.";
  }

  const parts: string[] = [];
  if (props.collectionSourceName) {
    parts.push(props.collectionSourceName);
  }
  if (props.collectionImportedAt) {
    try {
      parts.push(
        `loaded ${new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(props.collectionImportedAt)}`
      );
    } catch {
      parts.push(`loaded ${String(props.collectionImportedAt)}`);
    }
  }

  if (!parts.length) {
    return props.collectionModeHint;
  }

  return `${parts.join(" ")}.`;
});
</script>
