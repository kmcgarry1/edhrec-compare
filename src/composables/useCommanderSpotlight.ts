import { computed, ref, watch, type Ref } from "vue";
import { getCard, type ScryfallCard } from "../api/scryfallApi";
import { handleError } from "../utils/errorHandler";
import type { CommanderSelection } from "../types/edhrec";

export type CommanderSpotlightCard = {
  name: string;
  imageUrl: string;
  artUrl: string;
};

const resolveImageUrl = (card: ScryfallCard) => {
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

const resolveArtUrl = (card: ScryfallCard) => {
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

export const useCommanderSpotlight = (selection: Ref<CommanderSelection>) => {
  const spotlightCards = ref<CommanderSpotlightCard[]>([]);
  const spotlightLoading = ref(false);
  const activeRequestId = ref<symbol | null>(null);

  const selectedNames = computed(() =>
    [
      selection.value.primary,
      selection.value.hasPartner ? selection.value.partner : "",
    ].filter(Boolean)
  );

  watch(
    selectedNames,
    async (names) => {
      const requestId = Symbol("commander-spotlight");
      activeRequestId.value = requestId;

      if (!names.length) {
        spotlightCards.value = [];
        spotlightLoading.value = false;
        return;
      }

      spotlightLoading.value = true;

      try {
        const cards = await Promise.all(names.map((name) => getCard(name)));
        if (activeRequestId.value !== requestId) {
          return;
        }

        spotlightCards.value = cards.flatMap((card) => {
          if (!card) {
            return [];
          }

          const imageUrl = resolveImageUrl(card);
          const artUrl = resolveArtUrl(card);
          if (!imageUrl && !artUrl) {
            return [];
          }

          return [
            {
              name: card.name,
              imageUrl: imageUrl || artUrl,
              artUrl: artUrl || imageUrl,
            },
          ];
        });
      } catch (error) {
        if (activeRequestId.value === requestId) {
          spotlightCards.value = [];
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
    },
    { immediate: true }
  );

  const backdropUrl = computed(
    () => spotlightCards.value[0]?.artUrl ?? spotlightCards.value[0]?.imageUrl ?? ""
  );

  return {
    spotlightCards,
    spotlightLoading,
    backdropUrl,
  };
};
