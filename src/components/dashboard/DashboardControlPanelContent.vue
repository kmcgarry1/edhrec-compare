<template>
  <div class="space-y-5">
    <section class="dashboard-control-panel-section space-y-3">
      <div class="space-y-1">
        <CText tag="p" variant="eyebrow" tone="muted">Commander</CText>
        <CText tag="p" variant="title">
          {{ commanderEditing ? "Choose your deck" : "Current deck" }}
        </CText>
        <CText tag="p" variant="helper" tone="muted">
          {{
            commanderEditing
              ? "Search a commander, add an optional partner, then return to results."
              : "Keep the rail compact until you need to swap commanders."
          }}
        </CText>
      </div>

      <template v-if="commanderEditing || !hasCommander">
        <CommanderSearch
          ref="commanderSearchRef"
          :selected-slug="selectedSlug"
          :selection="selection"
          @commander-selected="handleCommanderSelected"
          @selection-change="handleSelectionChange"
        />

        <div v-if="hasCommander" class="flex flex-wrap gap-2">
          <CButton type="button" variant="secondary" size="sm" @click="collapseCommanderEditor">
            Done
          </CButton>
        </div>
      </template>

      <CSurface
        v-else
        variant="utility"
        size="sm"
        radius="2xl"
        class="space-y-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CText tag="p" variant="body" weight="semibold">
              {{ commanderSummaryTitle }}
            </CText>
            <CText tag="p" variant="helper" tone="muted">
              {{ commanderSummaryText }}
            </CText>
          </div>
          <CBadge tone="accent" variant="soft" size="sm" text-case="normal">
            {{ hasPartner ? "Partner" : "Solo" }}
          </CBadge>
        </div>

        <div class="flex flex-wrap gap-2">
          <CButton type="button" variant="secondary" size="sm" @click="openCommanderEditor">
            Change commander
          </CButton>
        </div>
      </CSurface>
    </section>

    <section class="dashboard-control-panel-section space-y-3">
      <div class="space-y-1">
        <CText tag="p" variant="eyebrow" tone="muted">Collection</CText>
        <CText tag="p" variant="title">
          {{ hasCsvData ? "Collection loaded" : "No collection loaded" }}
        </CText>
      </div>

      <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <CBadge
            :tone="hasCsvData ? 'accent' : 'muted'"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            {{ hasCsvData ? `${csvCount.toLocaleString()} cards` : "Upload required" }}
          </CBadge>
          <CBadge tone="default" variant="soft" size="sm" text-case="normal">
            {{ collectionModeLabel }}
          </CBadge>
          <CBadge
            v-if="collectionImportedLabel"
            tone="muted"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            Imported {{ collectionImportedLabel }}
          </CBadge>
        </div>

        <div class="space-y-1">
          <CText tag="p" variant="body" weight="semibold">
            {{ collectionSourceName || (hasCsvData ? "In-memory collection" : "Upload once to compare ownership") }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ hasCsvData ? collectionModeHint : inventorySummary }}
          </CText>
          <CText v-if="hasCsvData" tag="p" variant="helper" tone="muted">
            {{ inventorySummary }}
          </CText>
        </div>

        <div class="flex flex-wrap gap-2">
          <CButton type="button" variant="secondary" size="sm" @click="emit('open-upload')">
            {{ hasCsvData ? "Replace CSV" : "Upload collection" }}
          </CButton>
          <CButton
            v-if="hasCsvData"
            type="button"
            variant="ghost"
            size="sm"
            @click="emit('clear-upload')"
          >
            Clear
          </CButton>
        </div>
      </CSurface>
    </section>

    <section class="dashboard-control-panel-section space-y-3">
      <div class="space-y-1">
        <CText tag="p" variant="eyebrow" tone="muted">Deck view</CText>
        <CText tag="p" variant="title">Preview the current card split</CText>
        <CText tag="p" variant="helper" tone="muted">
          {{ activeDeckViewSummary }}
        </CText>
      </div>

      <div class="grid gap-2">
        <button
          v-for="option in filterOptions"
          :key="`control-panel-filter-${option.label}`"
          type="button"
          class="dashboard-control-view-option"
          :class="
            option.active
              ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
              : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]'
          "
          :aria-pressed="option.active"
          @click="emit('filter-change', option.value)"
        >
          <span class="text-left">
            <span class="block text-sm font-semibold">{{ option.label }}</span>
            <span class="block text-[0.72rem] text-[color:var(--muted)]">
              {{ deckViewOptionHelper(option.value) }}
            </span>
          </span>
          <span class="text-sm font-semibold tabular-nums">
            {{ formatCount(option.count) }}
          </span>
        </button>
      </div>
    </section>

    <section class="dashboard-control-panel-section space-y-3">
      <button
        type="button"
        class="flex w-full items-start justify-between gap-3 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-left transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        :aria-expanded="advancedFiltersOpen"
        @click="advancedFiltersOpen = !advancedFiltersOpen"
      >
        <span class="space-y-1">
          <CText tag="span" variant="eyebrow" tone="muted">Advanced filters</CText>
          <CText tag="span" variant="body" weight="semibold" class="block">
            Refine the EDHREC source decklists
          </CText>
          <CText tag="span" variant="helper" tone="muted" class="block">
            {{ advancedSummary }}
          </CText>
        </span>
        <CBadge tone="muted" variant="soft" size="sm" text-case="normal">
          {{ advancedFiltersOpen ? "Hide" : "Edit filters" }}
        </CBadge>
      </button>

      <CommanderFilters
        v-if="advancedFiltersOpen"
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import CommanderSearch from "../CommanderSearch.vue";
import CommanderFilters from "../CommanderFilters.vue";
import { EDHRECBracket, EDHRECCompanion, EDHRECPageModifier, EDHRECPageType } from "../helpers/enums";
import { CBadge, CButton, CSurface, CText } from "../core";
import type { CommanderSelection } from "../../types/edhrec";
import type { OwnedFilterOption, OwnedFilterValue } from "../../types/dashboard";

const props = defineProps<{
  selectedSlug?: string | null;
  selection?: CommanderSelection | null;
  bracket: string;
  modifier: string;
  pageType: string;
  companion: string;
  hasCsvData: boolean;
  csvCount: number;
  inventorySummary: string;
  collectionSourceName?: string | null;
  collectionImportedAt?: Date | null;
  collectionModeLabel: string;
  collectionModeHint: string;
  filterOptions: OwnedFilterOption[];
}>();

const emit = defineEmits<{
  "commander-selected": [slug: string];
  "selection-change": [payload: CommanderSelection];
  "filter-change": [value: OwnedFilterValue];
  "update:bracket": [value: string | number];
  "update:modifier": [value: string | number];
  "update:page-type": [value: string | number];
  "update:companion": [value: string | number];
  "open-upload": [];
  "clear-upload": [];
}>();

const commanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);
const commanderEditing = ref(!(props.selection?.primary ?? ""));
const advancedFiltersOpen = ref(false);

const hasCommander = computed(() => Boolean(props.selection?.primary));
const hasPartner = computed(() => Boolean(props.selection?.hasPartner && props.selection?.partner));
const commanderSummaryTitle = computed(() => {
  if (!props.selection?.primary) {
    return "No commander selected";
  }
  if (!props.selection.hasPartner) {
    return props.selection.primary;
  }
  return `${props.selection.primary} + ${props.selection.partner}`;
});
const commanderSummaryText = computed(() => {
  if (!props.selection?.primary) {
    return "Open the editor to search for a commander.";
  }
  if (!props.selection.hasPartner) {
    return "Single-commander deck ready for compare.";
  }
  return "Partner deck ready for compare and export.";
});

const findLabel = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
  fallback: string
) => options.find((option) => option.value === value)?.label ?? fallback;

const pageTypeLabel = computed(() =>
  findLabel(Object.values(EDHRECPageType), props.pageType, "Commander")
);
const bracketLabel = computed(() => {
  if (!props.bracket) {
    return "All brackets";
  }
  const label = findLabel(Object.values(EDHRECBracket), props.bracket, "Bracket");
  const bracketNumber = label.match(/^(\d+)/)?.[1];
  return bracketNumber ? `Bracket ${bracketNumber}` : label;
});
const modifierLabel = computed(() =>
  props.modifier
    ? findLabel(Object.values(EDHRECPageModifier), props.modifier, "Budget")
    : "Any budget"
);
const companionLabel = computed(() =>
  props.companion
    ? `${findLabel(Object.values(EDHRECCompanion), props.companion, "Companion")} companion`
    : "No companion"
);
const advancedSummary = computed(
  () =>
    [pageTypeLabel.value, bracketLabel.value, modifierLabel.value, companionLabel.value].join(
      " • "
    )
);

const collectionImportedLabel = computed(() => {
  if (!props.collectionImportedAt) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(props.collectionImportedAt);
});

const activeDeckViewOption = computed(
  () => props.filterOptions.find((option) => option.active) ?? props.filterOptions[0]
);
const activeDeckViewSummary = computed(() => {
  if (!activeDeckViewOption.value) {
    return "Choose which card view should drive the decklist.";
  }
  return `${activeDeckViewOption.value.label} currently shows ${formatCount(activeDeckViewOption.value.count)} card${(activeDeckViewOption.value.count ?? 0) === 1 ? "" : "s"}.`;
});

const formatCount = (value?: number) => (value ?? 0).toLocaleString();

const deckViewOptionHelper = (value: OwnedFilterValue) => {
  if (value === true) {
    return "Cards already in your collection";
  }
  if (value === false) {
    return "Cards still missing from your collection";
  }
  return "Everything in the current EDHREC lists";
};

const openCommanderEditor = async () => {
  commanderEditing.value = true;
  await nextTick();
  commanderSearchRef.value?.focusPrimarySearch?.();
};

const collapseCommanderEditor = () => {
  if (props.selection?.primary) {
    commanderEditing.value = false;
  }
};

const handleCommanderSelected = (slug: string) => {
  emit("commander-selected", slug);
  if (!slug) {
    commanderEditing.value = true;
  }
};

const handleSelectionChange = (payload: CommanderSelection) => {
  emit("selection-change", payload);
  if (!payload.primary) {
    commanderEditing.value = true;
  }
};

watch(
  () => props.selection?.primary ?? "",
  (primary, previousPrimary) => {
    if (!primary) {
      commanderEditing.value = true;
      return;
    }
    if (!previousPrimary) {
      commanderEditing.value = false;
    }
  },
  { immediate: true }
);

defineExpose({
  selectPrimaryCommander: (name: string) => {
    commanderEditing.value = true;
    commanderSearchRef.value?.selectPrimaryCommander(name);
  },
  startPartnerSelection: async () => {
    commanderEditing.value = true;
    await nextTick();
    commanderSearchRef.value?.startPartnerSelection?.();
  },
  focusPrimarySearch: async () => {
    commanderEditing.value = true;
    await nextTick();
    commanderSearchRef.value?.focusPrimarySearch?.();
  },
});
</script>
