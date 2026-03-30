<template>
  <Card variant="toolbar" padding="p-4 sm:p-5" rounded="rounded-[30px]" class="space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0 space-y-2">
        <CInline gap="sm" class="flex-wrap">
          <CBadge tone="default" variant="outline" size="sm" text-case="normal">
            Comparison workspace
          </CBadge>
          <CBadge
            :tone="hasCommander ? 'accent' : 'muted'"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            {{ hasCommander ? "Commander selected" : "Choose a commander" }}
          </CBadge>
          <CBadge
            :tone="hasCsvData ? 'success' : 'muted'"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            {{ hasCsvData ? `${csvCount} cards loaded` : "CSV pending" }}
          </CBadge>
        </CInline>

        <div class="space-y-1">
          <CText tag="p" variant="title" class="text-lg sm:text-xl">
            {{ nextStepLabel }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            Collection state, ownership lens, and export readiness stay attached to the results well
            instead of living in a detached side panel.
          </CText>
        </div>
      </div>

      <CInline gap="sm" class="flex-wrap lg:justify-end">
        <CButton
          type="button"
          variant="secondary"
          size="sm"
          class="xl:hidden"
          @click="emit('toggle-browse')"
        >
          {{ browseRailOpen ? "Hide browse" : "Browse commanders" }}
        </CButton>
        <CButton type="button" variant="soft" size="sm" @click="emit('toggle-utility')">
          {{ utilityDrawerOpen ? "Hide display" : "Display & accessibility" }}
        </CButton>
        <CButton
          v-if="nextStepActionLabel"
          type="button"
          variant="primary"
          size="sm"
          @click="emit('next-action')"
        >
          {{ nextStepActionLabel }}
        </CButton>
      </CInline>
    </div>

    <div class="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(18rem,0.95fr)]">
      <CSurface variant="dense" size="sm" class="space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CText tag="p" variant="eyebrow" tone="muted"> Collection lens </CText>
            <CText tag="p" variant="title"> CSV match state </CText>
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
          <CText tag="p" variant="eyebrow" tone="muted"> Ownership view </CText>
          <CText tag="p" variant="title"> Compare by collection match </CText>
        </div>
        <div
          class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.72rem] font-semibold text-[color:var(--muted)]"
          role="group"
          aria-label="Filter decklists by ownership"
        >
          <button
            v-for="option in filterOptions"
            :key="`workspace-filter-${option.label}`"
            type="button"
            class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            :class="
              option.active
                ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
            "
            :aria-pressed="option.active"
            @click="emit('filter-change', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <CText tag="p" variant="helper" tone="muted">
          {{ decklistSectionCount }} section{{ decklistSectionCount === 1 ? "" : "s" }} respond to
          the selected ownership lens.
        </CText>
      </CSurface>

      <CSurface variant="dense" size="sm" class="space-y-3">
        <div class="space-y-1">
          <CText tag="p" variant="eyebrow" tone="muted"> Export </CText>
          <CText tag="p" variant="title"> Decklist output </CText>
        </div>
        <CText tag="p" variant="helper" tone="muted">
          {{
            decklistText
              ? "Copy or download the current ownership lens directly from the comparison toolbar."
              : "Select a commander and adjust the ownership lens to generate exportable text."
          }}
        </CText>
        <DecklistExport
          :disabled="!decklistText"
          :copied="copied"
          @copy="emit('copy')"
          @download="emit('download')"
        />
      </CSurface>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <CSurface v-if="utilityDrawerOpen" variant="dense" size="sm" class="space-y-3">
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
    </Transition>
  </Card>
</template>

<script setup lang="ts">
import Card from "../Card.vue";
import DecklistExport from "../DecklistExport.vue";
import DashboardDisplaySettings from "./DashboardDisplaySettings.vue";
import { CBadge, CButton, CInline, CSurface, CText } from "../core";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";
import type { OwnedFilterOption, OwnedFilterValue } from "../../types/dashboard";

defineProps<{
  nextStepLabel: string;
  nextStepActionLabel?: string | null;
  hasCommander: boolean;
  hasCsvData: boolean;
  csvCount: number;
  inventorySummary: string;
  filterOptions: OwnedFilterOption[];
  decklistText?: string | null;
  decklistSectionCount: number;
  copied: boolean;
  density: Density;
  densityOptions: ReadonlyArray<{ value: Density; label: string }>;
  theme: Theme;
  backgroundEnabled: boolean;
  browseRailOpen: boolean;
  utilityDrawerOpen: boolean;
}>();

const emit = defineEmits<{
  "next-action": [];
  "open-upload": [];
  "filter-change": [value: OwnedFilterValue];
  copy: [];
  download: [];
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
  "toggle-browse": [];
  "toggle-utility": [];
}>();
</script>
