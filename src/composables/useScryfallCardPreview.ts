import { onBeforeUnmount, onMounted, ref, computed, type Ref } from "vue";
import { getCardImage } from "../api/scryfallApi";
import { useGlobalLoading } from "./useGlobalLoading";
import { handleError } from "../utils/errorHandler";
import type { DisplayCard } from "../types/cards";

const cardImageCache = new Map<string, string>();
const TAP_MOVE_THRESHOLD = 12;
const HOVER_LOAD_DELAY = 150;

const normalizeCardName = (value: string) => value.trim().toLowerCase();

export const useScryfallCardPreview = (card: Ref<DisplayCard>) => {
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
  const touchTracking = ref({
    active: false,
    startX: 0,
    startY: 0,
    moved: false,
  });

  const { withLoading } = useGlobalLoading();
  const cardPreviewScope = "card-preview";

  const scryfallLink = computed(() => {
    if (card.value?.scryfall_uri) {
      return card.value.scryfall_uri;
    }
    if (card.value?.name) {
      return `https://scryfall.com/search?q=${encodeURIComponent(card.value.name)}`;
    }
    return null;
  });

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

  const updateImagePosition = (event: MouseEvent | PointerEvent) => {
    imagePosition.value = {
      x: event.clientX + 100,
      y: event.clientY + 160,
    };
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

  const hideCardImage = () => {
    pendingImageKey.value = null;
    hoveredCardImage.value = null;
    isFullscreenPreview.value = false;
    isCardLoading.value = false;
    clearHoverLoadTimeout();
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

  const resetTouchTracking = () => {
    touchTracking.value = {
      active: false,
      startX: 0,
      startY: 0,
      moved: false,
    };
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

  const handlePointerUp = (event: PointerEvent) => {
    if (canHover.value || event.pointerType === "mouse") {
      return;
    }
    if (touchTracking.value.active && !touchTracking.value.moved && !modalLoading.value) {
      openMobileModal();
    }
    resetTouchTracking();
  };

  const handlePointerLeave = (_event: PointerEvent) => {
    hideCardImage();
    resetTouchTracking();
  };

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
    modalCard.value = { ...card.value };
    isMobileModalOpen.value = true;
    modalLoading.value = true;
    try {
      modalImageUrl.value = await loadCardImage(card.value.name, false);
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

  onMounted(() => {
    setupHoverDetection();
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

  return {
    hoveredCardImage,
    imagePosition,
    isCardLoading,
    isFullscreenPreview,
    isMobileModalOpen,
    modalImageUrl,
    modalLoading,
    modalCard,
    scryfallLink,
    handleCardHover,
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    handlePointerLeave,
    handleRowClick,
    handleMobileRowClick,
    hideCardImage,
    closeMobileModal,
  };
};
