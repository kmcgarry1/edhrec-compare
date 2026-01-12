<template>
  <template v-if="variant === 'table'">
    <tr
      class="cursor-pointer"
      :class="tableRowClass"
      @mouseenter="handleCardHover(cardName, $event)"
      @mouseleave="hideCardImage"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown(cardName, $event)"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave"
      @click="handleRowClick"
    >
      <td :class="tableCellClasses.checkbox">
        <input
          type="checkbox"
          :class="checkboxClass"
          :checked="props.have"
          disabled
          :aria-checked="props.have"
          aria-label="Card present in uploaded list"
        />
      </td>
      <td :class="tableCellClasses.name">
        <div class="name-clamp max-w-[clamp(16rem,40vw,32rem)]" :title="cardName">
          <template v-if="hasSplitName">
            <span class="block leading-snug">{{ primaryName }}</span>
            <span class="block text-xs leading-snug text-[color:var(--muted)]">
              {{ secondaryName }}
            </span>
          </template>
          <span v-else class="block leading-snug">
            {{ cardName }}
          </span>
        </div>
      </td>
      <td :class="tableCellClasses.mana">
        <div class="flex items-center gap-1 text-xs text-[color:var(--muted)]">
          <template v-if="manaSymbols.length">
            <img
              v-for="symbol in manaSymbols"
              :key="symbol.token + props.card.id"
              :src="symbol.svg"
              :alt="symbol.token"
              class="h-5 w-5"
              loading="lazy"
            />
          </template>
          <template v-else-if="symbolsLoading">
            <span>Loading symbols...</span>
          </template>
          <template v-else>
            {{ cardMana }}
          </template>
        </div>
      </td>
      <td :class="tableCellClasses.muted">
        <span
          class="block truncate max-w-[28ch]"
          :title="cardTypeFull !== '—' ? cardTypeFull : undefined"
        >
          {{ cardTypeShort }}
        </span>
      </td>
      <td :class="tableCellClasses.badge">
        <span :class="rarityBadgeClass">{{ cardRarity }}</span>
      </td>
      <td :class="tableCellClasses.status">
        <span :class="statusLabelClass">Loading preview…</span>
      </td>
      <PriceColour
        tag="td"
        :pill="false"
        :price="props.card.prices?.usd ?? null"
        currency="$"
        :class="tableCellClasses.price"
      />
      <PriceColour
        tag="td"
        :pill="false"
        :price="props.card.prices?.eur ?? null"
        currency="€"
        :class="tableCellClasses.price"
      />
    </tr>
  </template>
  <template v-else>
    <div
      role="button"
      tabindex="0"
      :class="cardRowClass"
      @mouseenter="handleCardHover(cardName, $event)"
      @mouseleave="hideCardImage"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown(cardName, $event)"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave"
      @click="handleMobileRowClick"
      @keydown.enter="handleMobileRowClick"
      @keydown.space.prevent="handleMobileRowClick"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          :class="checkboxClass"
          :checked="props.have"
          disabled
          :aria-checked="props.have"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold">
            {{ cardName }}
          </p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <span :class="setBadgeClass">{{ cardSet }}</span>
            <span :class="rarityBadgeClass">{{ cardRarity }}</span>
            <span
              class="truncate text-[11px] text-[color:var(--muted)]"
              :title="cardTypeFull !== '—' ? cardTypeFull : undefined"
            >
              {{ cardTypeShort }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1">
        <div class="flex items-center gap-0.5 text-[11px] text-[color:var(--muted)]">
          <template v-if="manaSymbols.length">
            <img
              v-for="symbol in manaSymbols"
              :key="symbol.token + props.card.id + '-compact'"
              :src="symbol.svg"
              :alt="symbol.token"
              class="h-4 w-4"
              loading="lazy"
            />
          </template>
          <template v-else-if="symbolsLoading">
            <span>…</span>
          </template>
          <template v-else>
            {{ cardMana }}
          </template>
        </div>
        <div class="flex items-center gap-1">
          <PriceColour
            :price="props.card.prices?.usd ?? null"
            currency="$"
            class="text-[11px]"
          />
          <PriceColour
            :price="props.card.prices?.eur ?? null"
            currency="€"
            class="text-[11px]"
          />
        </div>
        <span :class="statusLabelClass">Loading preview…</span>
      </div>
    </div>
  </template>

  <Teleport to="body">
    <div
      v-if="hoveredCardImage && isFullscreenPreview"
      class="fixed inset-0 z-[60] flex flex-col bg-black/80 px-4 py-6 text-white backdrop-blur"
      @click.self="hideCardImage"
    >
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-1.5 text-sm font-semibold transition hover:bg-white/10"
          @click="hideCardImage"
        >
          Close
        </button>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <img
          :src="hoveredCardImage"
          alt="Card preview"
          class="max-h-[80vh] w-auto rounded-2xl shadow-2xl shadow-black/60"
        />
      </div>
    </div>
    <Card
      v-else-if="hoveredCardImage"
      as="div"
      padding="p-1.5"
      rounded="rounded-xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface)]"
      shadow="shadow-[var(--shadow)]"
      class="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-[color:var(--text)]"
      :fullWidth="false"
      :style="{ left: imagePosition.x + 'px', top: imagePosition.y + 'px' }"
    >
      <img
        :src="hoveredCardImage"
        alt="Card preview"
        class="w-56 rounded-lg shadow-[var(--shadow-soft)]"
      />
    </Card>
  </Teleport>
  <Teleport to="body">
    <div
      v-if="isMobileModalOpen"
      class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      @click.self="closeMobileModal"
    >
      <Card
        as="div"
        padding="p-4 sm:p-6"
        rounded="rounded-3xl"
        border="border border-[color:var(--border)]"
        background="bg-[color:var(--surface)]"
        shadow="shadow-[var(--shadow)]"
        class="relative w-full max-w-md space-y-4 text-[color:var(--text)]"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">
              Card Preview
            </p>
            <h3 class="text-xl font-semibold text-[color:var(--text)]">
              {{ modalCard?.name }}
            </h3>
            <p class="text-sm text-[color:var(--muted)]">
              {{ modalCard?.type_line }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <a
              v-if="scryfallLink"
              :href="scryfallLink"
              target="_blank"
              rel="noreferrer"
              role="button"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              View on Scryfall
            </a>
            <button
              type="button"
              class="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
              @click="closeMobileModal"
            >
              Close
            </button>
          </div>
        </div>
        <div class="flex justify-center pointer-events-none">
          <div
            v-if="modalLoading"
            class="h-64 w-44 animate-pulse rounded-2xl bg-[color:var(--surface-muted)]"
          ></div>
          <img
            v-else-if="modalImageUrl"
            :src="modalImageUrl"
            :alt="modalCard?.name ?? 'Card'"
            class="w-44 rounded-2xl shadow-[var(--shadow-soft)]"
          />
          <div
            v-else
            class="h-64 w-44 rounded-2xl border border-dashed border-[color:var(--border)] p-4 text-center text-xs text-[color:var(--muted)]"
          >
            Image unavailable
          </div>
        </div>
        <div class="pointer-events-none text-xs text-[color:var(--muted)] space-y-1">
          <p>
            <span class="font-semibold">Set:</span>
            {{ (modalCard?.set || "").toUpperCase() || "—" }}
          </p>
          <p>
            <span class="font-semibold">Prices:</span>
            ${{ modalCard?.prices?.usd ?? "—" }} / €{{
              modalCard?.prices?.eur ?? "—"
            }}
          </p>
        </div>
      </Card>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from "vue";
import { getCardImage } from "../api/scryfallApi";
import { Card, PriceColour } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";
import { handleError } from "../utils/errorHandler";
import type { DisplayCard } from "../types/cards";
const cardImageCache = new Map<string, string>();

const props = defineProps<{
  card: DisplayCard;
  have?: boolean;
  variant?: "table" | "card";
}>();

const variant = computed(() => props.variant ?? "table");
const cardName = computed(() => props.card.name || "—");
const nameParts = computed(() =>
  cardName.value.split(/\s*\/\/\s*/).map((part) => part.trim()).filter(Boolean)
);
const hasSplitName = computed(() => nameParts.value.length > 1);
const primaryName = computed(() => nameParts.value[0] ?? cardName.value);
const secondaryName = computed(() => {
  if (!hasSplitName.value) {
    return "";
  }
  return nameParts.value.slice(1).join(" // ");
});
const cardTypeFull = computed(() => props.card.type_line || "—");
const cardTypeShort = computed(() => {
  if (!props.card.type_line) {
    return "—";
  }
  const leftSide = props.card.type_line.split("—")[0]?.trim() ?? "";
  if (!leftSide) {
    return "—";
  }
  const supertypes = new Set([
    "Basic",
    "Legendary",
    "Snow",
    "World",
    "Ongoing",
  ]);
  const filtered = leftSide
    .split(/\s+/)
    .filter((part) => !supertypes.has(part));
  return filtered.join(" ") || leftSide;
});
const cardSet = computed(() => (props.card.set || "").toUpperCase() || "—");
const cardRarity = computed(() => props.card.rarity || "—");
const cardStats = computed(() => {
  if (props.card.power && props.card.toughness) {
    return `${props.card.power}/${props.card.toughness}`;
  }
  return "—";
});
const cardMana = computed(() => props.card.mana_cost || "—");

const pendingImageKey = ref<string | null>(null);
const canHover = ref(true);
const hoveredCardImage = ref<string | null>(null);
const imagePosition = ref({ x: 0, y: 0 });
const isCardLoading = ref(false);
const isFullscreenPreview = ref(false);
const isMobileModalOpen = ref(false);
const modalImageUrl = ref<string | null>(null);
const modalLoading = ref(false);
const modalCard = ref<DisplayCard | null>(null);
const scryfallLink = computed(() => {
  if (props.card?.scryfall_uri) {
    return props.card.scryfall_uri;
  }
  if (props.card?.name) {
    return `https://scryfall.com/search?q=${encodeURIComponent(props.card.name)}`;
  }
  return null;
});
let hoverLoadTimeout: ReturnType<typeof setTimeout> | null = null;
const TAP_MOVE_THRESHOLD = 12;
const HOVER_LOAD_DELAY = 150;
const touchTracking = ref({
  active: false,
  startX: 0,
  startY: 0,
  moved: false,
});

const { withLoading } = useGlobalLoading();
const cardPreviewScope = "card-preview";
const {
  ensureSymbolsLoaded,
  getSvgForSymbol,
  isLoading: symbolsLoading,
} = useScryfallSymbols();

const normalizeCardName = (value: string) => value.trim().toLowerCase();

const loadCardImage = async (
  cardName: string,
  useGlobalLoader = false
): Promise<string | null> => {
  const normalized = normalizeCardName(cardName);
  if (cardImageCache.has(normalized)) {
    return cardImageCache.get(normalized) ?? null;
  }

  const fetchImage = async () => {
    const imageUrl = await getCardImage(cardName);
    if (imageUrl) {
      cardImageCache.set(normalized, imageUrl);
    }
    return imageUrl ?? null;
  };

  if (useGlobalLoader) {
    return withLoading(fetchImage, "Loading card preview...", cardPreviewScope);
  }
  return fetchImage();
};

const handleCardHover = async (
  cardName: string,
  event: MouseEvent | PointerEvent
) => {
  if (!(event instanceof PointerEvent) || event.pointerType === "mouse") {
    isFullscreenPreview.value = false;
  }
  const normalized = normalizeCardName(cardName);
  pendingImageKey.value = normalized;
  updateImagePosition(event);

  if (cardImageCache.has(normalized)) {
    hoveredCardImage.value = cardImageCache.get(normalized) ?? null;
    isCardLoading.value = false;
    return;
  }

  hoveredCardImage.value = null;
  scheduleHoverLoad(cardName, normalized);
};

const updateImagePosition = (event: MouseEvent | PointerEvent) => {
  imagePosition.value = {
    x: event.clientX + 100,
    y: event.clientY + 160,
  };
};

const handlePointerMove = (event: PointerEvent | MouseEvent) => {
  updateImagePosition(event);
  if (
    event instanceof PointerEvent &&
    !canHover.value &&
    event.pointerType !== "mouse" &&
    touchTracking.value.active
  ) {
    const dx = Math.abs(event.clientX - touchTracking.value.startX);
    const dy = Math.abs(event.clientY - touchTracking.value.startY);
    if (dx > TAP_MOVE_THRESHOLD || dy > TAP_MOVE_THRESHOLD) {
      touchTracking.value.moved = true;
    }
  }
};

const hideCardImage = () => {
  pendingImageKey.value = null;
  hoveredCardImage.value = null;
  isFullscreenPreview.value = false;
  isCardLoading.value = false;
  clearHoverLoadTimeout();
};

const handlePointerDown = (_cardName: string, event: PointerEvent) => {
  if (event.pointerType === "mouse" || canHover.value) {
    return;
  }
  touchTracking.value = {
    active: true,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
  };
};

const handlePointerUp = (_event: PointerEvent) => {
  if (canHover.value || _event.pointerType === "mouse") {
    return;
  }
  if (
    touchTracking.value.active &&
    !touchTracking.value.moved &&
    !modalLoading.value
  ) {
    openMobileModal();
  }
  resetTouchTracking();
};

const handlePointerLeave = (_event: PointerEvent) => {
  hideCardImage();
  resetTouchTracking();
};

const setupHoverDetection = () => {
  if (typeof window === "undefined" || !("matchMedia" in window)) {
    canHover.value = false;
    return;
  }

  const query = window.matchMedia("(hover: hover)");
  hoverMediaQueryState.query = query;
  canHover.value = query.matches;
  hoverMediaQueryState.listener = (event: MediaQueryListEvent) => {
    canHover.value = event.matches;
  };
  query.addEventListener("change", hoverMediaQueryState.listener);
};

const hoverMediaQueryState = {
  query: null as MediaQueryList | null,
  listener: null as ((event: MediaQueryListEvent) => void) | null,
};

const checkboxClass =
  "h-4 w-4 rounded border-[color:var(--border)] bg-transparent text-[color:var(--accent)] focus:ring-[color:var(--accent)]";
const tableCellClasses = {
  checkbox: "px-3 py-2 text-center",
  name: "px-3 py-2 align-top text-sm font-semibold text-[color:var(--text)]",
  mana: "px-3 py-2",
  muted: "px-3 py-2 text-sm text-[color:var(--muted)]",
  stats: "px-3 py-2 text-sm font-mono tabular-nums text-[color:var(--text)]",
  badge: "px-3 py-2",
  status: "px-3 py-2",
  price: "px-3 py-2 text-right",
};
const badgeBaseClass =
  "inline-flex items-center rounded-full border border-[color:var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]";
const setBadgeClass = `${badgeBaseClass} bg-[color:var(--surface-muted)] text-[color:var(--muted)]`;
const statusLabelBase =
  "inline-flex h-4 items-center text-[11px] text-[color:var(--muted)] transition-opacity duration-150";
const statusLabelClass = computed(() => [
  statusLabelBase,
  isCardLoading.value ? "opacity-100" : "opacity-0",
]);
const cardRowClass = computed(() => {
  const base =
    "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-xs text-[color:var(--text)] transition";
  const state = props.have
    ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
    : "border-[color:var(--border)] bg-[color:var(--surface)]";
  const hover = props.have
    ? "hover:border-[color:var(--accent-strong)]"
    : "hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-muted)]";
  return `${base} ${state} ${hover}`;
});

const tableRowClass = computed(() => {
  const base = props.have
    ? "bg-[color:var(--accent-soft)] text-[color:var(--text)]"
    : "bg-[color:var(--surface)] text-[color:var(--text)]";
  const hover = props.have
    ? "hover:bg-[color:var(--accent-soft)]"
    : "hover:bg-[color:var(--surface-muted)]";
  return `transition-colors ${base} ${hover}`;
});

const manaSymbols = computed(() => {
  if (!props.card.mana_cost) {
    return [] as Array<{ token: string; svg: string }>;
  }
  const matches = props.card.mana_cost.match(/\{[^}]+\}/g) ?? [];
  return matches
    .map((token: string) => {
      const svg = getSvgForSymbol(token);
      return svg ? { token, svg } : null;
    })
    .filter(
      (
        entry: { token: string; svg: string } | null
      ): entry is {
        token: string;
        svg: string;
      } => entry !== null
    );
});

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

const rarityBadgeClass = computed(() => [
  badgeBaseClass,
  "bg-[color:var(--surface-muted)]",
  rarityClass(cardRarity.value),
]);

onMounted(() => {
  setupHoverDetection();
  Promise.resolve(ensureSymbolsLoaded()).catch(() => {
    /* handled globally */
  });
});

onBeforeUnmount(() => {
  if (
    hoverMediaQueryState.query &&
    hoverMediaQueryState.listener &&
    "removeEventListener" in hoverMediaQueryState.query
  ) {
    hoverMediaQueryState.query.removeEventListener(
      "change",
      hoverMediaQueryState.listener
    );
  }
});

const openScryfallPage = () => {
  if (typeof window === "undefined") {
    return;
  }
  const url = scryfallLink.value;
  if (url) {
    window.open(url, "_blank", "noopener");
  }
};

const handleRowClick = () => {
  if (!canHover.value) {
    return;
  }
  openScryfallPage();
};

const handleMobileRowClick = () => {
  if (canHover.value) {
    openScryfallPage();
    return;
  }
  openMobileModal();
};

const openMobileModal = async () => {
  hideCardImage();
  modalCard.value = { ...props.card };
  isMobileModalOpen.value = true;
  modalLoading.value = true;
  try {
    modalImageUrl.value = await loadCardImage(props.card.name, false);
  } catch (error) {
    handleError(error, {
      notify: true,
      fallbackMessage: "Unable to load that card image from Scryfall.",
      context: "Card preview modal",
    });
    modalImageUrl.value = null;
  } finally {
    modalLoading.value = false;
  }
};

const closeMobileModal = () => {
  isMobileModalOpen.value = false;
  modalImageUrl.value = null;
};

const clearHoverLoadTimeout = () => {
  if (hoverLoadTimeout) {
    clearTimeout(hoverLoadTimeout);
    hoverLoadTimeout = null;
  }
};

const scheduleHoverLoad = (cardName: string, normalized: string) => {
  clearHoverLoadTimeout();
  hoverLoadTimeout = setTimeout(async () => {
    isCardLoading.value = true;
    try {
      const imageUrl = await loadCardImage(cardName, true);
      if (imageUrl && pendingImageKey.value === normalized) {
        hoveredCardImage.value = imageUrl;
      }
    } catch (error) {
      handleError(error, {
        notify: true,
        fallbackMessage: "Unable to load that card image from Scryfall.",
        context: "Card hover preview",
      });
    } finally {
      isCardLoading.value = false;
      clearHoverLoadTimeout();
    }
  }, HOVER_LOAD_DELAY);
};

const resetTouchTracking = () => {
  touchTracking.value = {
    active: false,
    startX: 0,
    startY: 0,
    moved: false,
  };
};
</script>
<style scoped>
.name-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
