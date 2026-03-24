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
  wrapClasses,
  type Align,
  type Gap,
  type Justify,
  type Wrap,
} from "./config";

const props = withDefaults(
  defineProps<{
    as?: string;
    gap?: Gap;
    align?: Align;
    justify?: Justify;
    wrap?: Wrap;
    fullWidth?: boolean;
  }>(),
  {
    as: "div",
    gap: "md",
    align: "center",
    justify: "start",
    wrap: "wrap",
    fullWidth: false,
  }
);

const classes = computed(() =>
  cx(
    "c-inline flex",
    gapClasses[props.gap],
    alignClasses[props.align],
    justifyClasses[props.justify],
    wrapClasses[props.wrap],
    props.fullWidth ? "w-full" : ""
  )
);
</script>

