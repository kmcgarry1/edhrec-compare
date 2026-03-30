<template>
  <section :class="['text-[color:var(--text)]', spacing.stackSpace]">
    <GlobalLoadingBanner
      scope="scryfall-bulk"
      placement-class="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4"
    >
      Loading Scryfall data...
    </GlobalLoadingBanner>

    <CSurface variant="command" size="md" radius="2xl" class="space-y-3">
      <EdhrecControls
        ref="controlsRef"
        :selected-slug="currentCommanderSlug"
        :bracket="chosenBracket"
        :modifier="chosenModifier"
        :page-type="chosenPageType"
        :companion="chosenCompanion"
        @commander-selected="handleCommanderSelection"
        @selection-change="handleSelectionChange"
        @update:bracket="setBracket"
        @update:modifier="setModifier"
        @update:page-type="setPageType"
        @update:companion="setCompanion"
      />
    </CSurface>

    <CSurface variant="content" size="md" radius="2xl" class="space-y-4">
      <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <EdhrecResultsHeader
          :list-count="cardlistSections.length"
          :total-section-count="totalSectionCount"
          :card-count="visibleCardCount"
          :deck-view-label="deckFilterLabel"
          :ownership-summary="`Showing ${deckFilterLabel.toLowerCase()}.`"
          :all-expanded="allSectionsExpanded"
          @toggle-expand-all="handleToggleExpandAll"
        />

        <FloatingCardlistNav
          v-if="cardlistSections.length"
          :sections="cardlistSections"
          :active-id="activeSectionId"
          class="xl:max-w-[36rem]"
          @navigate="scrollToSection"
        />
      </div>

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
    </CSurface>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { CNotice, CSurface, CText } from "./core";
import { useLayoutDensity } from "../composables/useLayoutDensity";
import { useEdhrecRouteState } from "../composables/useEdhrecRouteState";
import { useEdhrecData } from "../composables/useEdhrecData";
import { useEdhrecCardlists } from "../composables/useEdhrecCardlists";
import { useScryfallCardData } from "../composables/useScryfallCardData";
import CardlistSection from "./CardlistSection.vue";
import FloatingCardlistNav from "./FloatingCardlistNav.vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import EdhrecEmptyState from "./EdhrecEmptyState.vue";
import EdhrecControls from "./edhrec/EdhrecControls.vue";
import EdhrecResultsHeader from "./edhrec/EdhrecResultsHeader.vue";
import type { ColumnDefinition } from "./CardTable.vue";
import type { CommanderSelection, DecklistPayload } from "../types/edhrec";

const emit = defineEmits<{
  decklistUpdate: [payload: DecklistPayload];
  "selection-change": [payload: CommanderSelection];
}>();

const { spacing } = useLayoutDensity();

const controlsRef = ref<InstanceType<typeof EdhrecControls> | null>(null);

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

const handleCommanderSelection = (slug: string) => {
  setCommanderSlug(slug);
};

const handleSelectionChange = (payload: CommanderSelection) => {
  emit("selection-change", payload);
};

watchEffect(() => {
  if (decklistPayload.value) {
    emit("decklistUpdate", decklistPayload.value);
  }
});

const popularCommanders = [
  { name: "Atraxa, Grand Unifier" },
  { name: "The Ur-Dragon" },
  { name: "Miirym, Sentinel Wyrm" },
  { name: "Edgar Markov" },
  { name: "Chulane, Teller of Tales" },
];

const showEmptyState = computed(
  () =>
    !cardlistSections.value.length &&
    !readerLoading.value &&
    !currentCommanderSlug.value &&
    !error.value
);

const selectSuggestedCommander = (name: string) => {
  controlsRef.value?.selectPrimaryCommander(name);
};

const handleToggleExpandAll = () => {
  if (allSectionsExpanded.value) {
    collapseAllSections();
    return;
  }
  expandAllSections();
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
