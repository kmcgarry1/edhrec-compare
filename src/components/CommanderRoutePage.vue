<template>
  <section
    class="mx-auto flex min-h-screen w-full max-w-[108rem] flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8 2xl:px-10"
  >
    <GlobalLoadingBanner />

    <main id="main-content" :ref="setMainContentRef" class="mt-5 flex-1 space-y-4">
      <GlobalLoadingBanner
        scope="scryfall-bulk"
        placement-class="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4"
      >
        Loading Scryfall data...
      </GlobalLoadingBanner>

      <section class="space-y-4">
        <DashboardBrowseRail
          ref="browseRailRef"
          :show-desktop-rail="false"
          :selected-slug="currentCommanderSlug"
          :selection="commanderSelection"
          :bracket="chosenBracket"
          :modifier="chosenModifier"
          :page-type="chosenPageType"
          :companion="chosenCompanion"
          :deck-tag="chosenDeckTag"
          :deck-tag-options="deckTagOptions"
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
          @update:deck-tag="setDeckTag"
        />

        <div class="min-w-0 space-y-4">
          <CommanderRouteMasthead
            :commander-selection="commanderSelection"
            :commander-profiles="commanderProfiles"
            :commander-color-identity="commanderColorIdentity"
            :spotlight-loading="commanderSpotlightLoading"
            :next-step-label="nextStepLabel"
            :canonical-edhrec-href="canonicalEdhrecHref"
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
              :has-csv-data="hasCsvData"
              :filter-options="deckViewFilterOptions"
              :decklist-available="Boolean(decklistExport?.text)"
              :decklist-copied="decklistCopied"
              :display-mode="displayMode"
              :price-mode="priceMode"
              @navigate="scrollToSection"
              @filter-change="setOwnedFilter"
              @open-filters="openControlPanel"
              @display-mode-change="setDisplayMode"
              @price-mode-change="setPriceMode"
              @toggle-expand-all="handleToggleExpandAll"
              @copy-decklist="copyDecklistFromHeader"
              @download-decklist="downloadDecklistFromHeader"
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
                  :display-mode="displayMode"
                  :price-mode="priceMode"
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
import { computed, ref, watchEffect, type ComponentPublicInstance } from "vue";
import DashboardBrowseRail from "./dashboard/DashboardBrowseRail.vue";
import DashboardUtilityContent from "./dashboard/DashboardUtilityContent.vue";
import DashboardUtilityTray from "./dashboard/DashboardUtilityTray.vue";
import CommanderCardlistSection from "./commander-route/CommanderCardlistSection.vue";
import CommanderResultsCommandBar from "./commander-route/CommanderResultsCommandBar.vue";
import CommanderRouteMasthead from "./commander-route/CommanderRouteMasthead.vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import { CNotice, CSurface, CText } from "./core";
import {
  EDHRECBracket,
  EDHRECCompanion,
  EDHRECPageModifier,
  EDHRECPageType,
} from "./helpers/enums";
import { useDashboardState } from "../composables/useDashboardState";
import { useCardDisplayPreferences } from "../composables/useCardDisplayPreferences";
import { useEdhrecCardlists } from "../composables/useEdhrecCardlists";
import { useEdhrecData } from "../composables/useEdhrecData";
import { useEdhrecRouteState } from "../composables/useEdhrecRouteState";
import { useScryfallCardData } from "../composables/useScryfallCardData";
import type { ColumnDefinition } from "./CardTable.vue";

const browseRailRef = ref<InstanceType<typeof DashboardBrowseRail> | null>(null);
const { displayMode, priceMode, setDisplayMode, setPriceMode } = useCardDisplayPreferences();

const {
  chosenPageType,
  chosenBracket,
  chosenModifier,
  chosenCompanion,
  chosenDeckTag,
  currentCommanderSlug,
  commanderUrl,
  setCommanderSlug,
  setBracket,
  setModifier,
  setPageType,
  setCompanion,
  setDeckTag,
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

const { cardlists, deckTags, error, readerLoading } = useEdhrecData(commanderUrl);

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
const deckTagOptions = computed(() =>
  deckTags.value.map((tag) => ({
    value: tag.slug,
    label: `${tag.value} (${tag.count.toLocaleString()})`,
    description: `${tag.count.toLocaleString()} deck${tag.count === 1 ? "" : "s"}`,
  }))
);
const deckTagLabel = computed(() => {
  if (!chosenDeckTag.value) {
    return "";
  }
  return (
    deckTags.value.find((tag) => tag.slug === chosenDeckTag.value)?.value ?? chosenDeckTag.value
  );
});
const sourceLensLabel = computed(() => {
  const parts = [
    pageTypeLabel.value,
    bracketLabel.value,
    modifierLabel.value,
    companionLabel.value,
    deckTagLabel.value,
  ].filter(Boolean);
  return parts.length ? parts.join(" | ") : "Commander";
});

const ownershipSummary = computed(() => {
  const sourcePrefix = `${sourceLensLabel.value}. `;
  if (error.value) {
    return `${sourcePrefix}Results could not be loaded. Retry or open EDHREC directly.`;
  }
  if (readerLoading.value && !cardlistEntries.value.length) {
    return `${sourcePrefix}Loading card recommendations.`;
  }
  if (!hasCsvData.value) {
    return `${sourcePrefix}Showing all recommendations across ${cardlistEntries.value.length} section${cardlistEntries.value.length === 1 ? "" : "s"}. Upload a collection for owned and missing views.`;
  }
  if (!cardlistEntries.value.length) {
    return `${sourcePrefix}No recommendations match ${deckFilterLabel.value.toLowerCase()}.`;
  }
  return `${sourcePrefix}Showing ${deckFilterLabel.value.toLowerCase()} across ${cardlistEntries.value.length} active section${cardlistEntries.value.length === 1 ? "" : "s"}.`;
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

watchEffect(() => {
  if (!chosenDeckTag.value || !deckTags.value.length) {
    return;
  }
  if (!deckTags.value.some((tag) => tag.slug === chosenDeckTag.value)) {
    setDeckTag("");
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

const setMainContentRef = (element: Element | ComponentPublicInstance | null) => {
  mainContentRef.value = element instanceof HTMLElement ? element : null;
};

const cardTableColumns = computed<ColumnDefinition[]>(() => [
  { key: "owned", label: "Owned", align: "center", class: "w-14" },
  { key: "name", label: "Card" },
  { key: "mana", label: "Mana", class: "w-28" },
  { key: "type", label: "Type" },
  { key: "rarity", label: "Rarity", class: "w-20" },
  { key: "status", label: "", align: "center", class: "w-24" },
  ...(priceMode.value !== "eur"
    ? [{ key: "usd", label: "USD", align: "right" as const, class: "w-20" }]
    : []),
  ...(priceMode.value !== "usd"
    ? [{ key: "eur", label: "EUR", align: "right" as const, class: "w-20" }]
    : []),
]);
</script>
