<template>
  <component :is="tag" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, withDefaults } from "vue";

type Variant =
  | "body"
  | "label"
  | "helper"
  | "caption"
  | "title"
  | "overline";

type Tone =
  | "default"
  | "muted"
  | "subtle"
  | "inverse"
  | "danger"
  | "success"
  | "warn"
  | "inherit";

type Weight = "normal" | "medium" | "semibold" | "bold";
type Align = "left" | "center" | "right" | "justify";
type Wrap = "normal" | "break" | "nowrap" | "truncate";
type Leading = "none" | "tight" | "normal" | "relaxed" | "loose";

const variantClasses: Record<Variant, string> = {
  body: "text-sm",
  helper: "text-xs",
  label: "text-xs font-semibold uppercase tracking-wide",
  caption: "text-[11px]",
  title: "text-base font-semibold",
  overline: "text-[10px] font-semibold uppercase tracking-[0.2em]",
};

const toneClasses: Record<Tone, string> = {
  default: "text-slate-700 dark:text-slate-100",
  muted: "text-slate-600 dark:text-slate-200",
  subtle: "text-slate-500 dark:text-slate-400",
  inverse: "text-white",
  danger: "text-rose-600 dark:text-rose-300",
  success: "text-emerald-600 dark:text-emerald-300",
  warn: "text-amber-600 dark:text-amber-300",
  inherit: "",
};

const weightClasses: Record<Weight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const alignClasses: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

const wrapClasses: Record<Wrap, string> = {
  normal: "whitespace-normal",
  break: "break-words",
  nowrap: "whitespace-nowrap",
  truncate: "truncate",
};

const leadingClasses: Record<Leading, string> = {
  none: "leading-none",
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

const props = withDefaults(
  defineProps<{
    tag?: keyof HTMLElementTagNameMap | string;
    variant?: Variant;
    tone?: Tone;
    weight?: Weight;
    align?: Align;
    wrap?: Wrap;
    leading?: Leading;
  }>(),
  {
    tag: "p",
    variant: "body",
    tone: "default",
    weight: "normal",
    align: "left",
    wrap: "normal",
    leading: "normal",
  }
);

const classes = computed(() =>
  [
    "c-text",
    variantClasses[props.variant],
    toneClasses[props.tone],
    weightClasses[props.weight],
    alignClasses[props.align],
    wrapClasses[props.wrap],
    leadingClasses[props.leading],
  ].filter(Boolean)
);
</script>

<style scoped>
.c-text {
  font-family: inherit;
}
</style>
