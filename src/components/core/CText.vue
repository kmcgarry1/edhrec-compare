<template>
  <component :is="tag" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  default: "text-[color:var(--text)]",
  muted: "text-[color:var(--muted)]",
  subtle: "text-[color:var(--muted)] opacity-70",
  inverse: "text-white",
  danger: "text-[color:var(--danger)]",
  success: "text-[color:var(--accent)]",
  warn: "text-[color:var(--warn)]",
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
