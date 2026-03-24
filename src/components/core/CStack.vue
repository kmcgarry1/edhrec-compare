<template>
  <component :is="as" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  alignClasses,
  cx,
  gapClasses,
  justifyClasses,
  type Align,
  type Gap,
  type Justify,
} from "./config";

const props = withDefaults(
  defineProps<{
    as?: string;
    gap?: Gap;
    align?: Align;
    justify?: Justify;
    fullWidth?: boolean;
  }>(),
  {
    as: "div",
    gap: "md",
    align: "stretch",
    justify: "start",
    fullWidth: false,
  }
);

const classes = computed(() =>
  cx(
    "c-stack flex flex-col",
    gapClasses[props.gap],
    alignClasses[props.align],
    justifyClasses[props.justify],
    props.fullWidth ? "w-full" : ""
  )
);
</script>

