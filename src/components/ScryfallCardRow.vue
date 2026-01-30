<template>
  <ScryfallCardRowTable
    v-if="variant === 'table'"
    :card-id="card.id"
    :card-name="cardName"
    :has-split-name="hasSplitName"
    :primary-name="primaryName"
    :secondary-name="secondaryName"
    :card-mana="cardMana"
    :mana-symbols="manaSymbols"
    :symbols-loading="symbolsLoading"
    :card-type-short="cardTypeShort"
    :card-type-full="cardTypeFull"
    :card-rarity="cardRarity"
    :rarity-badge-class="rarityBadgeClass"
    :status-label-class="statusLabelClass"
    :checkbox-class="checkboxClass"
    :table-cell-classes="tableCellClasses"
    :table-row-class="tableRowClass"
    :have="have"
    :usd-price="usdPrice"
    :eur-price="eurPrice"
    @hover="handleCardHover(cardName, $event)"
    @leave="hideCardImage"
    @pointermove="handlePointerMove"
    @pointerdown="handlePointerDown(cardName, $event)"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerLeave"
    @activate="handleRowClick"
  />
  <ScryfallCardRowCard
    v-else
    :card-id="card.id"
    :card-name="cardName"
    :card-set="cardSet"
    :card-rarity="cardRarity"
    :card-type-short="cardTypeShort"
    :card-type-full="cardTypeFull"
    :card-mana="cardMana"
    :mana-symbols="manaSymbols"
    :symbols-loading="symbolsLoading"
    :rarity-badge-class="rarityBadgeClass"
    :set-badge-class="setBadgeClass"
    :status-label-class="statusLabelClass"
    :checkbox-class="checkboxClass"
    :card-row-class="cardRowClass"
    :have="have"
    :usd-price="usdPrice"
    :eur-price="eurPrice"
    @hover="handleCardHover(cardName, $event)"
    @leave="hideCardImage"
    @pointermove="handlePointerMove"
    @pointerdown="handlePointerDown(cardName, $event)"
    @pointerup="handlePointerUp"
    @pointerleave="handlePointerLeave"
    @activate="handleMobileRowClick"
  />

  <ScryfallCardPreview
    :hovered-card-image="hoveredCardImage"
    :is-fullscreen-preview="isFullscreenPreview"
    :image-position="imagePosition"
    :is-mobile-modal-open="isMobileModalOpen"
    :modal-image-url="modalImageUrl"
    :modal-loading="modalLoading"
    :modal-card="modalCard"
    :scryfall-link="scryfallLink"
    @close-preview="hideCardImage"
    @close-modal="closeMobileModal"
  />
</template>
<script setup lang="ts">
import { computed, toRef } from "vue";
import type { DisplayCard } from "../types/cards";
import { useScryfallCardMeta } from "../composables/useScryfallCardMeta";
import { useScryfallCardPreview } from "../composables/useScryfallCardPreview";
import { useScryfallCardRowStyles } from "../composables/useScryfallCardRowStyles";
import ScryfallCardRowTable from "./scryfall/ScryfallCardRowTable.vue";
import ScryfallCardRowCard from "./scryfall/ScryfallCardRowCard.vue";
import ScryfallCardPreview from "./scryfall/ScryfallCardPreview.vue";

const props = withDefaults(
  defineProps<{
    card: DisplayCard;
    have?: boolean;
    variant?: "table" | "card";
  }>(),
  {
    variant: "table",
    have: false,
  }
);

const cardRef = toRef(props, "card");
const haveRef = computed(() => Boolean(props.have));
const variant = computed(() => props.variant ?? "table");

const {
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
} = useScryfallCardMeta(cardRef);

const {
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
} = useScryfallCardPreview(cardRef);

const {
  checkboxClass,
  tableCellClasses,
  statusLabelClass,
  cardRowClass,
  tableRowClass,
} = useScryfallCardRowStyles(haveRef, isCardLoading);

const usdPrice = computed(() => props.card.prices?.usd ?? null);
const eurPrice = computed(() => props.card.prices?.eur ?? null);

const card = computed(() => props.card);
const have = computed(() => Boolean(props.have));
</script>
