<template>
  <section
    class="mx-auto flex min-h-screen w-full max-w-[108rem] flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8 2xl:px-10"
  >
    <GlobalLoadingBanner />

    <main id="main-content" ref="mainContentRef" class="mt-5 flex-1 space-y-4">
      <GlobalLoadingBanner
        scope="scryfall-bulk"
        placement-class="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4"
      >
        Loading Scryfall data...
      </GlobalLoadingBanner>

      <section
        class="grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)] 2xl:grid-cols-[19.75rem_minmax(0,1fr)]"
      >
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
          :show-section-navigation="false"
          @close="closeControlPanel"
          @navigate="scrollToSection"
          @filter-change="setOwnedFilter"
          @commander-selected="handleCommanderSelection"
          @selection-change="handleSelectionChange"
          @update:bracket="setBracket"
          @update:modifier="setModifier"
          @update:page-type="setPageType"
          @update:companion="setCompanion"
        />

        <div class="min-w-0 space-y-4">
          <CommanderRouteMasthead
            :commander-selection="commanderSelection"
            :commander-profiles="commanderProfiles"
            :commander-color-identity="commanderColorIdentity"
            :spotlight-loading="commanderSpotlightLoading"
            :backdrop-url="commanderSpotlightBackdropUrl"
            :next-step-label="nextStepLabel"
            :canonical-edhrec-href="canonicalEdhrecHref"
            :status-items="mastheadStatusItems"
            :stat-items="mastheadStatItems"
            @open-controls="openControlPanel"
            @open-utilities="openUtilityTray"
            @change-commander="focusCommanderEditor"
            @previous-printing="showPreviousCommanderPrinting"
            @next-printing="showNextCommanderPrinting"
          />

          <CSurface variant="content" size="sm" radius="3xl" class="space-y-4">
            <CommanderResultsCommandBar
              :sections="cardlistSections"
              :active-id="activeSectionId"
              :list-count="cardlistEntries.length"
              :total-section-count="totalSectionCount"
              :card-count="visibleCardCount"
              :deck-view-label="deckFilterLabel"
              :ownership-summary="ownershipSummary"
              :all-expanded="allSectionsExpanded"
              @navigate="scrollToSection"
              @toggle-expand-all="handleToggleExpandAll"
            />

            <CNotice v-if="error" tone="danger" :message="`Error: ${error}`">
              <template #icon>
                <CText tag="span" variant="title" weight="bold" tone="inherit"> X </CText>
              </template>
            </CNotice>

            <CNotice
              v-else-if="showNoMatchingSections"
              tone="info"
              message="No cardlists match the current deck view. Try another ownership filter or open utilities to upload a collection."
              class="bg-[color:var(--surface-muted)]"
            />

            <div v-if="cardlistEntries.length" class="space-y-4">
              <template v-for="entry in cardlistEntries" :key="entry.key">
                <CommanderCardlistSection
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
    </main>

    <DashboardUtilityTray
      :open="utilityTrayOpen"
      title="Collection, export, and display settings"
      description="Secondary actions stay in the utility tray so the commander route can keep search, filters, and results in the main flow."
      @close="closeUtilityTray"
    >
      <DashboardUtilityContent
        :has-commander="true"
        :has-csv-data="hasCsvData"
        :inventory-summary="inventorySummary"
        :collection-mode-label="collectionModeLabel"
        :collection-mode-hint="collectionModeHint"
        :collection-source-name="collectionSourceName"
        :collection-imported-at="collectionImportedAt"
        :decklist-text="decklistExport?.text"
        :decklist-copied="decklistCopied"
        :export-helper-text="exportHelperText"
        :density="density"
        :density-options="densityOptions"
        :theme="theme"
        :background-enabled="backgroundEnabled"
        @open-upload="openUploadModal"
        @clear-upload="clearUploadedCollection"
        @copy-decklist="copyDecklistFromHeader"
        @download-decklist="downloadDecklistFromHeader"
        @density-change="setDensity"
        @toggle-theme="toggleTheme"
        @toggle-background="toggleBackground"
      />
    </DashboardUtilityTray>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import DashboardBrowseRail from "./dashboard/DashboardBrowseRail.vue";
import DashboardUtilityContent from "./dashboard/DashboardUtilityContent.vue";
import DashboardUtilityTray from "./dashboard/DashboardUtilityTray.vue";
import CommanderCardlistSection from "./commander-route/CommanderCardlistSection.vue";
import CommanderResultsCommandBar from "./commander-route/CommanderResultsCommandBar.vue";
import CommanderRouteMasthead from "./commander-route/CommanderRouteMasthead.vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import { CNotice, CSurface, CText } from "./core";
import { EDHRECBracket, EDHRECCompanion, EDHRECPageModifier, EDHRECPageType } from "./helpers/enums";
import { useDashboardState } from "../composables/useDashboardState";
import { useEdhrecCardlists } from "../composables/useEdhrecCardlists";
import { useEdhrecData } from "../composables/useEdhrecData";
import { useEdhrecRouteState } from "../composables/useEdhrecRouteState";
import { useScryfallCardData } from "../composables/useScryfallCardData";
import type { ColumnDefinition } from "./CardTable.vue";

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

const {
  decklistExport,
  decklistCopied,
  mainContentRef,
  controlPanelOpen,
  utilityTrayOpen,
  commanderSelection,
  commanderProfiles,
  commanderColorIdentity,
  commanderSpotlightLoading,
  commanderSpotlightBackdropUrl,
  canonicalEdhrecHref,
  hasCsvData,
  inventorySummary,
  theme,
  toggleTheme,
  backgroundEnabled,
  toggleBackground,
  density,
  setDensity,
  densityOptions,
  collectionModeLabel,
  collectionModeHint,
  collectionSourceName,
  collectionImportedAt,
  nextStepLabel,
  exportHelperText,
  filterOptions,
  openUploadModal,
  clearUploadedCollection,
  openControlPanel,
  closeControlPanel,
  openUtilityTray,
  closeUtilityTray,
  handleDecklistUpdate,
  handleSelectionChange,
  copyDecklistFromHeader,
  downloadDecklistFromHeader,
  showNextCommanderPrinting,
  showPreviousCommanderPrinting,
  setOwnedFilter,
} = useDashboardState();

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

const findLabel = (
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
  fallback: string
) => options.find((option) => option.value === value)?.label ?? fallback;

const pageTypeLabel = computed(() =>
  findLabel(Object.values(EDHRECPageType), chosenPageType.value, "Commander")
);
const bracketLabel = computed(() => {
  if (!chosenBracket.value || chosenBracket.value === EDHRECBracket.ALL.value) {
    return "";
  }
  const label = findLabel(Object.values(EDHRECBracket), chosenBracket.value, "Bracket");
  const bracketNumber = label.match(/^(\d+)/)?.[1];
  return bracketNumber ? `Bracket ${bracketNumber}` : label;
});
const modifierLabel = computed(() =>
  chosenModifier.value && chosenModifier.value !== EDHRECPageModifier.ANY.value
    ? findLabel(Object.values(EDHRECPageModifier), chosenModifier.value, "Budget")
    : ""
);
const companionLabel = computed(() =>
  chosenCompanion.value && chosenCompanion.value !== EDHRECCompanion.NONE.value
    ? `${findLabel(Object.values(EDHRECCompanion), chosenCompanion.value, "Companion")} companion`
    : ""
);

const deckViewTone = computed(() => {
  if (deckFilterLabel.value === "Owned cards") {
    return "success" as const;
  }
  if (deckFilterLabel.value === "Missing cards") {
    return "warn" as const;
  }
  return "accent" as const;
});

const collectionStateLabel = computed(() =>
  hasCsvData.value ? "Collection loaded" : "Collection pending"
);

const collectionStateValue = computed(() =>
  hasCsvData.value ? inventorySummary.value : "Upload a CSV to unlock owned and missing deck views."
);

const pageLensLabel = computed(() => {
  const parts = [pageTypeLabel.value, bracketLabel.value, modifierLabel.value, companionLabel.value]
    .filter(Boolean)
    .join(" | ");
  return parts || "Commander";
});

const ownershipSummary = computed(() => {
  if (!cardlistEntries.value.length) {
    return `Showing ${deckFilterLabel.value.toLowerCase()} while results finish loading.`;
  }
  return `Showing ${deckFilterLabel.value.toLowerCase()} across ${cardlistEntries.value.length} active section${cardlistEntries.value.length === 1 ? "" : "s"}.`;
});

const deckViewFilterOptions = computed(() =>
  filterOptions.value.map((option) => ({
    ...option,
    count:
      option.value === true
        ? deckViewCounts.value.owned
        : option.value === false
          ? deckViewCounts.value.missing
          : deckViewCounts.value.all,
  }))
);

const mastheadStatusItems = computed(() => {
  const items: Array<{
    label: string;
    tone?: "default" | "accent" | "success" | "warn" | "danger" | "muted";
  }> = [
    {
      label: collectionStateLabel.value,
      tone: hasCsvData.value ? "accent" : "muted",
    },
    {
      label: deckFilterLabel.value,
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

const mastheadStatItems = computed(() => [
  {
    label: "Active sections",
    value: `${cardlistEntries.value.length} of ${totalSectionCount.value}`,
  },
  {
    label: "Visible cards",
    value: String(visibleCardCount.value),
    tone: deckViewTone.value,
  },
  {
    label: "Deck view",
    value: deckFilterLabel.value,
    tone: deckViewTone.value,
  },
  {
    label: "Collection state",
    value: collectionStateValue.value,
    tone: hasCsvData.value ? "success" : "muted",
  },
  {
    label: "Page lens",
    value: pageLensLabel.value,
  },
]);

const showNoMatchingSections = computed(
  () =>
    !cardlistEntries.value.length &&
    !readerLoading.value &&
    Boolean(currentCommanderSlug.value) &&
    !error.value
);

watchEffect(() => {
  if (decklistPayload.value) {
    handleDecklistUpdate(decklistPayload.value);
  }
});

const handleCommanderSelection = (slug: string) => {
  setCommanderSlug(slug);
};

const handleToggleExpandAll = () => {
  if (allSectionsExpanded.value) {
    collapseAllSections();
    return;
  }
  expandAllSections();
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
</script>
