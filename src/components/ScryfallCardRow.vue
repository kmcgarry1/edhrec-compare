<template>
  <template v-if="variant === 'table'">
    <tr
      class="transition"
      :class="tableRowClass"
      @mouseenter="handleCardHover(props.card.name, $event)"
      @mouseleave="hideCardImage"
      @mousemove="updateImagePosition($event)"
      @pointerdown="handlePointerDown(props.card.name, $event)"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave"
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
      <td
        class="px-3 py-2 text-right font-mono text-sm rounded-lg"
        :class="priceClass(props.card.prices?.usd)"
      >
        {{ formatPrice(props.card.prices?.usd, "$") }}
      </td>
      <td
        class="px-3 py-2 text-right font-mono text-sm rounded-lg"
        :class="priceClass(props.card.prices?.eur)"
      >
        {{ formatPrice(props.card.prices?.eur, "€") }}
      </td>
    </tr>
  </template>
  <template v-else>
    <div
      class="flex items-center gap-2 border border-slate-200/70 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/70"
      :class="props.have ? 'ring-1 ring-emerald-400/60' : ''"
      @mouseenter="handleCardHover(props.card.name, $event)"
      @mouseleave="hideCardImage"
      @mousemove="updateImagePosition($event)"
      @pointerdown="handlePointerDown(props.card.name, $event)"
      @pointerup="handlePointerUp"
      @pointerleave="handlePointerLeave"
      @pointercancel="handlePointerLeave"
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
          <span
            class="inline-flex rounded px-1.5 py-0.5"
            :class="priceClass(props.card.prices?.usd)"
          >
            {{ formatPrice(props.card.prices?.usd, "$") }}
          </span>
          <span
            class="inline-flex rounded px-1.5 py-0.5"
            :class="priceClass(props.card.prices?.eur)"
          >
            {{ formatPrice(props.card.prices?.eur, "€") }}
          </span>
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
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from "vue";
import { getCardImage } from "../api/scryfallApi";
import { Card } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";
const cardImageCache = new Map<string, string>();

const props = defineProps<{
  card: any;
  have?: boolean;
  variant?: "table" | "card";
}>();

const variant = computed(() => props.variant ?? "table");

const pendingImageKey = ref<string | null>(null);
const canHover = ref(true);
const DOUBLE_TAP_THRESHOLD = 300;
let lastTapCard: string | null = null;
let lastTapTimestamp = 0;
let mobilePreviewPinned = false;
let mobileDismissListener: ((event: PointerEvent) => void) | null = null;
const hoveredCardImage = ref<string | null>(null);
const imagePosition = ref({ x: 0, y: 0 });
const isCardLoading = ref(false);
const isFullscreenPreview = ref(false);
const { withLoading } = useGlobalLoading();
const cardPreviewScope = "card-preview";
const {
  ensureSymbolsLoaded,
  getSvgForSymbol,
  isLoading: symbolsLoading,
} = useScryfallSymbols();

const normalizeCardName = (value: string) => value.trim().toLowerCase();

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
  isCardLoading.value = true;
  try {
    await withLoading(
      async () => {
        const imageUrl = await getCardImage(cardName);
        if (imageUrl) {
          cardImageCache.set(normalized, imageUrl);
          if (pendingImageKey.value === normalized) {
            hoveredCardImage.value = imageUrl;
          }
        }
      },
      "Loading card preview...",
      cardPreviewScope
    );
  } catch (err) {
    console.error("Unable to fetch card image:", err);
  } finally {
    isCardLoading.value = false;
  }
};

const updateImagePosition = (event: MouseEvent | PointerEvent) => {
  imagePosition.value = {
    x: event.clientX + 100,
    y: event.clientY + 160,
  };
};

const hideCardImage = () => {
  pendingImageKey.value = null;
  hoveredCardImage.value = null;
  mobilePreviewPinned = false;
  isFullscreenPreview.value = false;
  isCardLoading.value = false;
  detachMobileDismissListener();
};

const detachMobileDismissListener = () => {
  if (mobileDismissListener && typeof window !== "undefined") {
    window.removeEventListener("pointerdown", mobileDismissListener);
    mobileDismissListener = null;
  }
};

const scheduleMobileDismissListener = () => {
  if (mobileDismissListener || typeof window === "undefined") {
    return;
  }

  mobileDismissListener = (event: PointerEvent) => {
    if (canHover.value || event.pointerType === "mouse") {
      return;
    }
    hideCardImage();
  };

  window.addEventListener("pointerdown", mobileDismissListener, {
    once: true,
  });
};

const handlePointerDown = (cardName: string, event: PointerEvent) => {
  if (canHover.value || event.pointerType === "mouse") {
    return;
  }

  const now = performance.now();
  if (
    lastTapCard === cardName &&
    now - lastTapTimestamp <= DOUBLE_TAP_THRESHOLD
  ) {
    mobilePreviewPinned = true;
    isFullscreenPreview.value = true;
    lastTapCard = null;
    lastTapTimestamp = 0;
    event.preventDefault();
    handleCardHover(cardName, event);
    scheduleMobileDismissListener();
    return;
  }

  lastTapCard = cardName;
  lastTapTimestamp = now;
  isFullscreenPreview.value = false;
};

const handlePointerUp = (_event: PointerEvent) => {
  if (canHover.value || _event.pointerType === "mouse") {
    return;
  }

  if (mobilePreviewPinned) {
    return;
  }

  hideCardImage();
};

const handlePointerLeave = (event: PointerEvent) => {
  if (
    mobilePreviewPinned &&
    !(canHover.value || event.pointerType === "mouse")
  ) {
    return;
  }
  hideCardImage();
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
    ? "bg-emerald-50/40 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
    : "bg-white text-slate-800 dark:bg-slate-900/60 dark:text-slate-100";
  const hover = props.have
    ? "hover:bg-emerald-100/60 dark:hover:bg-emerald-800/60"
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

const priceClass = (price?: string | null) => {
  const value = Number(price);
  if (!Number.isFinite(value)) {
    return "bg-slate-100/60 text-slate-600 dark:bg-slate-800/40 dark:text-slate-200";
  }

  if (value <= 0.5) {
    return "bg-cyan-100/70 text-cyan-900 dark:bg-cyan-600/30 dark:text-cyan-100";
  }
  if (value <= 1) {
    return "bg-emerald-100/70 text-emerald-900 dark:bg-emerald-600/30 dark:text-emerald-100";
  }
  if (value <= 2.5) {
    return "bg-lime-100/70 text-lime-900 dark:bg-lime-600/30 dark:text-lime-100";
  }
  if (value <= 5) {
    return "bg-yellow-100/70 text-yellow-900 dark:bg-yellow-600/30 dark:text-yellow-100";
  }
  if (value <= 10) {
    return "bg-amber-100/70 text-amber-900 dark:bg-amber-600/30 dark:text-amber-100";
  }
  if (value <= 20) {
    return "bg-orange-100/70 text-orange-900 dark:bg-orange-600/30 dark:text-orange-100";
  }
  if (value <= 50) {
    return "bg-red-100/70 text-red-900 dark:bg-red-600/30 dark:text-red-100";
  }
  return "bg-rose-200/70 text-rose-900 dark:bg-rose-600/40 dark:text-rose-100";
};

const formatPrice = (price?: string | null, currency = "$") => {
  const value = Number(price);
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${currency}${value.toFixed(2)}`;
};

onMounted(() => {
  setupHoverDetection();
  void ensureSymbolsLoaded();
});

onBeforeUnmount(() => {
  detachMobileDismissListener();
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
</script>
