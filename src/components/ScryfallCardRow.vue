<template>
  <template v-if="variant === 'table'">
    <tr
      class="transition cursor-pointer"
      :class="tableRowClass"
      @mouseenter="handleCardHover(props.card.name, $event)"
      @mouseleave="hideCardImage"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown(props.card.name, $event)"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave"
      @click="handleRowClick"
    >
      <td class="px-3 py-2 text-center">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-400 bg-transparent text-emerald-500 focus:ring-emerald-400 dark:border-slate-600 dark:text-emerald-400 dark:focus:ring-emerald-300"
          :checked="props.have"
          disabled
          :aria-checked="props.have"
          aria-label="Card present in uploaded list"
        />
      </td>
      <td class="px-3 py-2 font-semibold">
        {{ props.card.name }}
      </td>
      <td class="px-3 py-2">
        <div class="flex flex-wrap items-center gap-1">
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
            <span class="text-xs text-slate-500 dark:text-slate-400">
              Loading symbols...
            </span>
          </template>
          <template v-else>
            {{ props.card.mana_cost || "—" }}
          </template>
        </div>
      </td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">
        {{ props.card.type_line || "—" }}
      </td>
      <td
        class="px-3 py-2 font-mono text-sm text-slate-700 dark:text-slate-200"
      >
        <span v-if="props.card.power && props.card.toughness">
          {{ props.card.power }}/{{ props.card.toughness }}
        </span>
        <span v-else>—</span>
      </td>
      <td class="px-3 py-2 text-slate-600 dark:text-slate-300">
        <span class="uppercase tracking-wide text-xs">
          {{ (props.card.set || "").toUpperCase() || "—" }}
        </span>
      </td>
      <td class="px-3 py-2 capitalize" :class="rarityClass(props.card.rarity)">
        {{ props.card.rarity || "—" }}
      </td>
      <td class="px-3 py-2 text-xs">
        <span
          class="inline-flex h-4 items-center text-slate-500 dark:text-slate-400 transition-opacity duration-150"
          :class="isCardLoading ? 'opacity-100' : 'opacity-0'"
        >
          Loading preview…
        </span>
      </td>
      <PriceColour
        tag="td"
        :pill="false"
        :price="props.card.prices?.usd ?? null"
        currency="$"
        class="px-3 py-2 text-right font-mono text-sm rounded-lg"
      />
      <PriceColour
        tag="td"
        :pill="false"
        :price="props.card.prices?.eur ?? null"
        currency="€"
        class="px-3 py-2 text-right font-mono text-sm rounded-lg"
      />
    </tr>
  </template>
  <template v-else>
    <div
      role="button"
      tabindex="0"
      class="flex items-center gap-2 border border-slate-200/70 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/70"
      :class="props.have ? 'ring-1 ring-emerald-400/60' : ''"
      @mouseenter="handleCardHover(props.card.name, $event)"
      @mouseleave="hideCardImage"
      @pointermove="handlePointerMove"
      @pointerdown="handlePointerDown(props.card.name, $event)"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave"
      @click="handleMobileRowClick"
    >
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-slate-400 bg-transparent text-emerald-500 focus:ring-emerald-400 dark:border-slate-600 dark:text-emerald-400 dark:focus:ring-emerald-300"
        :checked="props.have"
        disabled
        :aria-checked="props.have"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">
          {{ props.card.name }}
        </p>
        <p
          class="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400"
        >
          {{ props.card.type_line || "—" }} ·
          <span class="uppercase">{{
            (props.card.set || "").toUpperCase() || "—"
          }}</span>
          ·
          <span :class="rarityClass(props.card.rarity)">
            {{ props.card.rarity || "—" }}
          </span>
        </p>
      </div>
      <div class="flex flex-col items-end gap-1 text-[11px]">
        <div class="flex items-center gap-0.5">
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
            {{ props.card.mana_cost || "—" }}
          </template>
        </div>
        <div class="flex items-center gap-1 font-mono">
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
        <p
          class="text-[10px] text-slate-500 dark:text-slate-400 transition-opacity duration-150"
          :class="isCardLoading ? 'opacity-100' : 'opacity-0'"
        >
          Loading preview…
        </p>
      </div>
    </div>
  </template>

  <Teleport to="body">
    <div
      v-if="hoveredCardImage && isFullscreenPreview"
      class="fixed inset-0 z-[60] flex flex-col bg-slate-950/90 px-4 py-6 text-white backdrop-blur"
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
      border="border border-slate-200 dark:border-slate-700/70"
      background="bg-white/95 dark:bg-slate-900/80"
      shadow="shadow-2xl shadow-slate-900/15 dark:shadow-black/60"
      class="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-100"
      :fullWidth="false"
      :style="{ left: imagePosition.x + 'px', top: imagePosition.y + 'px' }"
    >
      <img
        :src="hoveredCardImage"
        alt="Card preview"
        class="w-56 rounded-lg shadow-lg shadow-slate-900/15 dark:shadow-black/40"
      />
    </Card>
  </Teleport>
  <Teleport to="body">
    <div
      v-if="isMobileModalOpen"
      class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
      @click.self="closeMobileModal"
    >
      <Card
        as="div"
        padding="p-4 sm:p-6"
        rounded="rounded-3xl"
        border="border border-slate-200 dark:border-slate-700"
        background="bg-white dark:bg-slate-900"
        shadow="shadow-2xl shadow-slate-900/60 dark:shadow-black/70"
        class="w-full max-w-md space-y-4"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-emerald-500/80">
              Card Preview
            </p>
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
              {{ modalCard?.name }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-300">
              {{ modalCard?.type_line }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/60"
            @click="closeMobileModal"
          >
            Close
          </button>
        </div>
        <div class="flex justify-center">
          <div
            v-if="modalLoading"
            class="h-64 w-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          ></div>
          <img
            v-else-if="modalImageUrl"
            :src="modalImageUrl"
            :alt="modalCard?.name ?? 'Card'"
            class="w-44 rounded-2xl shadow-lg shadow-slate-900/20 dark:shadow-black/40"
          />
          <div
            v-else
            class="h-64 w-44 rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-300"
          >
            Image unavailable
          </div>
        </div>
        <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
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
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200 dark:hover:text-emerald-200"
            @click="openScryfallPage"
          >
            View on Scryfall
          </button>
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

const tableRowClass = computed(() => {
  const base = props.have
    ? "bg-emerald-100/60 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
    : "bg-white text-slate-800 dark:bg-slate-900/60 dark:text-slate-100";
  const hover = props.have
    ? "hover:bg-emerald-200/70 dark:hover:bg-emerald-800/60"
    : "hover:bg-slate-100/80 dark:hover:bg-slate-800/70";
  return `${base} ${hover}`;
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
      return "text-slate-700 dark:text-slate-100";
    case "uncommon":
      return "text-slate-500 dark:text-slate-200";
    case "rare":
      return "text-amber-600 dark:text-amber-300";
    case "mythic":
      return "text-orange-600 dark:text-orange-400";
    default:
      return "text-slate-600 dark:text-slate-300";
  }
};

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
  const url =
    props.card?.scryfall_uri ||
    (props.card?.name
      ? `https://scryfall.com/search?q=${encodeURIComponent(props.card.name)}`
      : null);
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
