<template>
  <CommanderDataPanel
    :primary-commander="commanderSelection.primary"
    :partner-commander="commanderSelection.hasPartner ? commanderSelection.partner : undefined"
  />
  <Card
    id="collection-step"
    padding="p-4 sm:p-5"
    class="space-y-4"
    :aria-busy="hasCsvData ? 'false' : undefined"
  >
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
        Collection
      </p>
      <h2 class="text-lg font-semibold text-[color:var(--text)]">
        Upload your collection
      </h2>
      <p class="text-sm text-[color:var(--muted)]">
        {{ inventorySummary }}
      </p>
    </div>
    <button
      type="button"
      class="inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)]"
      @click="emit('open-upload')"
    >
      {{ hasCsvData ? "Replace CSV" : "Upload CSV" }}
    </button>
    <div class="space-y-2">
      <p class="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
        Filter decklists
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
    </div>
  </Card>
  <TopCommanderScanPanel />
  <Card padding="p-0" class="overflow-hidden">
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
import CommanderDataPanel from "../CommanderDataPanel.vue";
import TopCommanderScanPanel from "../TopCommanderScanPanel.vue";
import SiteNotice from "../SiteNotice.vue";
import DashboardDisplaySettings from "./DashboardDisplaySettings.vue";
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
