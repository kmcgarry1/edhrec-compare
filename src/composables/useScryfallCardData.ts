import { computed, ref, watch, type Ref } from "vue";
import { getCardsByNames, type ScryfallCard } from "../api/scryfallApi";
import { useBackgroundArt } from "./useBackgroundArt";
import { useGlobalLoading } from "./useGlobalLoading";
import { normalizeCardName } from "../utils/cardName";
import type { CardTableRow } from "../types/cards";
import type { EdhrecCardlist, EdhrecCardview } from "../types/edhrec";

type ScryfallOptions = {
  filterCardviews: (cardviews: EdhrecCardview[]) => EdhrecCardview[];
  isCardInUpload: (cardName: string) => boolean;
};

const BACKGROUND_ART_LIMIT = 8;

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

export const useScryfallCardData = (
  cardlists: Ref<EdhrecCardlist[]>,
  options: ScryfallOptions
) => {
  const { withLoading, getScopeLoading, updateProgress } = useGlobalLoading();
  const { setBackgroundArtUrls } = useBackgroundArt();

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

  const getTableRows = (cardlist: EdhrecCardlist): CardTableRow[] =>
    options.filterCardviews(cardlist.cardviews).map((cardview) => {
      const info = scryfallIndex.value.get(normalizeCardName(cardview.name)) ?? null;
      const requestedNames = cardview.name.split("//").map((n) => n.trim());
      type CardFace = NonNullable<ScryfallCard["card_faces"]>[number];
      const faces: CardFace[] = info?.card_faces ?? [];
      const matchedFace = faces.find((face) => requestedNames.includes(face.name)) ?? faces[0];
      const statsSource = matchedFace ?? info;
      const displayName = requestedNames.length > 1 ? cardview.name : info?.name ?? cardview.name;

      return {
        id: info?.id ?? `${cardlist.header}-${cardview.id}`,
        have: options.isCardInUpload(cardview.name),
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

  return {
    bulkCardsLoading,
    getTableRows,
  };
};
