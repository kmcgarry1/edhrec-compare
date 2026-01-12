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
          class="h-4 w-4 rounded border-[color:var(--border)] bg-transparent text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
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
            <span class="text-xs text-[color:var(--muted)]">
              Loading symbols...
            </span>
          </template>
          <template v-else>
            {{ props.card.mana_cost || "—" }}
          </template>
        </div>
      </td>
      <td class="px-3 py-2 text-[color:var(--muted)]">
        {{ props.card.type_line || "—" }}
      </td>
      <td
        class="px-3 py-2 font-mono text-sm text-[color:var(--text)]"
      >
        <span v-if="props.card.power && props.card.toughness">
          {{ props.card.power }}/{{ props.card.toughness }}
        </span>
        <span v-else>—</span>
      </td>
      <td class="px-3 py-2 text-[color:var(--muted)]">
        <span class="uppercase tracking-wide text-xs">
          {{ (props.card.set || "").toUpperCase() || "—" }}
        </span>
      </td>
      <td class="px-3 py-2 capitalize" :class="rarityClass(props.card.rarity)">
        {{ props.card.rarity || "—" }}
      </td>
      <td class="px-3 py-2 text-xs">
        <span
          class="inline-flex h-4 items-center text-[color:var(--muted)] transition-opacity duration-150"
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
      class="flex items-center gap-2 border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-xs"
      :class="props.have ? 'ring-1 ring-[color:var(--accent)]' : ''"
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
        class="h-4 w-4 rounded border-[color:var(--border)] bg-transparent text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
        :checked="props.have"
        disabled
        :aria-checked="props.have"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold">
          {{ props.card.name }}
        </p>
        <p class="mt-0.5 truncate text-[11px] text-[color:var(--muted)]">
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
          class="text-[10px] text-[color:var(--muted)] transition-opacity duration-150"
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

const tableRowClass = computed(() => {
  const base = props.have
    ? "bg-[color:var(--accent-soft)] text-[color:var(--text)]"
    : "bg-[color:var(--surface)] text-[color:var(--text)]";
  const hover = props.have
    ? "hover:bg-[color:var(--accent-soft)]"
    : "hover:bg-[color:var(--surface-muted)]";
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
      return "text-[color:var(--text)]";
    case "uncommon":
      return "text-[color:var(--muted)]";
    case "rare":
      return "text-[color:var(--warn)]";
    case "mythic":
      return "text-[color:var(--danger)]";
    default:
      return "text-[color:var(--muted)]";
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
