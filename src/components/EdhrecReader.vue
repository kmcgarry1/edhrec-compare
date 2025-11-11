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

    <GlobalLoadingBanner v-else-if="bulkCardLoading" scope="scryfall-bulk">
      Loading Scryfall data...
    </GlobalLoadingBanner>

    <Card
      padding="p-4 sm:p-6"
      shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/50"
      class="space-y-5"
    >
      <div class="space-y-2">
        <commander-search @commanderSelected="searchCommander" />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Start typing to search EDHREC commanders, then refine the results with
          the filters below.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <div class="space-y-1">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Bracket
          </p>
          <dropdown-select
            :options="bracketOptions"
            @update:modelValue="setBracket"
            :modelValue="chosenBracket"
            placeholder="Select Bracket"
          />
        </div>
        <div class="space-y-1">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Budget
          </p>
          <dropdown-select
            :options="modifierOptions"
            @update:modelValue="setModifier"
            :modelValue="chosenModifier"
            placeholder="Select Modifier"
          />
        </div>
        <div class="space-y-1">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Page Type
          </p>
          <dropdown-select
            :options="pageTypeOptions"
            @update:modelValue="setPageType"
            :modelValue="chosenPageType"
            placeholder="Select Commander"
          />
        </div>
      </div>

      <div
        class="flex flex-col gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/40 px-4 py-3 text-xs text-slate-400 dark:text-slate-300 sm:flex-row sm:items-center"
      >
        <code
          class="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-xs md:text-sm"
        >
          {{ previewUrl }}
        </code>
        <button
          type="button"
          class="w-full rounded-full border border-emerald-400/50 px-3 py-1 font-semibold text-emerald-200 transition hover:border-emerald-300 hover:text-white sm:w-auto sm:self-stretch"
          @click="copyPreviewUrl"
          aria-label="Copy EDHREC URL to clipboard"
        >
          {{ copyState === "copied" ? "Copied!" : "Copy URL" }}
        </button>
      </div>
    </Card>

    <Card
      v-for="cardlist in cardlists"
      :key="cardlist.header"
      as="article"
      class="space-y-6"
      padding="p-4 sm:p-6"
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
        <div
          class="flex flex-wrap gap-2 text-sm font-semibold"
        >
          <button
            type="button"
            class="w-full rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 md:w-auto"
            :class="
              showOwned === true ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = true"
          >
            Owned
          </button>
          <button
            type="button"
            class="w-full rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 md:w-auto"
            :class="
              showOwned === false ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = false"
          >
            Unowned
          </button>
          <button
            type="button"
            class="w-full rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 md:w-auto"
            :class="
              showOwned === null ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = null"
          >
            Show All
          </button>
        </div>
      </header>

      <div class="hidden md:block">
        <CardTable
          :columns="cardTableColumns"
          :rows="getTableRows(cardlist)"
          row-key="id"
          aria-live="polite"
        >
          <template #default="{ row }">
            <ScryfallCardRow :card="row.card" :have="Boolean(row.have)" />
          </template>
        </CardTable>
      </div>
      <div class="md:hidden space-y-3">
        <ScryfallCardRow
          v-for="row in getTableRows(cardlist)"
          :key="row.id + '-mobile'"
          :card="row.card"
          :have="Boolean(row.have)"
          variant="card"
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
  EDHRECBracket,
  EDHRECPageType,
  EDHRECPageModifier,
} from "./helpers/enums";
import {
  Card,
  CardTable,
  CommanderSearch,
  GlobalLoadingBanner,
  ScryfallCardRow,
  DropdownSelect,
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

const showOwned = ref<boolean | null>(null);
const chosenPageType = ref<string>(EDHRECPageType.COMMANDER.value);
const chosenBracket = ref<string>(EDHRECBracket.ALL.value);
const chosenModifier = ref<string>(EDHRECPageModifier.ANY.value);
const bracketOptions = Object.values(EDHRECBracket);
const modifierOptions = Object.values(EDHRECPageModifier);
const pageTypeOptions = Object.values(EDHRECPageType);
const setBracket = (value: string | number) => {
  chosenBracket.value = String(value);
};
const setModifier = (value: string | number) => {
  chosenModifier.value = String(value);
};
const setPageType = (value: string | number) => {
  chosenPageType.value = String(value);
};

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

const edhrecUrlPrefix = "https://json.edhrec.com/pages/";
const edhrecUrlSuffix = ".json";
const defaultCommanderSlug = "teysa-karlov";
const currentCommanderSlug = ref<string>(defaultCommanderSlug);

// Use chosenPageType.value directly now that enum values match URL segments

const buildCommanderUrl = (slug: string) => {
  const segments = [chosenPageType.value, slug];
  if (chosenBracket.value) {
    segments.push(chosenBracket.value);
  }
  if (chosenModifier.value) {
    segments.push(chosenModifier.value);
  }
  return `${edhrecUrlPrefix}${segments.join("/")}${edhrecUrlSuffix}`;
};

const previewUrl = computed(() =>
  buildCommanderUrl(currentCommanderSlug.value ?? defaultCommanderSlug)
);
const copyState = ref<"idle" | "copied">("idle");

const copyPreviewUrl = async () => {
  try {
    await navigator.clipboard.writeText(previewUrl.value);
    copyState.value = "copied";
    setTimeout(() => {
      copyState.value = "idle";
    }, 1600);
  } catch (err) {
    console.error("Unable to copy URL:", err);
  }
};

const searchCommander = useDebounceFn((query: string) => {
  const slug = slugifyCommander(query);
  if (!slug) {
    return;
  }
  currentCommanderSlug.value = slug;
  fetchJsonData(buildCommanderUrl(slug));
}, 300);

watch([chosenPageType, chosenBracket, chosenModifier], () => {
  if (currentCommanderSlug.value) {
    fetchJsonData(buildCommanderUrl(currentCommanderSlug.value));
  }
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
const scryfallIndex = computed(() => {
  const map = new Map<string, any>();
  scryfallCardData.value.forEach((card) => {
    map.set(normalizeCardName(card.name), card);
  });
  return map;
});

type TableColumn = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  class?: string;
};

const cardTableColumns: TableColumn[] = [
  { key: "owned", label: "Owned", align: "center", class: "w-14" },
  { key: "name", label: "Card" },
  { key: "mana", label: "Mana", class: "w-28" },
  { key: "type", label: "Type" },
  { key: "stats", label: "P/T", align: "center", class: "w-16" },
  { key: "set", label: "Set", align: "center", class: "w-16" },
  { key: "rarity", label: "Rarity", class: "w-20" },
  { key: "status", label: "", align: "center", class: "w-24" },
  { key: "usd", label: "USD", align: "right", class: "w-20" },
  { key: "eur", label: "EUR", align: "right", class: "w-20" },
];

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

const getTableRows = (cardlist: {
  header: string;
  cardviews: { id: string; name: string }[];
}) =>
  filteredCards(cardlist.cardviews).map((cardview) => {
    const info =
      scryfallIndex.value.get(normalizeCardName(cardview.name)) ?? null;
    const requestedNames = cardview.name.split("//").map((n) => n.trim());
    const faces = info?.card_faces ?? [];
    const matchedFace =
      faces.find((face: any) => requestedNames.includes(face.name)) ?? faces[0];
    const statsSource = matchedFace ?? info;
    const displayName =
      requestedNames.length > 1 ? cardview.name : info?.name ?? cardview.name;

    return {
      id: info?.id ?? `${cardlist.header}-${cardview.id}`,
      have: isCardInUpload(cardview.name),
      card: {
        id: info?.id ?? `${cardlist.header}-${cardview.id}`,
        name: displayName,
        mana_cost: statsSource?.mana_cost ?? "",
        type_line: statsSource?.type_line ?? "",
        power: statsSource?.power ?? null,
        toughness: statsSource?.toughness ?? null,
        set: info?.set ?? "",
        rarity: info?.rarity ?? "",
        prices: info?.prices ?? {
          usd: null,
          eur: null,
        },
        faces:
          faces.length > 1
            ? faces.map((face: any) => ({
                name: face.name,
                mana_cost: face.mana_cost,
                type_line: face.type_line,
              }))
            : undefined,
      },
    };
  });

onMounted(() => {
  fetchJsonData(buildCommanderUrl(defaultCommanderSlug));
});

function slugifyCommander(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[\s,]+/g, "-");
}
</script>
