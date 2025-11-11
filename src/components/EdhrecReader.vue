<template>
  <section class="space-y-8 text-slate-900 dark:text-slate-100">
    <Card
      v-if="readerLoading"
      rounded="rounded-2xl"
      shadow="shadow-lg shadow-slate-900/5 dark:shadow-black/40"
      class="text-sm text-slate-500 dark:text-slate-400"
    >
      Loading commander data...
    </Card>
    <Card
      v-else-if="error"
      rounded="rounded-2xl"
      shadow="shadow-lg shadow-rose-200/40 dark:shadow-rose-900/40"
      border="border border-rose-200 dark:border-rose-500/30"
      background="bg-rose-50 dark:bg-rose-950/30"
      class="text-sm text-rose-700 dark:text-rose-200"
    >
      Error: {{ error }}
    </Card>

    <GlobalLoadingBanner
      v-else-if="bulkCardLoading"
      scope="scryfall-bulk"
    >
      Loading Scryfall data...
    </GlobalLoadingBanner>

    <Card padding="p-6">
      <commander-search @commanderSelected="searchCommander" />
    </Card>

    <Card
      v-for="cardlist in cardlists"
      :key="cardlist.header"
      as="article"
      class="space-y-6 flex flex-col flex-wrap"
      padding="p-6"
      background="bg-white/95 dark:bg-slate-900/60"
      shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/50"
    >
      <header
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500/80 dark:text-emerald-300/70"
          >
            EDHREC Cardlist
          </p>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
            {{ cardlist.header }}
          </h2>
        </div>
        <div class="flex flex-wrap gap-2 text-sm font-semibold">
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === true ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = true"
          >
            Owned
          </button>
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === false ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = false"
          >
            Unowned
          </button>
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === null ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = null"
          >
            Show All
          </button>
        </div>
      </header>

      <div class="flex flex-col flex-wrap gap-3" aria-live="polite">
        <scryfall-card-row
          v-for="card in scryfallCardData.filter(
            (c) =>
              c.name &&
              filteredCards(cardlist.cardviews).some((fc) => fc.name === c.name)
          )"
          :key="card.id"
          :card="card"
          :have="isCardInUpload(card.name)"
        />
      </div>
    </Card>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useLocalStorage, useDebounceFn } from "@vueuse/core";
import { getCardsByNames } from "../api/scryfallApi";
import {
  Card,
  CommanderSearch,
  GlobalLoadingBanner,
  ScryfallCardRow,
} from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";

interface EdhrecData {
  container?: {
    json_dict?: {
      cardlists?: {
        header: string;
        cardviews: { id: string; name: string }[];
      }[];
    };
  };
}

const data = ref<EdhrecData | null>(null);
const error = ref<string | null>(null);
const searchQuery = ref("");
const showOwned = ref<boolean | null>(null);

const activeFilterClass =
  "border-emerald-500/80 bg-emerald-100 text-emerald-900 shadow-inner shadow-emerald-200 dark:border-emerald-400/70 dark:bg-emerald-400/20 dark:text-emerald-100 dark:shadow-emerald-500/30";
const inactiveFilterClass =
  "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-emerald-400/40 dark:hover:text-white";

const { withLoading, getScopeLoading } = useGlobalLoading();
const readerScope = "edhrec-reader";
const bulkCardScope = "scryfall-bulk";
const readerLoading = getScopeLoading(readerScope);
const bulkCardLoading = getScopeLoading(bulkCardScope);

const fetchJsonData = async (url: string) => {
  error.value = null;

  await withLoading(
    async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        data.value = await response.json();
      } catch (err) {
        error.value = err instanceof Error ? err.message : "An error occurred";
      }
    },
    "Fetching commander data...",
    readerScope
  );
};

const cardlists = computed(
  () => data.value?.container?.json_dict?.cardlists || []
);

const uploadedRows = useLocalStorage<string[][]>("csv-upload-data", []);
const uploadedHeaders = useLocalStorage<string[]>("csv-upload-headers", []);

const uploadedNameIndex = computed(() => {
  const headers = uploadedHeaders.value;
  const idx = headers.findIndex(
    (header) => header.trim().toLowerCase() === "name"
  );
  return idx >= 0 ? idx : 0;
});

const normalizeCardName = (value: string) => value.trim().toLowerCase();

const uploadedCardNameSet = computed(() => {
  if (!uploadedRows.value.length) {
    return new Set<string>();
  }

  const idx = uploadedNameIndex.value;

  return new Set(
    uploadedRows.value
      .map((row) => row[idx] ?? row[0] ?? "")
      .map((value) => normalizeCardName(value))
      .filter((value) => value.length > 0)
  );
});

const isCardInUpload = (cardName: string) => {
  if (!cardName) {
    return false;
  }

  return uploadedCardNameSet.value.has(normalizeCardName(cardName));
};

const searchCommander = useDebounceFn((query: string) => {
  const formattedQuery = query.toLowerCase().replace(/[\s,]+/g, "-");
  const removeApostrophes = formattedQuery.replace(/'/g, "");
  fetchJsonData(
    `https://json.edhrec.com/pages/commanders/${removeApostrophes}.json`
  );
}, 300);

watch(searchQuery, (newQuery) => {
  searchCommander(newQuery);
});
const filteredCards = (cardviews: { id: string; name: string }[]) => {
  if (showOwned.value === null) return cardviews;
  return cardviews.filter(
    (card) => isCardInUpload(card.name) === showOwned.value
  );
};

const allCards = computed(() => {
  const cards: { name: string }[] = [];
  cardlists.value.forEach((cardlist) => {
    cardlist.cardviews.forEach((card) => {
      cards.push({ name: card.name });
    });
  });
  return cards;
});

const scryfallCardData = ref<any[]>([]);

const fetchAllCardData = async () => {
  if (allCards.value.length === 0) {
    scryfallCardData.value = [];
    return;
  }

  await withLoading(
    async () => {
      try {
        const scryfallData = await getCardsByNames(allCards.value);
        scryfallCardData.value = scryfallData;
      } catch (err) {
        console.error("Failed to fetch card data from Scryfall:", err);
      }
    },
    "Fetching detailed card data...",
    bulkCardScope
  );
};

watch(allCards, fetchAllCardData, { immediate: true });

onMounted(() => {
  fetchJsonData("https://json.edhrec.com/pages/commanders/teysa-karlov.json");
});
</script>
