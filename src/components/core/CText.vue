<template>
  <component :is="resolvedTag" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  cx,
  textAlignClasses,
  textLeadingClasses,
  textToneClasses,
  textVariantClasses,
  textWeightClasses,
  textWrapClasses,
  type TextTone,
  type TextVariant,
} from "./config";

type Weight = keyof typeof textWeightClasses;
type Align = keyof typeof textAlignClasses;
type Wrap = keyof typeof textWrapClasses;
type Leading = keyof typeof textLeadingClasses;

const props = withDefaults(
  defineProps<{
    as?: keyof HTMLElementTagNameMap | string;
    tag?: keyof HTMLElementTagNameMap | string;
    variant?: TextVariant;
    tone?: TextTone;
    weight?: Weight;
    align?: Align;
    wrap?: Wrap;
    leading?: Leading;
  }>(),
  {
    as: undefined,
    tag: "p",
    variant: "body",
    tone: "default",
    weight: "normal",
    align: "left",
    wrap: "normal",
    leading: undefined,
  }
);

const resolvedTag = computed(() => props.as ?? props.tag);

const classes = computed(() =>
  cx(
    "c-text",
    textVariantClasses[props.variant],
    textToneClasses[props.tone],
    textWeightClasses[props.weight],
    textAlignClasses[props.align],
    textWrapClasses[props.wrap],
    props.leading ? textLeadingClasses[props.leading] : undefined
  )
);
</script>
