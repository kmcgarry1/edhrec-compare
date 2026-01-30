<template>
  <section :class="['text-[color:var(--text)]', spacing.stackSpace]">
    <FloatingCardlistNav
      v-if="cardlistSections.length"
      :sections="cardlistSections"
      :active-id="activeSectionId"
      @navigate="scrollToSection"
    />
    <GlobalLoadingBanner
      scope="scryfall-bulk"
      placement-class="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4"
    >
      Loading Scryfall data...
    </GlobalLoadingBanner>

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

    <EdhrecResultsHeader
      :list-count="cardlistSections.length"
      :card-count="totalCardCount"
    />

    <Card
      v-if="error"
      rounded="rounded-2xl"
      border="border border-[color:var(--danger)]"
      background="bg-[color:var(--danger-soft)]"
      class="text-sm text-[color:var(--danger)]"
    >
      Error: {{ error }}
    </Card>

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
        @copy="handleCopyDecklist(entry.cardlist, entry.index)"
        @download="handleDownloadDecklist(entry.cardlist, entry.index)"
      />
    </template>
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { Card, CardlistSection, FloatingCardlistNav, GlobalLoadingBanner, EdhrecEmptyState } from ".";
import { useLayoutDensity } from "../composables/useLayoutDensity";
import { useEdhrecRouteState } from "../composables/useEdhrecRouteState";
import { useEdhrecData } from "../composables/useEdhrecData";
import { useEdhrecCardlists } from "../composables/useEdhrecCardlists";
import { useScryfallCardData } from "../composables/useScryfallCardData";
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

const { cardlists, error, totalCardCount, readerLoading } = useEdhrecData(commanderUrl);

const {
  cardlistSections,
  cardlistEntries,
  decklistPayload,
  decklistCopySectionId,
  activeSectionId,
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
