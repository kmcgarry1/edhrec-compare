import { computed, nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";
import { useCsvUpload } from "./useCsvUpload";
import { useOwnedFilter } from "./useOwnedFilter";
import { getCardlistIcon } from "../components/helpers/cardlistIconMap";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import { buildCardNameSet, cardNameVariants, getNameColumnIndex } from "../utils/cardName";
import type {
  CardlistSectionMeta,
  DecklistPayload,
  DecklistSection,
  EdhrecCardlist,
  EdhrecCardview,
} from "../types/edhrec";

type CardlistEntry = {
  key: string;
  cardlist: EdhrecCardlist;
  sectionMeta: CardlistSectionMeta;
  decklistText: string;
  index: number;
};

const slugifyHeader = (value: string, index: number) => {
  const base = (value || `section-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base.length ? base : `section-${index + 1}`;
};

const ACTIVE_SECTION_OFFSET = 120;
const SCROLL_TARGET_OFFSET = 80;

export const useEdhrecCardlists = (cardlists: Ref<EdhrecCardlist[]>) => {
  const { showOwned } = useOwnedFilter();
  const { rows: uploadedRows, headers: uploadedHeaders } = useCsvUpload();

  const uploadedNameIndex = computed(() => getNameColumnIndex(uploadedHeaders.value));

  const uploadedCardNameSet = computed(() => {
    if (!uploadedRows.value.length) {
      return new Set<string>();
    }
    return buildCardNameSet(uploadedRows.value, uploadedNameIndex.value);
  });

  const isCardInUpload = (cardName: string) => {
    if (!cardName) {
      return false;
    }

    return cardNameVariants(cardName).some((variant) => uploadedCardNameSet.value.has(variant));
  };

  const filterCardviews = (cardviews: EdhrecCardview[]) => {
    if (showOwned.value === null) {
      return cardviews;
    }
    return cardviews.filter((card) => isCardInUpload(card.name) === showOwned.value);
  };

  const getDeckFilterLabel = () => {
    if (showOwned.value === true) {
      return "Owned cards";
    }
    if (showOwned.value === false) {
      return "Missing cards";
    }
    return "All cards";
  };

  const expandedSectionIds = ref<string[]>([]);

  const cardlistEntries = computed<CardlistEntry[]>(() =>
    allCardlistEntries.value.filter((entry) => entry.sectionMeta.isPopulated)
  );

  const cardlistSections = computed<CardlistSectionMeta[]>(() =>
    cardlistEntries.value.map((entry) => entry.sectionMeta)
  );

  const totalSectionCount = computed(() => allCardlistEntries.value.length);
  const visibleCardCount = computed(() =>
    cardlistEntries.value.reduce(
      (sum, entry) => sum + entry.sectionMeta.summaryCounts.totalCards,
      0
    )
  );
  const deckViewCounts = computed(() =>
    cardlists.value.reduce(
      (totals, cardlist) => {
        const allCards = cardlist.cardviews.length;
        const ownedCards = cardlist.cardviews.filter((card) => isCardInUpload(card.name)).length;
        const missingCards = Math.max(allCards - ownedCards, 0);
        return {
          owned: totals.owned + ownedCards,
          missing: totals.missing + missingCards,
          all: totals.all + allCards,
        };
      },
      { owned: 0, missing: 0, all: 0 }
    )
  );
  const deckFilterLabel = computed(() => getDeckFilterLabel());

  const buildDecklistText = (cardlist: EdhrecCardlist) => {
    const cards = filterCardviews(cardlist.cardviews);
    if (cards.length === 0) {
      return "";
    }
    return cards.map((card) => `1 ${card.name}`).join("\n");
  };

  const baseCardlistEntries = computed<CardlistEntry[]>(() => {
    const populatedSectionIds: string[] = [];

    const entries = cardlists.value.map((cardlist, index) => {
      const id = slugifyHeader(cardlist.header, index);
      const iconConfig = getCardlistIcon(id);
      const filteredCards = filterCardviews(cardlist.cardviews);
      const totalCards = filteredCards.length;
      const ownedCount = filteredCards.filter((card) => isCardInUpload(card.name)).length;
      const unownedCount = Math.max(totalCards - ownedCount, 0);
      const ownedPercent = totalCards ? Math.round((ownedCount / totalCards) * 100) : 0;

      if (totalCards > 0) {
        populatedSectionIds.push(id);
      }

      return {
        key: id,
        cardlist,
        sectionMeta: {
          id,
          label: cardlist.header || `Cardlist ${index + 1}`,
          iconPath: iconConfig?.path,
          iconColor: iconConfig?.color,
          isPopulated: totalCards > 0,
          defaultExpanded: populatedSectionIds.slice(0, 3).includes(id),
          expanded: false,
          summaryCounts: {
            totalCards,
            ownedCount,
            unownedCount,
            ownedPercent,
          },
        },
        decklistText: buildDecklistText(cardlist),
        index,
      };
    });

    const defaultExpandedIds = new Set(populatedSectionIds.slice(0, 3));

    return entries.map((entry) => ({
      ...entry,
      sectionMeta: {
        ...entry.sectionMeta,
        defaultExpanded: defaultExpandedIds.has(entry.sectionMeta.id),
      },
    }));
  });

  const allCardlistEntries = computed<CardlistEntry[]>(() => {
    const activeExpandedIds = new Set(expandedSectionIds.value);
    return baseCardlistEntries.value.map((entry) => ({
      ...entry,
      sectionMeta: {
        ...entry.sectionMeta,
        expanded: activeExpandedIds.has(entry.sectionMeta.id),
      },
    }));
  });

  const cardlistDecklists = computed(() =>
    cardlists.value.map((cardlist) => buildDecklistText(cardlist))
  );

  const decklistPayload = computed<DecklistPayload | null>(() => {
    if (!cardlists.value.length) {
      return null;
    }
    const sections: DecklistSection[] = cardlists.value.map((cardlist, index) => {
      const sectionMeta = allCardlistEntries.value[index]?.sectionMeta;
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
  });

  const decklistCopySectionId = ref<string | null>(null);
  let decklistCopyResetHandle: ReturnType<typeof setTimeout> | null = null;

  const clearDecklistCopyState = () => {
    if (decklistCopyResetHandle) {
      clearTimeout(decklistCopyResetHandle);
      decklistCopyResetHandle = null;
    }
    decklistCopySectionId.value = null;
  };

  const handleCopyDecklist = async (cardlist: EdhrecCardlist, index: number) => {
    const text = cardlistDecklists.value[index] ?? "";
    if (!text) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      console.warn("Clipboard API is unavailable in this environment.");
      return;
    }
    const sectionMeta = allCardlistEntries.value[index]?.sectionMeta;
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

  const handleDownloadDecklist = (cardlist: EdhrecCardlist, index: number) => {
    const sectionMeta = allCardlistEntries.value[index]?.sectionMeta;
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

  const activeSectionId = ref<string>("");
  let scrollListener: (() => void) | null = null;
  let resizeListener: (() => void) | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let scrollFrameId: number | null = null;
  let measureFrameId: number | null = null;
  let sectionPositions: Array<{ id: string; top: number }> = [];

  const cancelScrollFrame = () => {
    if (scrollFrameId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(scrollFrameId);
      scrollFrameId = null;
    }
  };

  const cancelMeasureFrame = () => {
    if (measureFrameId !== null && typeof window !== "undefined") {
      window.cancelAnimationFrame(measureFrameId);
      measureFrameId = null;
    }
  };

  const updateActiveSectionFromScroll = () => {
    if (
      typeof window === "undefined" ||
      !cardlistSections.value.length ||
      !sectionPositions.length
    ) {
      activeSectionId.value = "";
      return;
    }
    const scrollPosition = window.scrollY + ACTIVE_SECTION_OFFSET;
    let currentId = sectionPositions[0]?.id ?? cardlistSections.value[0]?.id ?? "";

    for (const section of sectionPositions) {
      if (section.top <= scrollPosition) {
        currentId = section.id;
      } else {
        break;
      }
    }

    if (currentId !== activeSectionId.value) {
      activeSectionId.value = currentId;
    }
  };

  const measureSectionPositions = () => {
    if (typeof window === "undefined") {
      sectionPositions = [];
      activeSectionId.value = "";
      return;
    }

    sectionPositions = cardlistSections.value
      .map((section) => {
        const el = document.getElementById(section.id);
        if (!el) {
          return null;
        }
        return {
          id: section.id,
          top: el.getBoundingClientRect().top + window.scrollY,
        };
      })
      .filter((section): section is { id: string; top: number } => section !== null);

    updateActiveSectionFromScroll();
  };

  const scheduleSectionPositionMeasure = () => {
    if (typeof window === "undefined" || measureFrameId !== null) {
      return;
    }
    measureFrameId = window.requestAnimationFrame(() => {
      measureFrameId = null;
      measureSectionPositions();
    });
  };

  const detachScrollListener = () => {
    if (scrollListener && typeof window !== "undefined") {
      window.removeEventListener("scroll", scrollListener);
      scrollListener = null;
    }
    cancelScrollFrame();
  };

  const detachResizeTracking = () => {
    if (resizeListener && typeof window !== "undefined") {
      window.removeEventListener("resize", resizeListener);
      resizeListener = null;
    }
    resizeObserver?.disconnect();
    resizeObserver = null;
    cancelMeasureFrame();
  };

  const attachScrollListener = () => {
    if (typeof window === "undefined") {
      return;
    }
    detachScrollListener();
    scrollListener = () => {
      if (scrollFrameId !== null) {
        return;
      }
      scrollFrameId = window.requestAnimationFrame(() => {
        scrollFrameId = null;
        updateActiveSectionFromScroll();
      });
    };
    window.addEventListener("scroll", scrollListener, { passive: true });
  };

  const attachResizeTracking = () => {
    if (typeof window === "undefined") {
      return;
    }

    detachResizeTracking();
    resizeListener = () => {
      scheduleSectionPositionMeasure();
    };
    window.addEventListener("resize", resizeListener, { passive: true });

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    resizeObserver = new ResizeObserver(() => {
      cancelMeasureFrame();
      measureSectionPositions();
    });

    cardlistSections.value.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) {
        resizeObserver?.observe(el);
      }
    });
  };

  watch(
    baseCardlistEntries,
    (entries) => {
      expandedSectionIds.value = entries
        .filter((entry) => entry.sectionMeta.isPopulated)
        .filter((entry) => entry.sectionMeta.defaultExpanded)
        .map((entry) => entry.sectionMeta.id);
    },
    { immediate: true }
  );

  watch(
    cardlistSections,
    (sections) => {
      nextTick(() => {
        if (!sections.length) {
          activeSectionId.value = "";
          detachScrollListener();
          detachResizeTracking();
          sectionPositions = [];
          return;
        }
        attachResizeTracking();
        attachScrollListener();
        scheduleSectionPositionMeasure();
      });
    },
    { immediate: true }
  );

  const expandSection = (id: string) => {
    if (!cardlistSections.value.some((section) => section.id === id)) {
      return;
    }
    if (!expandedSectionIds.value.includes(id)) {
      expandedSectionIds.value = [...expandedSectionIds.value, id];
    }
  };

  const collapseSection = (id: string) => {
    expandedSectionIds.value = expandedSectionIds.value.filter((sectionId) => sectionId !== id);
  };

  const toggleSection = (id: string) => {
    if (expandedSectionIds.value.includes(id)) {
      collapseSection(id);
      return;
    }
    expandSection(id);
  };

  const expandAllSections = () => {
    expandedSectionIds.value = cardlistSections.value.map((section) => section.id);
  };

  const collapseAllSections = () => {
    expandedSectionIds.value = [];
  };

  const allSectionsExpanded = computed(
    () =>
      cardlistSections.value.length > 0 &&
      cardlistSections.value.every((section) => section.expanded)
  );

  const scrollToSection = (id: string) => {
    if (typeof window === "undefined") {
      return;
    }
    expandSection(id);
    void nextTick(() => {
      measureSectionPositions();
      const el = document.getElementById(id);
      if (!el) {
        return;
      }
      const targetTop =
        sectionPositions.find((section) => section.id === id)?.top ??
        el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(targetTop - SCROLL_TARGET_OFFSET, 0),
        behavior: "smooth",
      });
    });
  };

  onBeforeUnmount(() => {
    detachScrollListener();
    detachResizeTracking();
    clearDecklistCopyState();
  });

  return {
    cardlistSections,
    cardlistEntries,
    cardlistDecklists,
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
  };
};
