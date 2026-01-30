<template>
  <div
    role="button"
    tabindex="0"
    :class="cardRowClass"
    @mouseenter="emit('hover', $event)"
    @mouseleave="emit('leave')"
    @pointermove="emit('pointermove', $event)"
    @pointerdown="emit('pointerdown', $event)"
    @pointerup="emit('pointerup', $event)"
    @pointerleave="emit('pointerleave', $event)"
    @pointercancel="emit('pointerleave', $event)"
    @click="emit('activate')"
    @keydown.enter="emit('activate')"
    @keydown.space.prevent="emit('activate')"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <input
        type="checkbox"
        :class="checkboxClass"
        :checked="have"
        disabled
        :aria-checked="have"
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
            :key="symbol.token + cardId + '-compact'"
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
          :price="usdPrice"
          currency="$"
          class="text-[11px]"
        />
        <PriceColour
          :price="eurPrice"
          currency="€"
          class="text-[11px]"
        />
      </div>
      <span :class="statusLabelClass">Loading preview…</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import PriceColour from "../PriceColour.vue";

type ManaSymbol = { token: string; svg: string };

defineProps<{
  cardId: string;
  cardName: string;
  cardSet: string;
  cardRarity: string;
  cardTypeShort: string;
  cardTypeFull: string;
  cardMana: string;
  manaSymbols: ManaSymbol[];
  symbolsLoading: boolean;
  rarityBadgeClass: string | string[];
  setBadgeClass: string;
  statusLabelClass: string | string[];
  checkboxClass: string;
  cardRowClass: string;
  have: boolean;
  usdPrice: string | null;
  eurPrice: string | null;
}>();

const emit = defineEmits<{
  hover: [event: MouseEvent | PointerEvent];
  leave: [];
  pointermove: [event: PointerEvent | MouseEvent];
  pointerdown: [event: PointerEvent];
  pointerup: [event: PointerEvent];
  pointerleave: [event: PointerEvent];
  activate: [];
}>();
</script>
