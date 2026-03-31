<template>
  <div class="sticky top-4 z-10" data-testid="commander-results-command-bar">
    <CSurface variant="command" size="sm" radius="2xl" class="space-y-4 shadow-[var(--shadow-soft)]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <CText tag="p" variant="eyebrow" tone="muted"> Results command bar </CText>
            <CBadge tone="muted" variant="soft" size="sm" text-case="normal">
              {{ listCount }} active of {{ totalSectionCount }}
            </CBadge>
            <CBadge tone="muted" variant="soft" size="sm" text-case="normal">
              {{ cardCount }} cards
            </CBadge>
            <CBadge :tone="deckViewTone" variant="soft" size="sm" text-case="normal">
              {{ deckViewLabel }}
            </CBadge>
          </div>
          <CText tag="h2" variant="title">Section scan and deck context</CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ ownershipSummary }}
          </CText>
        </div>

        <div class="flex flex-wrap items-center gap-2 lg:justify-end">
          <CButton type="button" variant="secondary" size="sm" @click="emit('toggle-expand-all')">
            {{ allExpanded ? "Collapse all" : "Expand all" }}
          </CButton>
        </div>
      </div>

      <div v-if="sections.length" class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-left text-[0.76rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :class="
            section.id === activeId
              ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
              : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]'
          "
          @click="emit('navigate', section.id)"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4 shrink-0"
            :style="{ color: section.iconColor || 'currentColor' }"
            fill="currentColor"
            aria-hidden="true"
          >
            <path :d="section.iconPath || fallbackIconPath" />
          </svg>
          <span>{{ section.label }}</span>
        </button>
      </div>
    </CSurface>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { mdiCardsOutline } from "@mdi/js";
import { CBadge, CButton, CSurface, CText } from "../core";

const props = defineProps<{
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
}>();

const emit = defineEmits<{
  navigate: [id: string];
  "toggle-expand-all": [];
}>();

const fallbackIconPath = mdiCardsOutline;

const deckViewTone = computed(() => {
  if (props.deckViewLabel === "Owned cards") {
    return "success" as const;
  }
  if (props.deckViewLabel === "Missing cards") {
    return "warn" as const;
  }
  return "accent" as const;
});
</script>
