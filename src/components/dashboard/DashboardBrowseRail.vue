<template>
  <CSurface
    variant="rail"
    size="sm"
    radius="3xl"
    class="space-y-4 xl:sticky xl:top-24"
    :class="open ? 'block' : 'hidden xl:block'"
  >
    <div class="flex items-center justify-between gap-3 xl:hidden">
      <div class="space-y-1">
        <CText tag="p" variant="eyebrow" tone="muted"> Browse rail </CText>
        <CText tag="p" variant="title"> Commander search and filters </CText>
      </div>
      <CButton type="button" variant="soft" size="sm" @click="emit('close')"> Close </CButton>
    </div>

    <div class="hidden space-y-1 xl:block">
      <CText tag="p" variant="eyebrow" tone="muted"> Browse rail </CText>
      <CText tag="p" variant="title" class="text-lg"> Search, filter, compare </CText>
      <CText tag="p" variant="helper" tone="muted">
        Keep commander search, EDHREC route filters, and section navigation visible while you
        compare your collection.
      </CText>
    </div>

    <CommanderSearch
      ref="commanderSearchRef"
      :selected-slug="selectedSlug"
      @commander-selected="emit('commander-selected', $event)"
      @selection-change="emit('selection-change', $event)"
    />

    <CSurface variant="dense" size="sm" class="space-y-3">
      <CommanderFilters
        layout="stacked"
        :bracket="bracket"
        :modifier="modifier"
        :page-type="pageType"
        :companion="companion"
        @update:bracket="emit('update:bracket', $event)"
        @update:modifier="emit('update:modifier', $event)"
        @update:page-type="emit('update:page-type', $event)"
        @update:companion="emit('update:companion', $event)"
      />
      <CText tag="p" variant="helper" tone="muted">
        Filters stay route-synced, so the workspace can be refreshed or shared without losing
        context.
      </CText>
    </CSurface>

    <CSurface variant="dense" size="sm" class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <div class="space-y-1">
          <CText tag="p" variant="eyebrow" tone="muted"> Cardlists </CText>
          <CText tag="p" variant="title"> Jump through sections </CText>
        </div>
        <CBadge tone="muted" variant="soft" size="sm" text-case="normal">
          {{ sections.length }}
        </CBadge>
      </div>

      <CText v-if="!sections.length && !loading" tag="p" variant="helper" tone="muted">
        Search a commander to populate deck sections and quick navigation.
      </CText>
      <CText v-else-if="loading" tag="p" variant="helper" tone="muted">
        Loading cardlist sections...
      </CText>

      <div v-else class="grid gap-2">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          :class="[
            'flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[0.76rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
            section.id === activeId
              ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
              : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]',
          ]"
          :aria-pressed="section.id === activeId"
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
          <span class="truncate">{{ section.label }}</span>
        </button>
      </div>
    </CSurface>
  </CSurface>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { mdiCardsOutline } from "@mdi/js";
import CommanderSearch from "../CommanderSearch.vue";
import CommanderFilters from "../CommanderFilters.vue";
import { CBadge, CButton, CSurface, CText } from "../core";
import type { CommanderSelection } from "../../types/edhrec";

defineProps<{
  selectedSlug?: string | null;
  bracket: string;
  modifier: string;
  pageType: string;
  companion: string;
  sections: Array<{
    id: string;
    label: string;
    iconPath?: string;
    iconColor?: string;
  }>;
  activeId?: string | null;
  open: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  navigate: [id: string];
  "commander-selected": [slug: string];
  "selection-change": [payload: CommanderSelection];
  "update:bracket": [value: string | number];
  "update:modifier": [value: string | number];
  "update:page-type": [value: string | number];
  "update:companion": [value: string | number];
}>();

const commanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);
const fallbackIconPath = mdiCardsOutline;

const selectPrimaryCommander = (name: string) => {
  commanderSearchRef.value?.selectPrimaryCommander(name);
};

defineExpose({
  selectPrimaryCommander,
});
</script>
