import { computed, ref, watch, type Ref } from "vue";
import { getCardsByNames, type ScryfallCard } from "../api/scryfallApi";
import { useBackgroundArt } from "./useBackgroundArt";
import { useGlobalLoading } from "./useGlobalLoading";
import { useScryfallSymbols } from "./useScryfallSymbols";
import { normalizeCardName } from "../utils/cardName";
import type { CardTableRow, DisplayCardMeta, DisplayCardManaSymbol } from "../types/cards";
import type { EdhrecCardlist, EdhrecCardview } from "../types/edhrec";

type ScryfallOptions = {
  filterCardviews: (cardviews: EdhrecCardview[]) => EdhrecCardview[];
  isCardInUpload: (cardName: string) => boolean;
};

const BACKGROUND_ART_LIMIT = 8;
const CARD_SUPERTYPES = new Set(["Basic", "Legendary", "Snow", "World", "Ongoing"]);

const resolveArtUrl = (card: ScryfallCard) => {
  if (card.image_uris?.art_crop) {
    return card.image_uris.art_crop;
  }
  if (card.image_uris?.large) {
    return card.image_uris.large;
  }
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }
  const faceWithArt = card.card_faces?.find(
    (face) => face.image_uris?.art_crop || face.image_uris?.large || face.image_uris?.normal
  );
  return (
    faceWithArt?.image_uris?.art_crop ??
    faceWithArt?.image_uris?.large ??
    faceWithArt?.image_uris?.normal ??
    null
  );
};

const buildDisplayCardMeta = (
  name: string,
  manaCost: string,
  typeLine: string,
  set: string,
  rarity: string,
  getSvgForSymbol: (token: string) => string | null
): DisplayCardMeta => {
  const nameParts = name
    .split(/\s*\/\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const manaSymbols: DisplayCardManaSymbol[] = (manaCost.match(/\{[^}]+\}/g) ?? [])
    .map((token) => {
      const svg = getSvgForSymbol(token);
      return svg ? { token, svg } : null;
    })
    .filter((entry): entry is DisplayCardManaSymbol => entry !== null);
  const leftSide = typeLine.split("—")[0]?.trim() ?? "";
  const filteredType = leftSide
    .split(/\s+/)
    .filter((part) => !CARD_SUPERTYPES.has(part))
    .join(" ");

  return {
    cardName: name || "—",
    hasSplitName: nameParts.length > 1,
    primaryName: nameParts[0] ?? name ?? "—",
    secondaryName: nameParts.length > 1 ? nameParts.slice(1).join(" // ") : "",
    cardTypeFull: typeLine || "—",
    cardTypeShort: typeLine ? filteredType || leftSide || "—" : "—",
    cardSet: set.toUpperCase() || "—",
    cardRarity: rarity || "—",
    cardMana: manaCost || "—",
    manaSymbols,
  };
};

export const useScryfallCardData = (
  cardlists: Ref<EdhrecCardlist[]>,
  options: ScryfallOptions
) => {
  const { withLoading, getScopeLoading, updateProgress } = useGlobalLoading();
  const { setBackgroundArtUrls } = useBackgroundArt();
  const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();

  const bulkCardScope = "scryfall-bulk";
  const bulkCardsLoading = getScopeLoading(bulkCardScope);

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

  const fetchAllCardData = async () => {
    if (allCards.value.length === 0) {
      scryfallCardData.value = [];
      return;
    }

    const batchSize = 75;
    const totalBatches = Math.ceil(allCards.value.length / batchSize);

    await withLoading(
      async () => {
        const scryfallData = await getCardsByNames(allCards.value, (current) => {
          updateProgress(bulkCardScope, current);
        }).catch(() => null);
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
  watch(
    allCards,
    (cards) => {
      if (cards.length) {
        Promise.resolve(ensureSymbolsLoaded()).catch(() => {
          /* handled globally */
        });
      }
    },
    { immediate: true }
  );

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

  const backgroundArtUrls = computed(() => {
    const urls: string[] = [];
    const seen = new Set<string>();
    for (const card of scryfallCardData.value) {
      const url = resolveArtUrl(card);
      if (!url || seen.has(url)) {
        continue;
      }
      seen.add(url);
      urls.push(url);
      if (urls.length >= BACKGROUND_ART_LIMIT) {
        break;
      }
    }
    return urls;
  });

  watch(
    backgroundArtUrls,
    (urls) => {
      setBackgroundArtUrls(urls);
    },
    { immediate: true }
  );

  const tableRowsByCardlist = computed(() => {
    const rowsByCardlist = new Map<EdhrecCardlist, CardTableRow[]>();

    cardlists.value.forEach((cardlist) => {
      const rows = options.filterCardviews(cardlist.cardviews).map((cardview) => {
        const info = scryfallIndex.value.get(normalizeCardName(cardview.name)) ?? null;
        const requestedNames = cardview.name.split("//").map((n) => n.trim());
        type CardFace = NonNullable<ScryfallCard["card_faces"]>[number];
        const faces: CardFace[] = info?.card_faces ?? [];
        const matchedFace = faces.find((face) => requestedNames.includes(face.name)) ?? faces[0];
        const statsSource = matchedFace ?? info;
        const displayName = requestedNames.length > 1 ? cardview.name : info?.name ?? cardview.name;
        const manaCost = statsSource?.mana_cost ?? "";
        const typeLine = statsSource?.type_line ?? "";
        const cardSet = info?.set ?? "";
        const cardRarity = info?.rarity ?? "";

        return {
          id: info?.id ?? `${cardlist.header}-${cardview.id}`,
          have: options.isCardInUpload(cardview.name),
          card: {
            id: info?.id ?? `${cardlist.header}-${cardview.id}`,
            name: displayName,
            mana_cost: manaCost,
            type_line: typeLine,
            power: statsSource?.power ?? null,
            toughness: statsSource?.toughness ?? null,
            set: cardSet,
            rarity: cardRarity,
            prices: {
              usd: info?.prices?.usd ?? null,
              eur: info?.prices?.eur ?? null,
            },
            scryfall_uri: info?.scryfall_uri,
            display: buildDisplayCardMeta(
              displayName,
              manaCost,
              typeLine,
              cardSet,
              cardRarity,
              getSvgForSymbol
            ),
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

      rowsByCardlist.set(cardlist, rows);
    });

    return rowsByCardlist;
  });

  const getTableRows = (cardlist: EdhrecCardlist): CardTableRow[] =>
    tableRowsByCardlist.value.get(cardlist) ?? [];

  return {
    bulkCardsLoading,
    getTableRows,
  };
};
