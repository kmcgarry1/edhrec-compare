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
  sectionMeta: CardlistSectionMeta | null;
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
      return "Unowned cards";
    }
    return "All cards";
  };

  const cardlistSections = computed<CardlistSectionMeta[]>(() =>
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

  const buildDecklistText = (cardlist: EdhrecCardlist) => {
    const cards = filterCardviews(cardlist.cardviews);
    if (cards.length === 0) {
      return "";
    }
    return cards.map((card) => `1 ${card.name}`).join("\n");
  };

  const cardlistDecklists = computed(() =>
    cardlists.value.map((cardlist) => buildDecklistText(cardlist))
  );

  const cardlistEntries = computed<CardlistEntry[]>(() =>
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

  const decklistPayload = computed<DecklistPayload | null>(() => {
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

  const handleDownloadDecklist = (cardlist: EdhrecCardlist, index: number) => {
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

  const activeSectionId = ref<string>("");
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

  onBeforeUnmount(() => {
    detachScrollListener();
    clearDecklistCopyState();
  });

  return {
    cardlistSections,
    cardlistEntries,
    cardlistDecklists,
    decklistPayload,
    decklistCopySectionId,
    activeSectionId,
    scrollToSection,
    filterCardviews,
    isCardInUpload,
    handleCopyDecklist,
    handleDownloadDecklist,
  };
};
