<template>
  <div
    class="group flex dense items-center gap-3 rounded-2xl border px-2 py-1 dense text-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-400/70 sm:w-auto"
    :class="[
      'dense flex flex-row',
      props.have
        ? 'border-emerald-500/70 bg-emerald-50 text-emerald-900 shadow-inner shadow-emerald-200 dark:border-emerald-400/70 dark:bg-emerald-500/10 dark:text-emerald-100 dark:shadow-emerald-600/30'
        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-emerald-400/40 dark:hover:bg-slate-900',
    ]"
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
      aria-label="Card present in uploaded list"
    />
    <div class="dense flex flex-wrap items-center gap-1 p-2">
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
        {{ props.card.mana_cost }}
      </template>
    </div>
    <div class="dense font-semibold p-2 flex-grow">
      {{ props.card.name }}
    </div>
    <div class="dense p-2">
      {{ props.card.type_line }}
    </div>
    <div
      v-if="props.card.power && props.card.toughness"
      class="dense p-2 flex-end"
    >
      {{ props.card.power }}/{{ props.card.toughness }}
    </div>
    <div
      v-if="isCardLoading"
      class="ml-auto rounded-full bg-slate-200/80 px-3 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
    >
      Loading preview...
    </div>
  </div>
  <Card
    v-if="hoveredCardImage"
    as="div"
    padding="p-1.5"
    rounded="rounded-xl"
    border="border border-slate-200 dark:border-slate-700/70"
    background="bg-white/95 dark:bg-slate-900/80"
    shadow="shadow-2xl shadow-slate-900/15 dark:shadow-black/60"
    class="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-slate-900 dark:text-slate-100"
    :style="{ left: imagePosition.x + 'px', top: imagePosition.y + 'px' }"
  >
    <img
      :src="hoveredCardImage"
      alt="Card preview"
      class="w-56 rounded-lg shadow-lg shadow-slate-900/15 dark:shadow-black/40"
    />
  </Card>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed } from "vue";
import { getCardImage } from "../api/scryfallApi";
import { Card } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";
const props = defineProps<{
  card: any;
  have?: boolean;
}>();

const pendingImageKey = ref<string | null>(null);
const imageCache = new Map<string, string>();
const canHover = ref(true);
const DOUBLE_TAP_THRESHOLD = 300;
let lastTapCard: string | null = null;
let lastTapTimestamp = 0;
let mobilePreviewPinned = false;
let mobileDismissListener: ((event: PointerEvent) => void) | null = null;
const hoveredCardImage = ref<string | null>(null);
const imagePosition = ref({ x: 0, y: 0 });
const isCardLoading = ref(false);
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
  const normalized = normalizeCardName(cardName);
  pendingImageKey.value = normalized;
  updateImagePosition(event);

  if (imageCache.has(normalized)) {
    hoveredCardImage.value = imageCache.get(normalized) ?? null;
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
          imageCache.set(normalized, imageUrl);
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

  window.setTimeout(() => {
    if (mobileDismissListener) {
      window.addEventListener("pointerdown", mobileDismissListener, {
        once: true,
      });
    }
  }, 0);
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
    lastTapCard = null;
    lastTapTimestamp = 0;
    event.preventDefault();
    handleCardHover(cardName, event);
    scheduleMobileDismissListener();
    return;
  }

  lastTapCard = cardName;
  lastTapTimestamp = now;
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
