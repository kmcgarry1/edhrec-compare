<template>
  <section
    class="grid gap-4 xl:grid-cols-[18.5rem_minmax(0,64rem)] xl:justify-center 2xl:grid-cols-[19.5rem_minmax(0,68rem)]"
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
      :bracket="chosenBracket"
      :modifier="chosenModifier"
      :page-type="chosenPageType"
      :companion="chosenCompanion"
      :sections="cardlistSections"
      :active-id="activeSectionId"
      :open="browseRailOpen"
      :loading="readerLoading"
      @close="emit('close-browse')"
      @navigate="scrollToSection"
      @commander-selected="handleCommanderSelection"
      @selection-change="handleSelectionChange"
      @update:bracket="setBracket"
      @update:modifier="setModifier"
      @update:page-type="setPageType"
      @update:companion="setCompanion"
    />

    <CSurface variant="content" size="md" radius="3xl" class="min-w-0 space-y-4">
      <div
        class="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <EdhrecResultsHeader :list-count="cardlistSections.length" :card-count="totalCardCount" />
        <CBadge tone="default" variant="outline" size="sm" text-case="normal">
          {{ currentCommanderSlug ? "Route synced" : "Awaiting commander" }}
        </CBadge>
      </div>

      <FloatingCardlistNav
        v-if="cardlistSections.length"
        :sections="cardlistSections"
        :active-id="activeSectionId"
        class="xl:hidden"
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
    </CSurface>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import DashboardBrowseRail from "./DashboardBrowseRail.vue";
import { CardlistSection, FloatingCardlistNav, GlobalLoadingBanner, EdhrecEmptyState } from "..";
import { CBadge, CNotice, CSurface, CText } from "../core";
import { useEdhrecRouteState } from "../../composables/useEdhrecRouteState";
import { useEdhrecData } from "../../composables/useEdhrecData";
import { useEdhrecCardlists } from "../../composables/useEdhrecCardlists";
import { useScryfallCardData } from "../../composables/useScryfallCardData";
import EdhrecResultsHeader from "../edhrec/EdhrecResultsHeader.vue";
import type { ColumnDefinition } from "../CardTable.vue";
import type { CommanderSelection, DecklistPayload } from "../../types/edhrec";

const props = defineProps<{
  browseRailOpen: boolean;
}>();

const emit = defineEmits<{
  decklistUpdate: [payload: DecklistPayload];
  "selection-change": [payload: CommanderSelection];
  "close-browse": [];
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

const selectSuggestedCommander = (name: string) => {
  browseRailRef.value?.selectPrimaryCommander(name);
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

const __templateBindings = props;
void __templateBindings;
</script>
