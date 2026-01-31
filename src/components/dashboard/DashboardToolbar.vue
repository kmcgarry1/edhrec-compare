<template>
  <Card
    padding="p-4"
    rounded="rounded-3xl"
    border="border border-[color:var(--border)]"
    background="bg-[color:var(--surface-strong)]"
    shadow="shadow-[var(--shadow)]"
    class="backdrop-blur-sm"
  >
    <div class="grid gap-3 lg:grid-cols-[1fr,auto] lg:items-center">
      <div class="flex flex-wrap items-center gap-3">
        <div class="space-y-1">
          <p
            class="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
          >
            Next step
          </p>
          <p class="text-sm font-semibold text-[color:var(--text)]">
            {{ nextStepLabel }}
          </p>
        </div>
        <button
          v-if="nextStepActionLabel"
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105"
          @click="emit('next-action')"
        >
          {{ nextStepActionLabel }}
        </button>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-3">
        <div class="flex items-center gap-2">
          <span
            class="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]"
          >
            Filter
          </span>
          <div
            class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
            role="group"
            aria-label="Filter decklists by ownership"
          >
            <button
              v-for="option in filterOptions"
              :key="`sticky-filter-${option.label}`"
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
        </div>
        <div
          class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
          role="tablist"
          aria-label="Dashboard tabs"
        >
          <button
            v-for="tab in tabOptions"
            :id="`tab-${tab.id}`"
            :key="tab.id"
            type="button"
            role="tab"
            class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            :class="
              activeTab === tab.id
                ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
            "
            :aria-selected="activeTab === tab.id"
            :aria-controls="`panel-${tab.id}`"
            @click="emit('tab-change', tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from "../Card.vue";
import type {
  DashboardTab,
  OwnedFilterOption,
  OwnedFilterValue,
  TabOption,
} from "../../types/dashboard";

defineProps<{
  nextStepLabel: string;
  nextStepActionLabel?: string | null;
  filterOptions: OwnedFilterOption[];
  tabOptions: ReadonlyArray<TabOption>;
  activeTab: DashboardTab;
}>();

const emit = defineEmits<{
  "next-action": [];
  "filter-change": [value: OwnedFilterValue];
  "tab-change": [tab: DashboardTab];
}>();

</script>
