<template>
  <aside v-if="!isMobileViewport" class="xl:sticky xl:top-24">
    <CSurface variant="rail" size="none" radius="3xl" class="dashboard-control-panel-shell">
      <div class="dashboard-control-panel-scroll">
        <DashboardControlPanelContent
          ref="desktopContentRef"
          :selected-slug="selectedSlug"
          :selection="selection"
          :bracket="bracket"
          :modifier="modifier"
          :page-type="pageType"
          :companion="companion"
          :has-csv-data="hasCsvData"
          :csv-count="csvCount"
          :inventory-summary="inventorySummary"
          :collection-source-name="collectionSourceName"
          :collection-imported-at="collectionImportedAt"
          :collection-mode-label="collectionModeLabel"
          :collection-mode-hint="collectionModeHint"
          :filter-options="filterOptions"
          @commander-selected="emit('commander-selected', $event)"
          @selection-change="emit('selection-change', $event)"
          @filter-change="emit('filter-change', $event)"
          @update:bracket="emit('update:bracket', $event)"
          @update:modifier="emit('update:modifier', $event)"
          @update:page-type="emit('update:page-type', $event)"
          @update:companion="emit('update:companion', $event)"
          @open-upload="emit('open-upload')"
          @clear-upload="emit('clear-upload')"
        />
      </div>

      <DashboardControlPanelFooter
        :decklist-text="decklistText"
        :copied="copied"
        :export-helper-text="exportHelperText"
        @copy="emit('copy')"
        @download="emit('download')"
      />
    </CSurface>
  </aside>

  <Teleport to="body">
    <div
      v-if="mobileSheetOpen"
      ref="mobileSheetRef"
      class="fixed inset-0 z-50 bg-black/70"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="sheetTitleId"
      tabindex="-1"
      data-testid="dashboard-control-sheet"
      @click.self="emit('close')"
      @escape-pressed="emit('close')"
    >
      <div
        class="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-[var(--shadow)]"
      >
        <div class="px-4 pt-4">
          <div class="mx-auto mb-3 h-1.5 w-14 rounded-full bg-[color:var(--border)]" aria-hidden="true" />
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CText :id="sheetTitleId" tag="p" variant="eyebrow" tone="muted">
                Compare controls
              </CText>
              <CText tag="p" variant="title">Commander, deck view, and export</CText>
            </div>
            <CButton type="button" variant="soft" size="sm" @click="emit('close')">Close</CButton>
          </div>
        </div>

        <div class="dashboard-control-panel-scroll px-4 pb-0 pt-4">
          <DashboardControlPanelContent
            ref="mobileContentRef"
            :selected-slug="selectedSlug"
            :selection="selection"
            :bracket="bracket"
            :modifier="modifier"
            :page-type="pageType"
            :companion="companion"
            :has-csv-data="hasCsvData"
            :csv-count="csvCount"
            :inventory-summary="inventorySummary"
            :collection-source-name="collectionSourceName"
            :collection-imported-at="collectionImportedAt"
            :collection-mode-label="collectionModeLabel"
            :collection-mode-hint="collectionModeHint"
            :filter-options="filterOptions"
            @commander-selected="emit('commander-selected', $event)"
            @selection-change="emit('selection-change', $event)"
            @filter-change="emit('filter-change', $event)"
            @update:bracket="emit('update:bracket', $event)"
            @update:modifier="emit('update:modifier', $event)"
            @update:page-type="emit('update:page-type', $event)"
            @update:companion="emit('update:companion', $event)"
            @open-upload="emit('open-upload')"
            @clear-upload="emit('clear-upload')"
          />
        </div>

        <DashboardControlPanelFooter
          :decklist-text="decklistText"
          :copied="copied"
          :export-helper-text="exportHelperText"
          @copy="emit('copy')"
          @download="emit('download')"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import DashboardControlPanelContent from "./DashboardControlPanelContent.vue";
import DashboardControlPanelFooter from "./DashboardControlPanelFooter.vue";
import { CButton, CSurface, CText } from "../core";
import { useFocusTrap } from "../../composables/useFocusTrap";
import type { CommanderSelection } from "../../types/edhrec";
import type { OwnedFilterOption, OwnedFilterValue } from "../../types/dashboard";

const MOBILE_BREAKPOINT_PX = 1280;

const props = defineProps<{
  selectedSlug?: string | null;
  selection?: CommanderSelection | null;
  bracket: string;
  modifier: string;
  pageType: string;
  companion: string;
  open: boolean;
  hasCsvData: boolean;
  csvCount: number;
  inventorySummary: string;
  collectionSourceName?: string | null;
  collectionImportedAt?: Date | null;
  collectionModeLabel: string;
  collectionModeHint: string;
  filterOptions: OwnedFilterOption[];
  decklistText?: string | null;
  copied: boolean;
  exportHelperText: string;
}>();

const emit = defineEmits<{
  close: [];
  "commander-selected": [slug: string];
  "selection-change": [payload: CommanderSelection];
  "filter-change": [value: OwnedFilterValue];
  "update:bracket": [value: string | number];
  "update:modifier": [value: string | number];
  "update:page-type": [value: string | number];
  "update:companion": [value: string | number];
  "open-upload": [];
  "clear-upload": [];
  copy: [];
  download: [];
}>();

const desktopContentRef = ref<InstanceType<typeof DashboardControlPanelContent> | null>(null);
const mobileContentRef = ref<InstanceType<typeof DashboardControlPanelContent> | null>(null);
const mobileSheetRef = ref<HTMLElement | null>(null);
const isMobileViewport = ref(
  typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT_PX : false
);
const mobileSheetOpen = computed(() => props.open && isMobileViewport.value);
const { activate, deactivate } = useFocusTrap(mobileSheetRef, mobileSheetOpen);
const sheetTitleId = `control-sheet-${Math.random().toString(36).slice(2, 9)}`;

const syncViewportMode = () => {
  if (typeof window === "undefined") {
    return;
  }
  isMobileViewport.value = window.innerWidth < MOBILE_BREAKPOINT_PX;
};

watch(
  mobileSheetOpen,
  (isOpen) => {
    if (isOpen) {
      activate();
      return;
    }
    deactivate();
  },
  { immediate: true }
);

onMounted(() => {
  syncViewportMode();
  window.addEventListener("resize", syncViewportMode, { passive: true });
});

onBeforeUnmount(() => {
  deactivate();
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncViewportMode);
  }
});

defineExpose({
  selectPrimaryCommander: (name: string) => {
    desktopContentRef.value?.selectPrimaryCommander(name);
    mobileContentRef.value?.selectPrimaryCommander(name);
  },
  startPartnerSelection: () => {
    void desktopContentRef.value?.startPartnerSelection?.();
    void mobileContentRef.value?.startPartnerSelection?.();
  },
  focusPrimarySearch: () => {
    void desktopContentRef.value?.focusPrimarySearch?.();
    void mobileContentRef.value?.focusPrimarySearch?.();
  },
});
</script>
