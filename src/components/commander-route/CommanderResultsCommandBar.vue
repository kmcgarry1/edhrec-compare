<template>
  <div class="sticky top-14 z-20" data-testid="commander-results-command-bar">
    <CSurface variant="command" size="sm" radius="lg" shadow="none" class="space-y-3">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="min-w-0">
          <CText tag="h2" variant="title">Cards</CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ ownershipSummary }}
          </CText>
        </div>

        <div class="flex flex-wrap items-center gap-2 xl:justify-end">
          <div
            class="inline-flex items-center gap-1 rounded-[3px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1 text-xs font-semibold"
            role="group"
            aria-label="Filter cards by ownership"
          >
            <button
              v-for="option in filterOptions"
              :key="`results-filter-${option.label}`"
              type="button"
              class="min-h-9 rounded-[2px] px-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
              :class="
                option.active
                  ? 'bg-[color:var(--accent)] text-[color:var(--accent-contrast)]'
                  : 'text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text)]'
              "
              :aria-pressed="option.active"
              :disabled="option.value !== null && !hasCsvData"
              @click="emit('filter-change', option.value)"
            >
              {{ option.label }}
              <span v-if="typeof option.count === 'number'" class="ml-1 opacity-75">
                {{ option.count }}
              </span>
            </button>
          </div>

          <CButton type="button" variant="secondary" size="sm" @click="emit('open-filters')">
            Filters
          </CButton>

          <div
            class="inline-flex items-center gap-1 rounded-[3px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1 text-xs font-semibold"
            role="group"
            aria-label="Choose card display"
          >
            <button
              v-for="option in displayOptions"
              :key="option.value"
              type="button"
              class="min-h-9 rounded-[2px] px-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              :class="
                displayMode === option.value
                  ? 'bg-[color:var(--accent)] text-[color:var(--accent-contrast)]'
                  : 'text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text)]'
              "
              :aria-pressed="displayMode === option.value"
              @click="emit('display-mode-change', option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <label class="sr-only" :for="priceSelectId">Price display</label>
          <select
            :id="priceSelectId"
            class="min-h-11 rounded border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            :value="priceMode"
            @change="
              emit(
                'price-mode-change',
                ($event.target as HTMLSelectElement).value as PriceDisplayMode
              )
            "
          >
            <option value="both">Both prices</option>
            <option value="usd">USD</option>
            <option value="eur">EUR</option>
          </select>

          <label v-if="sections.length" class="sr-only" :for="sectionSelectId"> Sections </label>
          <select
            v-if="sections.length"
            :id="sectionSelectId"
            class="min-h-11 rounded border border-[color:var(--border-strong)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            :value="activeId ?? ''"
            @change="handleSectionSelect"
          >
            <option value="" disabled>Sections</option>
            <option v-for="section in sections" :key="section.id" :value="section.id">
              {{ section.label }}
            </option>
          </select>

          <CButton type="button" variant="secondary" size="sm" @click="emit('toggle-expand-all')">
            {{ allExpanded ? "Collapse all" : "Expand all" }}
          </CButton>

          <CButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="!decklistAvailable"
            @click="emit('copy-decklist')"
          >
            {{ decklistCopied ? "Copied" : "Copy" }}
          </CButton>
          <CButton
            type="button"
            variant="primary"
            size="sm"
            :disabled="!decklistAvailable"
            @click="emit('download-decklist')"
          >
            Export {{ cardCount }}
          </CButton>
        </div>
      </div>
    </CSurface>
  </div>
</template>

<script setup lang="ts">
import { CButton, CSurface, CText } from "../core";
import type {
  CardDisplayMode,
  PriceDisplayMode,
} from "../../composables/useCardDisplayPreferences";
import type { OwnedFilterOption, OwnedFilterValue } from "../../types/dashboard";

const displayOptions: Array<{ value: CardDisplayMode; label: string }> = [
  { value: "rows", label: "Rows" },
  { value: "gallery", label: "Gallery" },
];

defineProps<{
  sections: Array<{
    id: string;
    label: string;
    iconPath?: string;
    iconColor?: string;
  }>;
  activeId?: string | null;
  listCount: number;
  totalSectionCount: number;
  cardCount: number;
  deckViewLabel: string;
  ownershipSummary: string;
  allExpanded: boolean;
  hasCsvData: boolean;
  filterOptions: OwnedFilterOption[];
  decklistAvailable: boolean;
  decklistCopied: boolean;
  displayMode: CardDisplayMode;
  priceMode: PriceDisplayMode;
}>();

const emit = defineEmits<{
  navigate: [id: string];
  "filter-change": [value: OwnedFilterValue];
  "open-filters": [];
  "display-mode-change": [value: CardDisplayMode];
  "price-mode-change": [value: PriceDisplayMode];
  "toggle-expand-all": [];
  "copy-decklist": [];
  "download-decklist": [];
}>();

const sectionSelectId = `sections-${Math.random().toString(36).slice(2, 9)}`;
const priceSelectId = `price-display-${Math.random().toString(36).slice(2, 9)}`;

const handleSectionSelect = (event: Event) => {
  const id = (event.target as HTMLSelectElement).value;
  if (id) {
    emit("navigate", id);
  }
};
</script>
