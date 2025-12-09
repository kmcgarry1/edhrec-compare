<template>
  <section class="space-y-8 text-slate-900 dark:text-slate-100">
    <FloatingCardlistNav
      v-if="cardlistSections.length"
      :sections="cardlistSections"
      :active-id="activeSectionId"
      @navigate="scrollToSection"
    />
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
    <GlobalLoadingBanner
      scope="scryfall-bulk"
      placement-class="pointer-events-none fixed inset-x-0 bottom-6 z-[9998] flex justify-center px-4"
    >
      Loading Scryfall data...
    </GlobalLoadingBanner>

    <Card
      padding="p-4 sm:p-6"
      shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/50"
      :class="['space-y-5 transition-opacity duration-200', readerLoading ? 'opacity-60' : '']"
      :aria-busy="readerLoading"
    >
      <div class="space-y-2">
        <CommanderSearch
          ref="commanderSearchRef"
          @commander-selected="handleCommanderSelection"
        />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Start typing to search EDHREC commanders, then refine the results with the filters below.
        </p>
      </div>

      <CommanderFilters
        :bracket="chosenBracket"
        :modifier="chosenModifier"
        :page-type="chosenPageType"
        :companion="chosenCompanion"
        @update:bracket="setBracket"
        @update:modifier="setModifier"
        @update:page-type="setPageType"
        @update:companion="setCompanion"
      />
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
import { ref, onMounted, computed, watch, nextTick, onBeforeUnmount, watchEffect } from "vue";
import { getCardsByNames, type ScryfallCard } from "../api/scryfallApi";
import { requestCache } from "../api/requestCache";
import {
  EDHRECBracket,
  EDHRECPageType,
  EDHRECPageModifier,
  EDHRECCompanion,
} from "./helpers/enums";
import {
  Card,
  CommanderSearch,
  CommanderFilters,
  CardlistSection,
  GlobalLoadingBanner,
  FloatingCardlistNav,
  EdhrecEmptyState,
} from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useCsvUpload } from "../composables/useCsvUpload";
import { getCardlistIcon } from "./helpers/cardlistIconMap";
import { useOwnedFilter } from "../composables/useOwnedFilter";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import type { CardTableRow } from "../types/cards";
import type { ColumnDefinition } from "./CardTable.vue";
import CommanderSearchInstance from "./CommanderSearch.vue";

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
const commanderSearchRef = ref<InstanceType<typeof CommanderSearchInstance> | null>(null);

const { showOwned } = useOwnedFilter();

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
const bulkCardsLoading = getScopeLoading(bulkCardScope);

const fetchJsonData = async (url: string) => {
  error.value = null;

  await withLoading(
    async () => {
      // Deduplicate EDHREC requests by URL
      await requestCache.dedupe(`edhrec:${url}`, async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          data.value = await response.json();
        } catch (err) {
          const handled = handleError(err, {
            notify: true,
            fallbackMessage: "Unable to fetch commander data from EDHREC.",
            context: "EDHREC request failed",
          });
          error.value = handled.userMessage;
        }
      });
    },
    "Fetching commander data...",
    readerScope
  );
};

const cardlists = computed(() => data.value?.container?.json_dict?.cardlists || []);

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
  const idx = headers.findIndex((header) => header.trim().toLowerCase() === "name");
  return idx >= 0 ? idx : 0;
});

const normalizeCardName = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

const cardNameVariants = (value: string) => {
  if (!value) {
    return [] as string[];
  }
  const variants = new Set<string>();
  const normalizedFull = normalizeCardName(value);
  if (normalizedFull) {
    variants.add(normalizedFull);
  }

  value
    .split("//")
    .map((part) => normalizeCardName(part))
    .filter((part) => part.length > 0)
    .forEach((part) => variants.add(part));

  return Array.from(variants);
};

const uploadedCardNameSet = computed(() => {
  const set = new Set<string>();
  if (!uploadedRows.value.length) {
    return set;
  }

  const idx = uploadedNameIndex.value;

  uploadedRows.value.forEach((row) => {
    const raw = row[idx] ?? row[0] ?? "";
    cardNameVariants(raw).forEach((variant) => {
      if (variant.length > 0) {
        set.add(variant);
      }
    });
  });

  return set;
});

const isCardInUpload = (cardName: string) => {
  if (!cardName) {
    return false;
  }

  return cardNameVariants(cardName).some((variant) => uploadedCardNameSet.value.has(variant));
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
  if (chosenCompanion.value && chosenCompanion.value !== EDHRECCompanion.NONE.value) {
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
  return cardviews.filter((card) => isCardInUpload(card.name) === showOwned.value);
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

const cardlistEntries = computed(() =>
  cardlists.value.map((cardlist, index) => {
    const sectionMeta = cardlistSections.value[index] ?? null;
    return {
      key: sectionMeta?.id ?? `${index}`,
      cardlist,
      sectionMeta,
      decklistText: cardlistDecklists.value[index] ?? "",
      index,
    };
  })
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
    decklistCopySectionId.value = sectionMeta?.id ?? slugifyHeader(cardlist.header, index);
    await navigator.clipboard.writeText(text);
    decklistCopyResetHandle = setTimeout(() => {
      decklistCopySectionId.value = null;
      decklistCopyResetHandle = null;
    }, 1600);
  } catch (error) {
    handleError(error, {
      notify: true,
      fallbackMessage: "Unable to copy the decklist to your clipboard.",
      context: "Decklist copy",
    });
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
  const filename = `${sectionMeta?.id ?? slugifyHeader(cardlist.header, index)}.txt`;
  try {
    downloadTextFile(text, filename);
  } catch (error) {
    handleError(error, {
      notify: true,
      fallbackMessage: "Unable to download the decklist file.",
      context: "Decklist download",
    });
  }
};

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
  commanderSearchRef.value?.selectPrimaryCommander(name);
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

const scryfallCardData = ref<ScryfallCard[]>([]);
const scryfallIndex = computed(() => {
  const map = new Map<string, ScryfallCard>();
  scryfallCardData.value.forEach((card) => {
    const normalizedFullName = normalizeCardName(card.name);
    if (normalizedFullName) {
      map.set(normalizedFullName, card);
    }

    card.card_faces?.forEach((face) => {
      const normalizedFaceName = normalizeCardName(face.name);
      if (normalizedFaceName && !map.has(normalizedFaceName)) {
        map.set(normalizedFaceName, card);
      }
    });
  });
  return map;
});

const cardTableColumns: ColumnDefinition[] = [
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

  const batchSize = 75;
  const totalBatches = Math.ceil(allCards.value.length / batchSize);

  await withLoading(
    async () => {
      const scryfallData = await getCardsByNames(
        allCards.value,
        (current, _total) => {
          const { updateProgress } = useGlobalLoading();
          updateProgress(bulkCardScope, current);
        }
      ).catch(() => null);
      if (scryfallData) {
        scryfallCardData.value = scryfallData;
      }
    },
    "Fetching detailed card data...",
    bulkCardScope,
    totalBatches
  );
};

watch(allCards, fetchAllCardData, { immediate: true });

const getTableRows = (cardlist: {
  header: string;
  cardviews: { id: string; name: string }[];
}): CardTableRow[] =>
  filteredCards(cardlist.cardviews).map((cardview) => {
    const info = scryfallIndex.value.get(normalizeCardName(cardview.name)) ?? null;
    const requestedNames = cardview.name.split("//").map((n) => n.trim());
    type CardFace = NonNullable<ScryfallCard["card_faces"]>[number];
    const faces: CardFace[] = info?.card_faces ?? [];
    const matchedFace =
      faces.find((face) => requestedNames.includes(face.name)) ?? faces[0];
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
        prices: {
          usd: info?.prices?.usd ?? null,
          eur: info?.prices?.eur ?? null,
        },
        scryfall_uri: info?.scryfall_uri,
        faces:
          faces.length > 1
            ? faces.map((face) => ({
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

const __templateBindings = {
  FloatingCardlistNav,
  cardlistSections,
  activeSectionId,
  scrollToSection,
  Card,
  error,
  GlobalLoadingBanner,
  readerLoading,
  CommanderSearch,
  handleCommanderSelection,
  CommanderFilters,
  chosenBracket,
  chosenModifier,
  chosenPageType,
  chosenCompanion,
  setBracket,
  setModifier,
  setPageType,
  setCompanion,
  CardlistSection,
  cardlists,
  getTableRows,
  cardTableColumns,
  cardlistDecklists,
  cardlistEntries,
  decklistCopySectionId,
  handleCopyDecklist,
  handleDownloadDecklist,
};
void __templateBindings;
</script>
