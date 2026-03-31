import { computed, ref, watch, type Ref } from "vue";
import { getCard, getCardPrintings, type ScryfallCard } from "../api/scryfallApi";
import { handleError } from "../utils/errorHandler";
import type { CommanderSelection } from "../types/edhrec";
import { COLOR_IDENTITY_ORDER, type CommanderColor } from "../utils/colorIdentity";

type CommanderProfileEntry = {
  key: string;
  printings: ScryfallCard[];
  currentPrintingIndex: number;
  printingsLoading: boolean;
};

export type CommanderProfile = {
  id: string;
  name: string;
  imageUrl: string;
  artUrl: string;
  hasArtwork: boolean;
  colorIdentity: CommanderColor[];
  scryfallUri?: string;
  printsSearchUri?: string;
  prices: {
    usd: string | null;
    eur: string | null;
  };
  setCode: string;
  setName: string;
  collectorNumber: string;
  releasedAt: string;
  totalPrintings: number;
  printingPosition: number;
  canCyclePrintings: boolean;
  printingsLoading: boolean;
};

const isCommanderColor = (value: string): value is CommanderColor =>
  COLOR_IDENTITY_ORDER.includes(value as CommanderColor);

const resolveColorIdentity = (card: ScryfallCard | null) => {
  if (!card) {
    return [] as CommanderColor[];
  }

  const merged = new Set<CommanderColor>();
  const sources = [
    ...(card.color_identity?.length ? card.color_identity : card.colors ?? []),
    ...(card.card_faces?.flatMap((face) =>
      face.color_identity?.length ? face.color_identity : face.colors ?? []
    ) ?? []),
  ];

  sources.forEach((color) => {
    const normalized = color?.toUpperCase();
    if (normalized && isCommanderColor(normalized)) {
      merged.add(normalized);
    }
  });

  return COLOR_IDENTITY_ORDER.filter((color) => merged.has(color));
};

const resolveImageUrl = (card: ScryfallCard | null) => {
  if (!card) {
    return "";
  }
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }
  if (card.image_uris?.large) {
    return card.image_uris.large;
  }

  const faceWithImage = card.card_faces?.find(
    (face) => face.image_uris?.normal || face.image_uris?.large
  );

  return faceWithImage?.image_uris?.normal ?? faceWithImage?.image_uris?.large ?? "";
};

const resolveArtUrl = (card: ScryfallCard | null) => {
  if (!card) {
    return "";
  }
  if (card.image_uris?.art_crop) {
    return card.image_uris.art_crop;
  }
  if (card.image_uris?.border_crop) {
    return card.image_uris.border_crop;
  }
  if (card.image_uris?.large) {
    return card.image_uris.large;
  }
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }

  const faceWithArt = card.card_faces?.find(
    (face) =>
      face.image_uris?.art_crop ||
      face.image_uris?.border_crop ||
      face.image_uris?.large ||
      face.image_uris?.normal
  );

  return (
    faceWithArt?.image_uris?.art_crop ??
    faceWithArt?.image_uris?.border_crop ??
    faceWithArt?.image_uris?.large ??
    faceWithArt?.image_uris?.normal ??
    ""
  );
};

const toCommanderProfile = (entry: CommanderProfileEntry): CommanderProfile => {
  const activePrinting =
    entry.printings[entry.currentPrintingIndex] ?? entry.printings[0] ?? null;
  const imageUrl = resolveImageUrl(activePrinting);
  const artUrl = resolveArtUrl(activePrinting);

  return {
    id: activePrinting?.id ?? entry.key,
    name: activePrinting?.name ?? entry.key,
    imageUrl: imageUrl || artUrl,
    artUrl: artUrl || imageUrl,
    hasArtwork: Boolean(imageUrl || artUrl),
    colorIdentity: resolveColorIdentity(activePrinting),
    scryfallUri: activePrinting?.scryfall_uri,
    printsSearchUri: activePrinting?.prints_search_uri,
    prices: {
      usd: activePrinting?.prices?.usd ?? null,
      eur: activePrinting?.prices?.eur ?? null,
    },
    setCode: activePrinting?.set?.toUpperCase() ?? "",
    setName: activePrinting?.set_name ?? "",
    collectorNumber: activePrinting?.collector_number ?? "",
    releasedAt: activePrinting?.released_at ?? "",
    totalPrintings: entry.printings.length,
    printingPosition: entry.printings.length ? entry.currentPrintingIndex + 1 : 0,
    canCyclePrintings: entry.printings.length > 1,
    printingsLoading: entry.printingsLoading,
  };
};

export const useCommanderSpotlight = (selection: Ref<CommanderSelection>) => {
  const commanderProfileEntries = ref<CommanderProfileEntry[]>([]);
  const spotlightLoading = ref(false);
  const activeRequestId = ref<symbol | null>(null);

  const selectedNames = computed(() =>
    [
      selection.value.primary,
      selection.value.hasPartner ? selection.value.partner : "",
    ].filter(Boolean)
  );

  const commanderProfiles = computed(() =>
    commanderProfileEntries.value.map((entry) => toCommanderProfile(entry))
  );
  const mergedColorIdentity = computed(() => {
    const merged = new Set<CommanderColor>();
    commanderProfiles.value.forEach((profile) => {
      profile.colorIdentity.forEach((color) => merged.add(color));
    });
    return COLOR_IDENTITY_ORDER.filter((color) => merged.has(color));
  });

  watch(
    selectedNames,
    async (names) => {
      const requestId = Symbol("commander-spotlight");
      activeRequestId.value = requestId;

      if (!names.length) {
        commanderProfileEntries.value = [];
        spotlightLoading.value = false;
        return;
      }

      spotlightLoading.value = true;

      try {
        const cards = await Promise.all(names.map((name) => getCard(name)));
        if (activeRequestId.value !== requestId) {
          return;
        }

        commanderProfileEntries.value = cards.flatMap((card, index) => {
          if (!card) {
            return [];
          }

          return [
            {
              key: `${names[index] ?? card.name}-${index}`,
              printings: [card],
              currentPrintingIndex: 0,
              printingsLoading: !selection.value.hasPartner && index === 0 && Boolean(card.prints_search_uri),
            },
          ];
        });
      } catch (error) {
        if (activeRequestId.value === requestId) {
          commanderProfileEntries.value = [];
          handleError(error, {
            notify: false,
            fallbackMessage: "Unable to load commander artwork.",
            context: "Commander spotlight",
          });
        }
      } finally {
        if (activeRequestId.value === requestId) {
          spotlightLoading.value = false;
        }
      }

      if (selection.value.hasPartner) {
        return;
      }

      const primaryCard = commanderProfileEntries.value[0]?.printings[0];
      if (!primaryCard?.prints_search_uri) {
        return;
      }

      try {
        const printings = await getCardPrintings(primaryCard.prints_search_uri);
        if (activeRequestId.value !== requestId) {
          return;
        }

        commanderProfileEntries.value = commanderProfileEntries.value.map((entry, index) => {
          if (index !== 0) {
            return entry;
          }

          return {
            ...entry,
            printings: printings.length ? printings : entry.printings,
            currentPrintingIndex: 0,
            printingsLoading: false,
          };
        });
      } catch (error) {
        if (activeRequestId.value === requestId) {
          commanderProfileEntries.value = commanderProfileEntries.value.map((entry, index) => {
            if (index !== 0) {
              return entry;
            }
            return {
              ...entry,
              printingsLoading: false,
            };
          });
          handleError(error, {
            notify: false,
            fallbackMessage: "Unable to load commander printings.",
            context: "Commander spotlight printings",
          });
        }
      }
    },
    { immediate: true }
  );

  const backdropUrl = computed(
    () => commanderProfiles.value[0]?.artUrl ?? commanderProfiles.value[0]?.imageUrl ?? ""
  );

  const showNextPrinting = (profileIndex: number) => {
    commanderProfileEntries.value = commanderProfileEntries.value.map((entry, index) => {
      if (index !== profileIndex || entry.printings.length <= 1) {
        return entry;
      }

      return {
        ...entry,
        currentPrintingIndex: (entry.currentPrintingIndex + 1) % entry.printings.length,
      };
    });
  };

  const showPreviousPrinting = (profileIndex: number) => {
    commanderProfileEntries.value = commanderProfileEntries.value.map((entry, index) => {
      if (index !== profileIndex || entry.printings.length <= 1) {
        return entry;
      }

      return {
        ...entry,
        currentPrintingIndex:
          (entry.currentPrintingIndex - 1 + entry.printings.length) % entry.printings.length,
      };
    });
  };

  return {
    commanderProfiles,
    mergedColorIdentity,
    spotlightLoading,
    backdropUrl,
    showNextPrinting,
    showPreviousPrinting,
  };
};
