<template>
  <section class="space-y-8 text-slate-900 dark:text-slate-100">
    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-500 shadow-lg shadow-slate-900/5 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400 dark:shadow-black/40"
    >
      Loading commander data...
    </div>
    <div
      v-else-if="error"
      class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-lg shadow-rose-200/40 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200 dark:shadow-rose-900/40"
    >
      Error: {{ error }}
    </div>

    <div
      class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-black/40"
    >
      <commander-search @commanderSelected="searchCommander" />
    </div>

    <article
      v-for="cardlist in cardlists"
      :key="cardlist.header"
      class="space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-900/5 dark:border-slate-700/70 dark:bg-slate-900/60 dark:shadow-black/50"
    >
      <header
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500/80 dark:text-emerald-300/70"
          >
            EDHREC Cardlist
          </p>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
            {{ cardlist.header }}
          </h2>
        </div>
        <div class="flex flex-wrap gap-2 text-sm font-semibold">
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="showOwned === true ? activeFilterClass : inactiveFilterClass"
            @click="showOwned = true"
          >
            Owned
          </button>
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === false ? activeFilterClass : inactiveFilterClass
            "
            @click="showOwned = false"
          >
            Unowned
          </button>
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="showOwned === null ? activeFilterClass : inactiveFilterClass"
            @click="showOwned = null"
          >
            Show All
          </button>
        </div>
      </header>

      <div class="flex flex-wrap gap-3" aria-live="polite">
        <label
          v-for="card in filteredCards(cardlist.cardviews)"
          :key="card.id"
          class="group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-400/70 sm:w-auto"
          :class="[
            isCardInUpload(card.name)
              ? 'border-emerald-500/70 bg-emerald-50 text-emerald-900 shadow-inner shadow-emerald-200 dark:border-emerald-400/70 dark:bg-emerald-500/10 dark:text-emerald-100 dark:shadow-emerald-600/30'
              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-emerald-400/40 dark:hover:bg-slate-900'
          ]"
          @mouseenter="handleCardHover(card.name, $event)"
          @mouseleave="hideCardImage"
          @mousemove="updateImagePosition($event)"
          @pointerdown="handlePointerDown(card.name, $event)"
          @pointerup="handlePointerUp"
          @pointerleave="handlePointerLeave"
          @pointercancel="handlePointerLeave"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-400 bg-transparent text-emerald-500 focus:ring-emerald-400 dark:border-slate-600 dark:text-emerald-400 dark:focus:ring-emerald-300"
            :checked="isCardInUpload(card.name)"
            disabled
            :aria-checked="isCardInUpload(card.name)"
            aria-label="Card present in uploaded list"
          />
          <span class="font-medium">{{ card.name }}</span>
        </label>
      </div>
    </article>

    <div
      v-if="hoveredCardImage"
      class="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white/95 p-1.5 text-slate-900 shadow-2xl shadow-slate-900/15 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/60"
      :style="{ left: imagePosition.x + 'px', top: imagePosition.y + 'px' }"
    >
      <img
        :src="hoveredCardImage"
        alt="Card preview"
        class="w-56 rounded-lg shadow-lg shadow-slate-900/15 dark:shadow-black/40"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useLocalStorage, useDebounceFn } from "@vueuse/core";
import { getCardImage } from "../api/scryfallApi";
import { CommanderSearch } from ".";

interface EdhrecData {
  container?: {
    json_dict?: {
      cardlists?: {
        header: string;
        cardviews: { id: string; name: string }[];
      }[];
    };
  };
}

const data = ref<EdhrecData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");
const showOwned = ref<boolean | null>(null);
const canHover = ref(true);

const activeFilterClass =
  "border-emerald-500/80 bg-emerald-100 text-emerald-900 shadow-inner shadow-emerald-200 dark:border-emerald-400/70 dark:bg-emerald-400/20 dark:text-emerald-100 dark:shadow-emerald-500/30";
const inactiveFilterClass =
  "border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-emerald-400/40 dark:hover:text-white";

const fetchJsonData = async (url: string) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    data.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "An error occurred";
  } finally {
    loading.value = false;
  }
};

const cardlists = computed(
  () => data.value?.container?.json_dict?.cardlists || []
);

const uploadedRows = useLocalStorage<string[][]>("csv-upload-data", []);
const uploadedHeaders = useLocalStorage<string[]>("csv-upload-headers", []);

const uploadedNameIndex = computed(() => {
  const headers = uploadedHeaders.value;
  const idx = headers.findIndex(
    (header) => header.trim().toLowerCase() === "name"
  );
  return idx >= 0 ? idx : 0;
});

const normalizeCardName = (value: string) => value.trim().toLowerCase();

const uploadedCardNameSet = computed(() => {
  if (!uploadedRows.value.length) {
    return new Set<string>();
  }

  const idx = uploadedNameIndex.value;

  return new Set(
    uploadedRows.value
      .map((row) => row[idx] ?? row[0] ?? "")
      .map((value) => normalizeCardName(value))
      .filter((value) => value.length > 0)
  );
});

const isCardInUpload = (cardName: string) => {
  if (!cardName) {
    return false;
  }

  return uploadedCardNameSet.value.has(normalizeCardName(cardName));
};

const hoveredCardImage = ref<string | null>(null);
const imagePosition = ref({ x: 0, y: 0 });
const pendingImageKey = ref<string | null>(null);
const imageCache = new Map<string, string>();
const hoverMediaQueryState = {
  query: null as MediaQueryList | null,
  listener: null as ((event: MediaQueryListEvent) => void) | null,
};
const DOUBLE_TAP_THRESHOLD = 300;
let lastTapCard: string | null = null;
let lastTapTimestamp = 0;
let mobilePreviewPinned = false;
let mobileDismissListener: ((event: PointerEvent) => void) | null = null;

const updateImagePosition = (event: MouseEvent | PointerEvent) => {
  imagePosition.value = {
    x: event.clientX + 20,
    y: event.clientY + 20,
  };
};

const handleCardHover = async (
  cardName: string,
  event: MouseEvent | PointerEvent
) => {
  const normalized = normalizeCardName(cardName);
  pendingImageKey.value = normalized;
  updateImagePosition(event);

  if (imageCache.has(normalized)) {
    hoveredCardImage.value = imageCache.get(normalized) ?? null;
    return;
  }

  hoveredCardImage.value = null;
  try {
    const imageUrl = await getCardImage(cardName);
    if (imageUrl) {
      imageCache.set(normalized, imageUrl);
      if (pendingImageKey.value === normalized) {
        hoveredCardImage.value = imageUrl;
      }
    }
  } catch (err) {
    console.error("Unable to fetch card image:", err);
  }
};

const hideCardImage = () => {
  pendingImageKey.value = null;
  hoveredCardImage.value = null;
  mobilePreviewPinned = false;
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
  if (mobilePreviewPinned && !(canHover.value || event.pointerType === "mouse")) {
    return;
  }
  hideCardImage();
};

const searchCommander = useDebounceFn((query: string) => {
  const formattedQuery = query.toLowerCase().replace(/[\s,]+/g, "-");
  const removeApostrophes = formattedQuery.replace(/'/g, "");
  fetchJsonData(
    `https://json.edhrec.com/pages/commanders/${removeApostrophes}.json`
  );
}, 300);

watch(searchQuery, (newQuery) => {
  searchCommander(newQuery);
});
const filteredCards = (cardviews: { id: string; name: string }[]) => {
  if (showOwned.value === null) return cardviews;
  return cardviews.filter(
    (card) => isCardInUpload(card.name) === showOwned.value
  );
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

onMounted(() => {
  setupHoverDetection();
  fetchJsonData("https://json.edhrec.com/pages/commanders/teysa-karlov.json");
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
