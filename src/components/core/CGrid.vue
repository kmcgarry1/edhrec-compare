<template>
  <component :is="as" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { cx, gapClasses, type Gap } from "./config";

type GridVariant =
  | "single"
  | "halves"
  | "thirds"
  | "quarters"
  | "cards"
  | "sidebar";

const gridVariantClasses: Record<GridVariant, string> = {
  single: "grid-cols-1",
  halves: "grid-cols-1 sm:grid-cols-2",
  thirds: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  quarters: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  cards: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  sidebar: "grid-cols-1 lg:grid-cols-[18rem,1fr]",
};

const props = withDefaults(
  defineProps<{
    as?: string;
    gap?: Gap;
    variant?: GridVariant;
    fullWidth?: boolean;
  }>(),
  {
    as: "div",
    gap: "lg",
    variant: "single",
    fullWidth: false,
  }
);

const classes = computed(() =>
  cx(
    "c-grid grid",
    gapClasses[props.gap],
    gridVariantClasses[props.variant],
    props.fullWidth ? "w-full" : ""
  )
);
</script>

