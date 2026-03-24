import { computed, type Ref } from "vue";
import { useScryfallSymbols } from "./useScryfallSymbols";
import type { DisplayCard } from "../types/cards";

const badgeBaseClass =
  "inline-flex items-center rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]";
const setBadgeClass = `${badgeBaseClass} bg-[color:var(--surface-muted)] text-[color:var(--muted)]`;

const rarityClass = (rarity?: string | null) => {
  switch ((rarity ?? "").toLowerCase()) {
    case "common":
      return "text-[color:var(--rarity-common)]";
    case "uncommon":
      return "text-[color:var(--rarity-uncommon)]";
    case "rare":
      return "text-[color:var(--rarity-rare)]";
    case "mythic":
      return "text-[color:var(--rarity-mythic)]";
    default:
      return "text-[color:var(--muted)]";
  }
};

export const useScryfallCardMeta = (card: Ref<DisplayCard>) => {
  const { getSvgForSymbol, isLoading: symbolsLoading } = useScryfallSymbols();
  const display = computed(() => card.value.display ?? null);

  const cardName = computed(() => display.value?.cardName ?? card.value.name ?? "—");
  const nameParts = computed(() =>
    cardName.value
      .split(/\s*\/\/\s*/)
      .map((part) => part.trim())
      .filter(Boolean)
  );
  const hasSplitName = computed(
    () => display.value?.hasSplitName ?? nameParts.value.length > 1
  );
  const primaryName = computed(
    () => display.value?.primaryName ?? nameParts.value[0] ?? cardName.value
  );
  const secondaryName = computed(() => {
    if (display.value) {
      return display.value.secondaryName;
    }
    if (!hasSplitName.value) {
      return "";
    }
    return nameParts.value.slice(1).join(" // ");
  });

  const cardTypeFull = computed(
    () => display.value?.cardTypeFull ?? card.value.type_line ?? "—"
  );
  const cardTypeShort = computed(() => {
    if (display.value) {
      return display.value.cardTypeShort;
    }
    if (!card.value.type_line) {
      return "—";
    }
    const leftSide = card.value.type_line.split("—")[0]?.trim() ?? "";
    if (!leftSide) {
      return "—";
    }
    const supertypes = new Set(["Basic", "Legendary", "Snow", "World", "Ongoing"]);
    const filtered = leftSide.split(/\s+/).filter((part) => !supertypes.has(part));
    return filtered.join(" ") || leftSide;
  });
  const cardSet = computed(
    () => display.value?.cardSet ?? ((card.value.set || "").toUpperCase() || "—")
  );
  const cardRarity = computed(() => display.value?.cardRarity ?? card.value.rarity ?? "—");
  const cardMana = computed(() => display.value?.cardMana ?? card.value.mana_cost ?? "—");

  const manaSymbols = computed(() => {
    if (display.value) {
      return display.value.manaSymbols;
    }
    if (!card.value.mana_cost) {
      return [] as Array<{ token: string; svg: string }>;
    }
    const matches = card.value.mana_cost.match(/\{[^}]+\}/g) ?? [];
    return matches
      .map((token: string) => {
        const svg = getSvgForSymbol(token);
        return svg ? { token, svg } : null;
      })
      .filter(
        (
          entry: { token: string; svg: string } | null
        ): entry is { token: string; svg: string } => entry !== null
      );
  });

  const rarityBadgeClass = computed(() => [
    badgeBaseClass,
    "bg-[color:var(--surface-muted)]",
    rarityClass(cardRarity.value),
  ]);

  return {
    cardName,
    hasSplitName,
    primaryName,
    secondaryName,
    cardTypeFull,
    cardTypeShort,
    cardSet,
    cardRarity,
    cardMana,
    manaSymbols,
    symbolsLoading,
    rarityBadgeClass,
    setBadgeClass,
  };
};
