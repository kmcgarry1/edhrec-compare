<template>
  <section class="space-y-8 text-slate-900 dark:text-slate-100">
    <FloatingCardlistNav
      v-if="cardlistSections.length"
      :sections="cardlistSections"
      :active-id="activeSectionId"
      @navigate="scrollToSection"
    />
    <Card
      v-if="readerLoading"
      rounded="rounded-2xl"
      shadow="shadow-lg shadow-slate-900/5 dark:shadow-black/40"
      class="text-sm text-slate-500 dark:text-slate-400"
    >
      Loading commander data...
    </Card>
    <Card
      v-if="error"
      rounded="rounded-2xl"
      shadow="shadow-lg shadow-rose-200/40 dark:shadow-rose-900/40"
      border="border border-rose-200 dark:border-rose-500/30"
      background="bg-rose-50 dark:bg-rose-950/30"
      class="text-sm text-rose-700 dark:text-rose-200"
    >
      Error: {{ error }}
    </Card>

    <div class="min-h-[40px]">
      <GlobalLoadingBanner
        scope="scryfall-bulk"
        inline
        placementClass="w-full flex justify-center"
      >
        Loading Scryfall data...
      </GlobalLoadingBanner>
    </div>

    <Card
      padding="p-4 sm:p-6"
      shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/50"
      :class="[
        'space-y-5 transition-opacity duration-200',
        readerLoading ? 'opacity-60' : '',
      ]"
      :aria-busy="readerLoading"
    >
        <div class="space-y-2">
          <commander-search @commanderSelected="handleCommanderSelection" />
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Start typing to search EDHREC commanders, then refine the results with
            the filters below.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
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
              placeholder="Select Page Type"
            />
          </div>
          <div class="space-y-1">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Companion
            </p>
            <dropdown-select
              :options="Object.values(EDHRECCompanion)"
              @update:modelValue="setCompanion"
              :modelValue="chosenCompanion"
              placeholder="Select Companion"
            />
          </div>
        </div>
      </Card>
    <Card
      v-for="(cardlist, index) in cardlists"
      :key="cardlist.header"
      as="article"
      class="space-y-6"
      padding="p-4 sm:p-6"
      background="bg-white/95 dark:bg-slate-900/60"
      shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/50"
      :id="cardlistSections[index]?.id"
    >
      <header
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <svg
              v-if="cardlistSections[index]?.iconPath"
              viewBox="0 0 24 24"
              class="h-7 w-7 rounded-2xl bg-slate-100 p-1 text-emerald-600 dark:bg-slate-800"
              :style="{
                color: cardlistSections[index]?.iconColor || undefined,
              }"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="cardlistSections[index]?.iconPath" />
            </svg>
            <p
              class="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500/80 dark:text-emerald-300/70"
            >
              EDHREC Cardlist
            </p>
          </div>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
            {{ cardlist.header }}
          </h2>
        </div>
        <div class="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-300"
            :disabled="!cardlistDecklists[index]?.length"
            @click="handleCopyDecklist(cardlist, index)"
          >
            {{
              decklistCopySectionId === cardlistSections[index]?.id
                ? "Copied!"
                : "Copy for Archidekt/Moxfield"
            }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-emerald-400 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-300 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
            :disabled="!cardlistDecklists[index]?.length"
            @click="handleDownloadDecklist(cardlist, index)"
          >
            Download decklist.txt
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
import {
  ref,
  onMounted,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
  watchEffect,
} from "vue";
import { getCardsByNames } from "../api/scryfallApi";
import {
  EDHRECBracket,
  EDHRECPageType,
  EDHRECPageModifier,
  EDHRECCompanion,
} from "./helpers/enums";
import {
  Card,
  CardTable,
  CommanderSearch,
  GlobalLoadingBanner,
  ScryfallCardRow,
  DropdownSelect,
  FloatingCardlistNav,
} from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useCsvUpload } from "../composables/useCsvUpload";
import { getCardlistIcon } from "./helpers/cardlistIconMap";
import { useOwnedFilter } from "../composables/useOwnedFilter";
import { downloadTextFile } from "../utils/downloadTextFile";
import { useGlobalNotices } from "../composables/useGlobalNotices";

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

const { showOwned } = useOwnedFilter();
const { notifyError } = useGlobalNotices();

type DecklistSection = {
  id: string;
  label: string;
  text: string;
};

type DecklistPayload = {
  text: string;
  filterLabel: string;
  sections: DecklistSection[];
};

const emit = defineEmits<{
  decklistUpdate: [payload: DecklistPayload];
}>();
const chosenPageType = ref<string>(EDHRECPageType.COMMANDER.value);
const chosenBracket = ref<string>(EDHRECBracket.ALL.value);
const chosenModifier = ref<string>(EDHRECPageModifier.ANY.value);
const chosenCompanion = ref<string>(EDHRECCompanion.NONE.value);
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
const setCompanion = (value: string | number) => {
  chosenCompanion.value = String(value);
};

const { withLoading, getScopeLoading } = useGlobalLoading();
const readerScope = "edhrec-reader";
const bulkCardScope = "scryfall-bulk";
const readerLoading = getScopeLoading(readerScope);

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
        notifyError(
          error.value ?? "Unable to fetch commander data.",
          "EDHREC request failed"
        );
      }
    },
    "Fetching commander data...",
    readerScope
  );
};

const cardlists = computed(
  () => data.value?.container?.json_dict?.cardlists || []
);

const slugifyHeader = (value: string, index: number) => {
  const base = (value || `section-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base.length ? base : `section-${index + 1}`;
};

const cardlistSections = computed(() =>
  cardlists.value.map((cardlist, index) => {
    const id = slugifyHeader(cardlist.header, index);
    const iconConfig = getCardlistIcon(id);
    return {
      id,
      label: cardlist.header || `Cardlist ${index + 1}`,
      iconPath: iconConfig?.path,
      iconColor: iconConfig?.color,
    };
  })
);

const activeSectionId = ref<string>("");
const decklistCopySectionId = ref<string | null>(null);
let decklistCopyResetHandle: ReturnType<typeof setTimeout> | null = null;

let scrollListener: (() => void) | null = null;

const updateActiveSectionFromScroll = () => {
  if (typeof window === "undefined" || !cardlistSections.value.length) {
    activeSectionId.value = "";
    return;
  }
  const scrollPosition = window.scrollY + 120;
  let currentId = cardlistSections.value[0]?.id ?? "";

  for (const section of cardlistSections.value) {
    const el = document.getElementById(section.id);
    if (!el) {
      continue;
    }
    if (el.offsetTop <= scrollPosition) {
      currentId = section.id;
    } else {
      break;
    }
  }

  activeSectionId.value = currentId;
};

const detachScrollListener = () => {
  if (scrollListener && typeof window !== "undefined") {
    window.removeEventListener("scroll", scrollListener);
    scrollListener = null;
  }
};

const attachScrollListener = () => {
  if (typeof window === "undefined") {
    return;
  }
  detachScrollListener();
  scrollListener = () => {
    window.requestAnimationFrame(updateActiveSectionFromScroll);
  };
  window.addEventListener("scroll", scrollListener, { passive: true });
  updateActiveSectionFromScroll();
};

watch(
  cardlistSections,
  (sections) => {
    nextTick(() => {
      if (!sections.length) {
        activeSectionId.value = "";
        detachScrollListener();
        return;
      }
      attachScrollListener();
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  detachScrollListener();
  clearDecklistCopyState();
});

const scrollToSection = (id: string) => {
  if (typeof window === "undefined") {
    return;
  }
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  const offset = 80;
  const targetTop = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
};

const { rows: uploadedRows, headers: uploadedHeaders } = useCsvUpload();

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
const currentCommanderSlug = ref<string | null>(null);

const buildCommanderUrl = (slug: string | null | undefined) => {
  if (!slug) {
    return null;
  }
  const segments = [chosenPageType.value, slug];
  if (chosenBracket.value) {
    segments.push(chosenBracket.value);
  }
  if (
    chosenCompanion.value &&
    chosenCompanion.value !== EDHRECCompanion.NONE.value
  ) {
    segments.push(chosenCompanion.value);
  }
  if (chosenModifier.value) {
    segments.push(chosenModifier.value);
  }

  return `${edhrecUrlPrefix}${segments.join("/")}${edhrecUrlSuffix}`;
};

const handleCommanderSelection = (slug: string) => {
  if (!slug) {
    currentCommanderSlug.value = null;
    data.value = null;
    return;
  }
  currentCommanderSlug.value = slug;
  const url = buildCommanderUrl(slug);
  if (url) {
    fetchJsonData(url);
  }
};

watch([chosenPageType, chosenBracket, chosenModifier, chosenCompanion], () => {
  const url = buildCommanderUrl(currentCommanderSlug.value);
  if (url) {
    fetchJsonData(url);
  }
});
const filteredCards = (cardviews: { id: string; name: string }[]) => {
  if (showOwned.value === null) return cardviews;
  return cardviews.filter(
    (card) => isCardInUpload(card.name) === showOwned.value
  );
};

const getDeckFilterLabel = () => {
  if (showOwned.value === true) {
    return "Owned cards";
  }
  if (showOwned.value === false) {
    return "Unowned cards";
  }
  return "All cards";
};

const buildDecklistText = (
  cardlist: { header: string; cardviews: { id: string; name: string }[] },
  _sectionMeta?: { id: string; label: string }
) => {
  const cards = filteredCards(cardlist.cardviews);
  if (cards.length === 0) {
    return "";
  }
  return cards.map((card) => `1 ${card.name}`).join("\n");
};

const cardlistDecklists = computed(() =>
  cardlists.value.map((cardlist, index) =>
    buildDecklistText(cardlist, cardlistSections.value[index])
  )
);

const clearDecklistCopyState = () => {
  if (decklistCopyResetHandle) {
    clearTimeout(decklistCopyResetHandle);
    decklistCopyResetHandle = null;
  }
  decklistCopySectionId.value = null;
};

const buildDecklistPayload = (): DecklistPayload | null => {
  if (!cardlists.value.length) {
    return null;
  }
  const sections: DecklistSection[] = cardlists.value.map((cardlist, index) => {
    const sectionMeta = cardlistSections.value[index];
    const text = cardlistDecklists.value[index] ?? "";
    return {
      id: sectionMeta?.id ?? slugifyHeader(cardlist.header, index),
      label: sectionMeta?.label ?? cardlist.header ?? `Cardlist ${index + 1}`,
      text,
    };
  });
  const nonEmpty = sections.filter((section) => section.text.length > 0);
  const text = nonEmpty.map((section) => section.text).join("\n\n");
  return {
    text,
    filterLabel: getDeckFilterLabel(),
    sections,
  };
};

watchEffect(() => {
  const payload = buildDecklistPayload();
  if (payload) {
    emit("decklistUpdate", payload);
  }
});

const handleCopyDecklist = async (
  cardlist: { header: string; cardviews: { id: string; name: string }[] },
  index: number
) => {
  const text = cardlistDecklists.value[index] ?? "";
  if (!text) {
    return;
  }
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    console.warn("Clipboard API is unavailable in this environment.");
    return;
  }
  const sectionMeta = cardlistSections.value[index];
  try {
    clearDecklistCopyState();
    decklistCopySectionId.value =
      sectionMeta?.id ?? slugifyHeader(cardlist.header, index);
    await navigator.clipboard.writeText(text);
    decklistCopyResetHandle = setTimeout(() => {
      decklistCopySectionId.value = null;
      decklistCopyResetHandle = null;
    }, 1600);
  } catch (error) {
    console.error("Unable to copy decklist:", error);
    notifyError("Unable to copy the decklist to your clipboard.");
  }
};

const handleDownloadDecklist = (
  cardlist: { header: string; cardviews: { id: string; name: string }[] },
  index: number
) => {
  const sectionMeta = cardlistSections.value[index];
  const text = cardlistDecklists.value[index] ?? "";
  if (!text) {
    return;
  }
  const filename = `${
    sectionMeta?.id ?? slugifyHeader(cardlist.header, index)
  }.txt`;
  try {
    downloadTextFile(text, filename);
  } catch (error) {
    console.error("Unable to download decklist:", error);
    notifyError("Unable to download the decklist file.");
  }
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
        notifyError("Unable to fetch detailed card data from Scryfall.");
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
  // No default fetch; wait for explicit commander selection.
});
</script>
