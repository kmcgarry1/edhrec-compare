<template>
  <img
    v-if="symbolSvg"
    :src="symbolSvg"
    :alt="label"
    :title="label"
    :class="iconClass"
    loading="lazy"
  />
  <span
    v-else
    :class="[
      iconClass,
      'inline-flex items-center justify-center rounded-full border border-black/20 text-[0.65rem] font-bold leading-none text-black/75',
      colorDotClass(color),
    ]"
    :aria-label="label"
    :title="label"
  >
    {{ color }}
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";
import { COLOR_IDENTITY_META, type CommanderColor } from "../utils/colorIdentity";

const props = withDefaults(
  defineProps<{
    color: CommanderColor;
    iconClass?: string;
  }>(),
  {
    iconClass: "h-5 w-5",
  }
);

const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();

const token = computed(() => `{${props.color}}`);
const label = computed(() => COLOR_IDENTITY_META[props.color]?.label ?? props.color);
const symbolSvg = computed(() => getSvgForSymbol(token.value));

const colorDotClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.dot ?? "";

onMounted(() => {
  void ensureSymbolsLoaded();
});
</script>
