<template>
  <section
    class="grid gap-4 xl:grid-cols-[20.5rem_minmax(0,1fr)] 2xl:grid-cols-[21.5rem_minmax(0,1fr)]"
  >
    <GlobalLoadingBanner
      scope="scryfall-bulk"
      placement-class="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4"
    >
      Loading Scryfall data...
    </GlobalLoadingBanner>

    <DashboardBrowseRail
      ref="browseRailRef"
      :selected-slug="currentCommanderSlug"
      :selection="commanderSelection"
      :bracket="chosenBracket"
      :modifier="chosenModifier"
      :page-type="chosenPageType"
      :companion="chosenCompanion"
      :open="controlPanelOpen"
      :sections="cardlistSections"
      :active-id="activeSectionId"
      :loading="readerLoading"
      :has-csv-data="hasCsvData"
      :inventory-summary="inventorySummary"
      :filter-options="deckViewFilterOptions"
      @close="emit('close-control-panel')"
      @navigate="scrollToSection"
      @filter-change="emit('filter-change', $event)"
      @commander-selected="handleCommanderSelection"
      @selection-change="handleSelectionChange"
      @update:bracket="setBracket"
      @update:modifier="setModifier"
      @update:page-type="setPageType"
      @update:companion="setCompanion"
    />

    <div class="min-w-0 space-y-4">
      <DashboardCommanderMasthead
        :commander-selection="commanderSelection"
        :commander-profiles="commanderProfiles"
        :spotlight-loading="commanderSpotlightLoading"
        :backdrop-url="commanderSpotlightBackdropUrl"
        :next-step-label="nextStepLabel"
        :canonical-edhrec-href="canonicalEdhrecHref"
        :status-items="mastheadStatusItems"
        @change-commander="focusCommanderEditor"
        @open-controls="emit('open-control-panel')"
        @previous-printing="emit('previous-printing', $event)"
        @next-printing="emit('next-printing', $event)"
      />

      <CSurface variant="content" size="sm" radius="3xl" class="space-y-4">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:items-start">
          <EdhrecResultsHeader
            :list-count="cardlistSections.length"
            :total-section-count="totalSectionCount"
            :card-count="visibleCardCount"
            :deck-view-label="deckFilterLabel"
            :ownership-summary="ownershipSummary"
            :all-expanded="allSectionsExpanded"
            @toggle-expand-all="handleToggleExpandAll"
          />

          <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <CText tag="p" variant="eyebrow" tone="muted"> Route finish </CText>
              <CBadge
                :tone="decklistReady ? 'accent' : 'muted'"
                variant="soft"
                size="sm"
                text-case="normal"
              >
                {{ decklistReady ? "Decklist ready" : "Awaiting results" }}
              </CBadge>
              <CBadge tone="muted" variant="outline" size="sm" text-case="normal">
                {{ collectionModeLabel }}
              </CBadge>
            </div>

            <div class="space-y-1">
              <CText tag="p" variant="title">Finish with your filtered list</CText>
              <CText tag="p" variant="helper" tone="muted">
                {{ exportHelperText }}
              </CText>
            </div>

            <CText tag="p" variant="helper" tone="muted">
              {{ collectionSourceSummary }}
            </CText>

            <DecklistExport
              :disabled="!decklistReady"
              :copied="decklistCopied"
              @copy="emit('copy-header-decklist')"
              @download="emit('download-header-decklist')"
            />
          </CSurface>
        </div>

        <FloatingCardlistNav
          v-if="cardlistSections.length"
          :sections="cardlistSections"
          :active-id="activeSectionId"
          @navigate="scrollToSection"
        />

        <CNotice v-if="error" tone="danger" :message="`Error: ${error}`">
          <template #icon>
            <CText tag="span" variant="title" weight="bold" tone="inherit"> X </CText>
          </template>
        </CNotice>

        <EdhrecEmptyState
          v-if="showEmptyState"
          :popular="popularCommanders"
          @select="selectSuggestedCommander"
        />

        <CNotice
          v-else-if="showNoMatchingSections"
          tone="info"
          message="No cardlists match the current deck view. Try another filter or upload a collection."
          class="bg-[color:var(--surface-muted)]"
        />

        <div
          v-if="cardlistEntries.length"
          class="space-y-4"
        >
          <template v-for="entry in cardlistEntries" :key="entry.key">
            <CardlistSection
              :cardlist="entry.cardlist"
              :section-meta="entry.sectionMeta"
              :rows="getTableRows(entry.cardlist)"
              :columns="cardTableColumns"
              :decklist-text="entry.decklistText"
              :copied-section-id="decklistCopySectionId"
              :loading="bulkCardsLoading"
              @toggle="toggleSection(entry.sectionMeta.id)"
              @copy="handleCopyDecklist(entry.cardlist, entry.index)"
              @download="handleDownloadDecklist(entry.cardlist, entry.index)"
            />
          </template>
        </div>
      </CSurface>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import DashboardBrowseRail from "./DashboardBrowseRail.vue";
import DashboardCommanderMasthead from "./DashboardCommanderMasthead.vue";
import DecklistExport from "../DecklistExport.vue";
import { CardlistSection, FloatingCardlistNav, GlobalLoadingBanner, EdhrecEmptyState } from "..";
import { CBadge, CNotice, CSurface, CText } from "../core";
import { EDHRECBracket, EDHRECCompanion, EDHRECPageModifier, EDHRECPageType } from "../helpers/enums";
import { useEdhrecRouteState } from "../../composables/useEdhrecRouteState";
import { useEdhrecData } from "../../composables/useEdhrecData";
import { useEdhrecCardlists } from "../../composables/useEdhrecCardlists";
import { useScryfallCardData } from "../../composables/useScryfallCardData";
import EdhrecResultsHeader from "../edhrec/EdhrecResultsHeader.vue";
import type { CommanderProfile } from "../../composables/useCommanderSpotlight";
import type { ColumnDefinition } from "../CardTable.vue";
import type { CommanderSelection, DecklistPayload } from "../../types/edhrec";
import type { OwnedFilterOption, OwnedFilterValue } from "../../types/dashboard";

const props = defineProps<{
  controlPanelOpen: boolean;
  commanderSelection: CommanderSelection;
  commanderProfiles: CommanderProfile[];
  commanderSpotlightLoading: boolean;
  commanderSpotlightBackdropUrl?: string;
  canonicalEdhrecHref?: string | null;
  nextStepLabel: string;
  hasCsvData: boolean;
  csvCount: number;
  inventorySummary: string;
  collectionSourceName?: string | null;
  collectionImportedAt?: Date | null;
  collectionModeLabel: string;
  collectionModeHint: string;
  filterOptions: OwnedFilterOption[];
  decklistText?: string | null;
  decklistCopied: boolean;
  exportHelperText: string;
}>();

const emit = defineEmits<{
  decklistUpdate: [payload: DecklistPayload];
  "selection-change": [payload: CommanderSelection];
  "close-control-panel": [];
  "open-control-panel": [];
  "open-upload": [];
  "clear-upload": [];
  "filter-change": [value: OwnedFilterValue];
  "previous-printing": [index: number];
  "next-printing": [index: number];
  "copy-header-decklist": [];
  "download-header-decklist": [];
}>();

const browseRailRef = ref<InstanceType<typeof DashboardBrowseRail> | null>(null);

const {
  chosenPageType,
  chosenBracket,
  chosenModifier,
  chosenCompanion,
  currentCommanderSlug,
  commanderUrl,
  setCommanderSlug,
  setBracket,
  setModifier,
  setPageType,
  setCompanion,
} = useEdhrecRouteState();

const { cardlists, error, readerLoading } = useEdhrecData(commanderUrl);

const {
  cardlistSections,
  cardlistEntries,
  totalSectionCount,
  visibleCardCount,
  deckViewCounts,
  deckFilterLabel,
  decklistPayload,
  decklistCopySectionId,
  activeSectionId,
  allSectionsExpanded,
  toggleSection,
  expandAllSections,
  collapseAllSections,
  scrollToSection,
  filterCardviews,
  isCardInUpload,
  handleCopyDecklist,
  handleDownloadDecklist,
} = useEdhrecCardlists(cardlists);

const { bulkCardsLoading, getTableRows } = useScryfallCardData(cardlists, {
  filterCardviews,
  isCardInUpload,
});

const popularCommanders = [
  { name: "Atraxa, Grand Unifier" },
  { name: "The Ur-Dragon" },
  { name: "Miirym, Sentinel Wyrm" },
  { name: "Edgar Markov" },
  { name: "Chulane, Teller of Tales" },
];

const ownershipSummary = computed(() => {
  if (!cardlistEntries.value.length) {
    return `Showing ${deckFilterLabel.value.toLowerCase()}.`;
  }
  return `Showing ${deckFilterLabel.value.toLowerCase()} across ${cardlistEntries.value.length} active section${cardlistEntries.value.length === 1 ? "" : "s"}.`;
});
const decklistReady = computed(() => Boolean(props.decklistText));
const collectionSourceSummary = computed(() => {
  if (!props.hasCsvData) {
    return props.collectionModeHint;
  }

  const parts: string[] = [];
  if (props.collectionSourceName) {
    parts.push(props.collectionSourceName);
  }
  if (props.collectionImportedAt) {
    try {
      parts.push(
        `loaded ${new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(props.collectionImportedAt)}`
      );
    } catch {
      parts.push(`loaded ${String(props.collectionImportedAt)}`);
    }
  }

  if (!parts.length) {
    return props.collectionModeHint;
  }

  return `${parts.join(" ")}.`;
});

const deckViewFilterOptions = computed(() =>
  props.filterOptions.map((option) => ({
    ...option,
    count:
      option.value === true
        ? deckViewCounts.value.owned
        : option.value === false
          ? deckViewCounts.value.missing
          : deckViewCounts.value.all,
  }))
);

const findLabel = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
  fallback: string
) => options.find((option) => option.value === value)?.label ?? fallback;

const pageTypeLabel = computed(() =>
  findLabel(Object.values(EDHRECPageType), chosenPageType.value, "Commander")
);
const bracketLabel = computed(() => {
  if (!chosenBracket.value) {
    return "";
  }
  const label = findLabel(Object.values(EDHRECBracket), chosenBracket.value, "Bracket");
  const bracketNumber = label.match(/^(\d+)/)?.[1];
  return bracketNumber ? `Bracket ${bracketNumber}` : label;
});
const modifierLabel = computed(() =>
  chosenModifier.value
    ? findLabel(Object.values(EDHRECPageModifier), chosenModifier.value, "Budget")
    : ""
);
const companionLabel = computed(() =>
  chosenCompanion.value
    ? `${findLabel(Object.values(EDHRECCompanion), chosenCompanion.value, "Companion")} companion`
    : ""
);
const deckViewChipLabel = computed(() => {
  if (deckFilterLabel.value === "Owned cards") {
    return "Owned";
  }
  if (deckFilterLabel.value === "Missing cards") {
    return "Missing";
  }
  return deckFilterLabel.value;
});
const deckViewTone = computed(() => {
  if (deckFilterLabel.value === "Owned cards") {
    return "success" as const;
  }
  if (deckFilterLabel.value === "Missing cards") {
    return "warn" as const;
  }
  return "default" as const;
});
const mastheadStatusItems = computed(() => {
  const items: Array<{
    label: string;
    tone?: "default" | "accent" | "success" | "warn" | "danger" | "muted";
  }> = [
    {
      label: props.hasCsvData ? "Collection loaded" : "No collection upload",
      tone: props.hasCsvData ? "accent" : "muted",
    },
    {
      label: deckViewChipLabel.value,
      tone: deckViewTone.value,
    },
    {
      label: pageTypeLabel.value,
      tone:
        chosenPageType.value === EDHRECPageType.AVERAGE_DECK.value ? "accent" : "default",
    },
  ];

  if (bracketLabel.value) {
    items.push({ label: bracketLabel.value });
  }
  if (modifierLabel.value) {
    items.push({ label: modifierLabel.value });
  }
  if (companionLabel.value) {
    items.push({ label: companionLabel.value });
  }

  return items;
});

const showEmptyState = computed(
  () =>
    !cardlistSections.value.length &&
    !readerLoading.value &&
    !currentCommanderSlug.value &&
    !error.value
);

const showNoMatchingSections = computed(
  () =>
    !cardlistEntries.value.length &&
    !readerLoading.value &&
    Boolean(currentCommanderSlug.value) &&
    !error.value
);

watchEffect(() => {
  if (decklistPayload.value) {
    emit("decklistUpdate", decklistPayload.value);
  }
});

const handleCommanderSelection = (slug: string) => {
  setCommanderSlug(slug);
};

const handleSelectionChange = (payload: CommanderSelection) => {
  emit("selection-change", payload);
};

const handleToggleExpandAll = () => {
  if (allSectionsExpanded.value) {
    collapseAllSections();
    return;
  }
  expandAllSections();
};

const selectSuggestedCommander = (name: string) => {
  browseRailRef.value?.selectPrimaryCommander(name);
};

const startPartnerSelection = () => {
  browseRailRef.value?.startPartnerSelection?.();
};

const focusCommanderEditor = () => {
  browseRailRef.value?.focusPrimarySearch?.();
};

const cardTableColumns: ColumnDefinition[] = [
  { key: "owned", label: "Owned", align: "center", class: "w-14" },
  { key: "name", label: "Card" },
  { key: "mana", label: "Mana", class: "w-28" },
  { key: "type", label: "Type" },
  { key: "rarity", label: "Rarity", class: "w-20" },
  { key: "status", label: "", align: "center", class: "w-24" },
  { key: "usd", label: "USD", align: "right", class: "w-20" },
  { key: "eur", label: "EUR", align: "right", class: "w-20" },
];

defineExpose({
  startPartnerSelection,
});
</script>
