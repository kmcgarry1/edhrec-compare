import { ref } from "vue";
import { getCardsByNames, type ScryfallCard } from "../api/scryfallApi";
import { handleError } from "../utils/errorHandler";
import { normalizeCardName } from "../utils/cardName";
import { type CommanderColor } from "../utils/colorIdentity";

const splitPartnerNames = (name: string) => {
  if (!name) {
    return [] as string[];
  }
  if (name.includes("//")) {
    return name
      .split(/\s*\/\/\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  const separators = [" & ", " + ", " / "];
  for (const sep of separators) {
    if (name.includes(sep)) {
      return name.split(sep).map((part) => part.trim()).filter(Boolean);
    }
  }
  return [name];
};

const resolveCardImage = (card: ScryfallCard) => {
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }
  const faceWithImage = card.card_faces?.find((face) => face.image_uris?.normal);
  return faceWithImage?.image_uris?.normal ?? "";
};

export const useTopCommanderImages = () => {
  const imageLoading = ref(false);
  const imageLookup = ref<Record<string, string>>({});
  const colorIdentityLookup = ref<Record<string, CommanderColor[]>>({});

  const resolveImage = (name: string) =>
    imageLookup.value[normalizeCardName(name)] ?? "";

  const commanderColorIdentity = (name: string) =>
    colorIdentityLookup.value[normalizeCardName(name)] ?? [];

  const combinedColorIdentity = (name: string) => {
    const parts = splitPartnerNames(name);
    const combined = new Set<CommanderColor>();
    parts.forEach((part) => {
      commanderColorIdentity(part).forEach((color) => combined.add(color));
    });
    if (parts.length === 1) {
      commanderColorIdentity(name).forEach((color) => combined.add(color));
    }
    return Array.from(combined);
  };

  const getImageStack = (name: string) => {
    const parts = splitPartnerNames(name);
    const images = parts
      .map((part) => resolveImage(part))
      .filter((url) => url && url.length > 0);
    if (images.length >= 2) {
      return images.slice(0, 2);
    }
    const fullImage = resolveImage(name);
    if (fullImage && images.length === 0) {
      return [fullImage];
    }
    return images;
  };

  const loadCommanderImages = async (names: string[]) => {
    if (!names.length) {
      imageLookup.value = {};
      colorIdentityLookup.value = {};
      return;
    }
    imageLoading.value = true;
    try {
      const commanderNames = names
        .flatMap((name) => [name, ...splitPartnerNames(name)])
        .filter((value, index, arr) => arr.indexOf(value) === index);
      const cards = await getCardsByNames(commanderNames.map((name) => ({ name })));
      const nextLookup: Record<string, string> = {};
      const nextColors: Record<string, CommanderColor[]> = {};
      cards.forEach((card) => {
        const image = resolveCardImage(card);
        if (image) {
          nextLookup[normalizeCardName(card.name)] = image;
        }
        const rawIdentity = (card.color_identity ?? card.colors ?? []) as CommanderColor[];
        const identity = rawIdentity.length ? rawIdentity : (["C"] as CommanderColor[]);
        nextColors[normalizeCardName(card.name)] = identity;
        card.card_faces?.forEach((face) => {
          const faceImage = face.image_uris?.normal;
          if (faceImage) {
            nextLookup[normalizeCardName(face.name)] = faceImage;
          }
          const faceIdentity = (face.color_identity ?? face.colors ?? []) as CommanderColor[];
          if (faceIdentity.length) {
            nextColors[normalizeCardName(face.name)] = faceIdentity;
          }
        });
      });
      imageLookup.value = nextLookup;
      colorIdentityLookup.value = nextColors;
    } catch (error) {
      handleError(error, {
        notify: true,
        fallbackMessage: "Unable to load commander images.",
        context: "TopCommandersImages",
      });
    } finally {
      imageLoading.value = false;
    }
  };

  return {
    imageLoading,
    resolveImage,
    getImageStack,
    combinedColorIdentity,
    loadCommanderImages,
  };
};
