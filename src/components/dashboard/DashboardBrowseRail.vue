<template>
  <aside v-if="!isMobileViewport" class="xl:sticky xl:top-24">
    <div class="space-y-3">
      <CSurface variant="rail" size="sm" radius="3xl" class="space-y-3">
        <CText tag="p" variant="eyebrow" tone="muted"> Commander workbench </CText>
        <CText tag="p" variant="body" tone="muted">
          Keep search first, refine the route, and jump through sections without leaving the
          comparison flow.
        </CText>
      </CSurface>

      <CSurface variant="rail" size="sm" radius="3xl" class="space-y-3">
        <button
          type="button"
          class="flex w-full items-start justify-between gap-3 text-left"
          data-testid="browse-rail-search-toggle"
          @click="openRailGroup = 'search'"
        >
          <div class="space-y-1">
            <CText tag="p" variant="eyebrow" tone="muted"> Commander search </CText>
            <CText tag="p" variant="title"> Find and pair commanders </CText>
            <CText tag="p" variant="helper" tone="muted">
              {{ searchGroupSummary }}
            </CText>
          </div>
          <CBadge tone="default" variant="soft" size="sm" text-case="normal">
            {{ openRailGroup === "search" ? "Open" : "Show" }}
          </CBadge>
        </button>

        <div v-if="openRailGroup === 'search'" class="border-t border-[color:var(--border)] pt-3">
          <CommanderSearch
            ref="commanderSearchRef"
            :selected-slug="selectedSlug"
            :selection="selection"
            @commander-selected="handleCommanderSelected"
            @selection-change="handleSelectionChange"
          />
        </div>
      </CSurface>

      <CSurface variant="rail" size="sm" radius="3xl" class="space-y-3">
        <button
          type="button"
          class="flex w-full items-start justify-between gap-3 text-left"
          data-testid="browse-rail-collection-toggle"
          @click="openRailGroup = 'collection'"
        >
          <div class="space-y-1">
            <CText tag="p" variant="eyebrow" tone="muted"> Collection lens </CText>
            <CText tag="p" variant="title"> Ownership and route filters </CText>
            <CText tag="p" variant="helper" tone="muted">
              {{ collectionGroupSummary }}
            </CText>
          </div>
          <CBadge tone="default" variant="soft" size="sm" text-case="normal">
            {{ activeFilterLabel }}
          </CBadge>
        </button>

        <div
          v-if="openRailGroup === 'collection'"
          class="space-y-4 border-t border-[color:var(--border)] pt-3"
        >
          <div class="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <CText tag="p" variant="eyebrow" tone="muted"> CSV match state </CText>
            <CText tag="p" variant="body" weight="semibold" class="mt-1">
              {{ hasCsvData ? "Collection overlays active" : "CSV pending" }}
            </CText>
            <CText tag="p" variant="helper" tone="muted" class="mt-1">
              {{ inventorySummary }}
            </CText>
          </div>

          <div class="space-y-2">
            <CText tag="p" variant="eyebrow" tone="muted"> Ownership view </CText>
            <div
              class="inline-flex w-full items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.72rem] font-semibold text-[color:var(--muted)]"
              role="group"
              aria-label="Filter decklists by ownership"
            >
              <button
                v-for="option in filterOptions"
                :key="`rail-filter-${option.label}`"
                type="button"
                class="flex-1 rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                :class="
                  option.active
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                    : 'hover:text-[color:var(--text)]'
                "
                :aria-pressed="option.active"
                @click="emit('filter-change', option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

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
        </div>
      </CSurface>

      <CSurface variant="rail" size="sm" radius="3xl" class="space-y-3">
        <button
          type="button"
          class="flex w-full items-start justify-between gap-3 text-left"
          data-testid="browse-rail-sections-toggle"
          @click="openRailGroup = 'sections'"
        >
          <div class="space-y-1">
            <CText tag="p" variant="eyebrow" tone="muted"> Jump to sections </CText>
            <CText tag="p" variant="title"> Scan results faster </CText>
            <CText tag="p" variant="helper" tone="muted">
              {{ sectionsGroupSummary }}
            </CText>
          </div>
          <CBadge tone="muted" variant="soft" size="sm" text-case="normal">
            {{ sections.length }}
          </CBadge>
        </button>

        <div
          v-if="openRailGroup === 'sections'"
          class="space-y-3 border-t border-[color:var(--border)] pt-3"
        >
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
              :class="sectionButtonClass(section.id === activeId)"
              :aria-pressed="section.id === activeId"
              @click="handleNavigate(section.id)"
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
        </div>
      </CSurface>
    </div>
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
      data-testid="dashboard-browse-sheet"
      @click.self="emit('close')"
      @escape-pressed="emit('close')"
    >
      <div
        class="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-[var(--shadow)]"
      >
        <div class="mx-auto mb-3 h-1.5 w-14 rounded-full bg-[color:var(--border)]" aria-hidden="true" />
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CText :id="sheetTitleId" tag="p" variant="eyebrow" tone="muted">
              Commander workbench
            </CText>
            <CText tag="p" variant="title"> Browse and refine </CText>
          </div>
          <CButton type="button" variant="soft" size="sm" @click="emit('close')"> Close </CButton>
        </div>

        <div
          class="mt-4 inline-flex w-full items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-1 text-[0.72rem] font-semibold text-[color:var(--muted)]"
          role="tablist"
          aria-label="Browse workbench tabs"
        >
          <button
            v-for="tab in browseTabs"
            :key="tab.value"
            type="button"
            class="flex-1 rounded-full px-3 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            :class="
              activeBrowseTab === tab.value
                ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                : 'hover:text-[color:var(--text)]'
            "
            role="tab"
            :aria-selected="activeBrowseTab === tab.value"
            :data-testid="`browse-sheet-tab-${tab.value}`"
            @click="activeBrowseTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="mt-4 max-h-[calc(88vh-11rem)] overflow-y-auto pb-2">
          <div v-if="activeBrowseTab === 'search'" class="space-y-4">
            <CommanderSearch
              ref="mobileCommanderSearchRef"
              :selected-slug="selectedSlug"
              :selection="selection"
              @commander-selected="handleCommanderSelected"
              @selection-change="handleSelectionChange"
            />
          </div>

          <div v-else-if="activeBrowseTab === 'filters'" class="space-y-4">
            <CSurface variant="dense" size="sm" class="space-y-3">
              <CText tag="p" variant="eyebrow" tone="muted"> Collection lens </CText>
              <CText tag="p" variant="body" weight="semibold">
                {{ hasCsvData ? "Collection overlays active" : "CSV pending" }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                {{ inventorySummary }}
              </CText>
            </CSurface>

            <CSurface variant="dense" size="sm" class="space-y-3">
              <CText tag="p" variant="eyebrow" tone="muted"> Ownership view </CText>
              <div
                class="inline-flex w-full items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.72rem] font-semibold text-[color:var(--muted)]"
                role="group"
                aria-label="Filter decklists by ownership"
              >
                <button
                  v-for="option in filterOptions"
                  :key="`sheet-filter-${option.label}`"
                  type="button"
                  class="flex-1 rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                  :class="
                    option.active
                      ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                      : 'hover:text-[color:var(--text)]'
                  "
                  :aria-pressed="option.active"
                  @click="emit('filter-change', option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </CSurface>

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
            </CSurface>
          </div>

          <div v-else class="space-y-3">
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
                :class="sectionButtonClass(section.id === activeId)"
                :aria-pressed="section.id === activeId"
                @click="handleNavigate(section.id)"
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
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { mdiCardsOutline } from "@mdi/js";
import CommanderSearch from "../CommanderSearch.vue";
import CommanderFilters from "../CommanderFilters.vue";
import { CBadge, CButton, CSurface, CText } from "../core";
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
  sections: Array<{
    id: string;
    label: string;
    iconPath?: string;
    iconColor?: string;
  }>;
  activeId?: string | null;
  open: boolean;
  loading?: boolean;
  hasCsvData: boolean;
  inventorySummary: string;
  filterOptions: OwnedFilterOption[];
}>();

const emit = defineEmits<{
  close: [];
  navigate: [id: string];
  "commander-selected": [slug: string];
  "selection-change": [payload: CommanderSelection];
  "filter-change": [value: OwnedFilterValue];
  "update:bracket": [value: string | number];
  "update:modifier": [value: string | number];
  "update:page-type": [value: string | number];
  "update:companion": [value: string | number];
}>();

const commanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);
const mobileCommanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);
const mobileSheetRef = ref<HTMLElement | null>(null);
const fallbackIconPath = mdiCardsOutline;
const openRailGroup = ref<"search" | "collection" | "sections">("search");
const activeBrowseTab = ref<"search" | "filters" | "sections">("search");
const isMobileViewport = ref(typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT_PX : false);
const mobileSheetOpen = computed(() => props.open && isMobileViewport.value);
const { activate, deactivate } = useFocusTrap(mobileSheetRef, mobileSheetOpen);
const sheetTitleId = `browse-sheet-${Math.random().toString(36).slice(2, 9)}`;

const browseTabs = [
  { value: "search", label: "Search" },
  { value: "filters", label: "Filters" },
  { value: "sections", label: "Sections" },
] as const;

const activeFilterLabel = computed(
  () => props.filterOptions.find((option) => option.active)?.label ?? "All"
);
const searchGroupSummary = computed(() => {
  if (!props.selection?.primary) {
    return "Search for the route anchor, then add a partner when the deck needs one.";
  }
  if (props.selection.hasPartner && props.selection.partner) {
    return `${props.selection.primary} + ${props.selection.partner}`;
  }
  return props.selection.primary;
});
const collectionGroupSummary = computed(() =>
  props.hasCsvData
    ? `${activeFilterLabel.value} view active. Route filters stay synced to the URL.`
    : "Add a CSV in Settings when you want owned and unowned overlays."
);
const sectionsGroupSummary = computed(() => {
  if (!props.sections.length) {
    return "Section navigation appears after results load.";
  }
  const activeSection = props.sections.find((section) => section.id === props.activeId);
  return activeSection
    ? `${props.sections.length} active sections. Currently on ${activeSection.label}.`
    : `${props.sections.length} active sections ready to scan.`;
});

const syncViewportMode = () => {
  if (typeof window === "undefined") {
    return;
  }
  isMobileViewport.value = window.innerWidth < MOBILE_BREAKPOINT_PX;
};

const handleCommanderSelected = (slug: string) => {
  emit("commander-selected", slug);
};

const handleSelectionChange = (payload: CommanderSelection) => {
  emit("selection-change", payload);
};

const handleNavigate = (id: string) => {
  emit("navigate", id);
  if (isMobileViewport.value) {
    emit("close");
  }
};

const selectPrimaryCommander = (name: string) => {
  openRailGroup.value = "search";
  activeBrowseTab.value = "search";
  commanderSearchRef.value?.selectPrimaryCommander(name);
  mobileCommanderSearchRef.value?.selectPrimaryCommander(name);
};

const startPartnerSelection = () => {
  openRailGroup.value = "search";
  activeBrowseTab.value = "search";
  commanderSearchRef.value?.startPartnerSelection?.();
  mobileCommanderSearchRef.value?.startPartnerSelection?.();
};

const focusPrimarySearch = () => {
  openRailGroup.value = "search";
  activeBrowseTab.value = "search";
  void commanderSearchRef.value?.focusPrimarySearch?.();
  void mobileCommanderSearchRef.value?.focusPrimarySearch?.();
};

const sectionButtonClass = (active: boolean) =>
  [
    "flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[0.76rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
    active
      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]"
      : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]",
  ].join(" ");

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
  selectPrimaryCommander,
  startPartnerSelection,
  focusPrimarySearch,
});
</script>
