<template>
  <Card
    id="collection-step"
    variant="utility"
    padding="p-4 sm:p-5"
    class="space-y-4"
    :aria-busy="hasCsvData ? 'false' : undefined"
  >
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <CBadge tone="muted" variant="outline" size="sm">
          Utility panel
        </CBadge>
        <CBadge
          v-if="commanderSelection.primary"
          tone="accent"
          variant="soft"
          size="sm"
          class="normal-case tracking-[0.08em]"
        >
          {{ commanderSelection.primary }}
        </CBadge>
      </div>
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
        Collection
      </p>
      <h2 class="text-lg font-semibold text-[color:var(--text)]">
        Inventory and filters
      </h2>
      <p class="text-sm text-[color:var(--muted)]">
        {{ inventorySummary }}
      </p>
    </div>

    <CNotice
      :tone="hasCsvData ? 'success' : 'info'"
      :message="hasCsvData ? 'Collection matching is active across the current commander route.' : 'Upload your collection to unlock owned and unowned cardlist views.'"
      :title="hasCsvData ? 'CSV ready' : 'CSV pending'"
      :class="hasCsvData ? '' : 'border-dashed bg-[color:var(--surface-muted)]'"
    />

    <CButton
      type="button"
      variant="primary"
      class="w-full"
      @click="emit('open-upload')"
    >
      {{ hasCsvData ? "Replace CSV" : "Upload CSV" }}
    </CButton>

    <CSurface variant="content" size="sm" class="space-y-3">
      <p class="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
        Decklist ownership filter
      </p>
      <div class="grid grid-cols-3 gap-2 text-[0.72rem] font-semibold">
        <button
          v-for="option in filterOptions"
          :key="option.label"
          type="button"
          class="rounded-xl border px-2 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :class="option.active ? activeFilterClass : inactiveFilterClass"
          :aria-label="`Show ${option.label.toLowerCase()} cards`"
          :aria-pressed="option.active"
          @click="emit('filter-change', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </CSurface>
  </Card>
  <Card variant="utility" padding="p-0" class="overflow-hidden">
    <details class="group">
      <summary
        class="cursor-pointer px-4 py-3 text-sm font-semibold text-[color:var(--text)]"
      >
        Top 50 scan
      </summary>
      <div class="px-4 pb-4">
        <TopCommanderScanPanel />
      </div>
    </details>
  </Card>
  <Card variant="utility" padding="p-0" class="overflow-hidden">
    <details class="group">
      <summary
        class="cursor-pointer px-4 py-3 text-sm font-semibold text-[color:var(--text)]"
      >
        Display settings
      </summary>
      <div class="space-y-4 px-4 pb-4">
        <DashboardDisplaySettings
          :density="density"
          :density-options="densityOptions"
          :theme="theme"
          :background-enabled="backgroundEnabled"
          @density-change="emit('density-change', $event)"
          @toggle-theme="emit('toggle-theme')"
          @toggle-background="emit('toggle-background')"
        />
      </div>
    </details>
  </Card>
  <SiteNotice />
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "../Card.vue";
import TopCommanderScanPanel from "../TopCommanderScanPanel.vue";
import SiteNotice from "../SiteNotice.vue";
import DashboardDisplaySettings from "./DashboardDisplaySettings.vue";
import { CBadge, CButton, CNotice, CSurface } from "../core";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";
import type { CommanderSelection } from "../../types/edhrec";
import type { OwnedFilterOption, OwnedFilterValue } from "../../types/dashboard";

const activeFilterClass =
  "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]";
const inactiveFilterClass =
  "border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]";

const emit = defineEmits<{
  "open-upload": [];
  "filter-change": [value: OwnedFilterValue];
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
}>();

const props = defineProps<{
  commanderSelection: CommanderSelection;
  csvCount: number;
  inventorySummary: string;
  filterOptions: OwnedFilterOption[];
  density: Density;
  densityOptions: ReadonlyArray<{ value: Density; label: string }>;
  theme: Theme;
  backgroundEnabled: boolean;
}>();

const hasCsvData = computed(() => props.csvCount > 0);
</script>
