<template>
  <tr
    class="cursor-pointer"
    :class="tableRowClass"
    @mouseenter="emit('hover', $event)"
    @mouseleave="emit('leave')"
    @pointermove="emit('pointermove', $event)"
    @pointerdown="emit('pointerdown', $event)"
    @pointerup="emit('pointerup', $event)"
    @pointerleave="emit('pointerleave', $event)"
    @pointercancel="emit('pointerleave', $event)"
    @click="emit('activate')"
  >
    <td :class="tableCellClasses.checkbox">
      <input
        type="checkbox"
        :class="checkboxClass"
        :checked="have"
        disabled
        :aria-checked="have"
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
            :key="symbol.token + cardId"
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
      :price="usdPrice"
      currency="$"
      :class="tableCellClasses.price"
    />
    <PriceColour
      tag="td"
      :pill="false"
      :price="eurPrice"
      currency="€"
      :class="tableCellClasses.price"
    />
  </tr>
</template>

<script setup lang="ts">
import PriceColour from "../PriceColour.vue";

type ManaSymbol = { token: string; svg: string };

type TableCellClasses = {
  checkbox: string;
  name: string;
  mana: string;
  muted: string;
  stats: string;
  badge: string;
  status: string;
  price: string;
};

defineProps<{
  cardId: string;
  cardName: string;
  hasSplitName: boolean;
  primaryName: string;
  secondaryName: string;
  cardMana: string;
  manaSymbols: ManaSymbol[];
  symbolsLoading: boolean;
  cardTypeShort: string;
  cardTypeFull: string;
  cardRarity: string;
  rarityBadgeClass: string | string[];
  statusLabelClass: string | string[];
  checkboxClass: string;
  tableCellClasses: TableCellClasses;
  tableRowClass: string;
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

<style scoped>
.name-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
