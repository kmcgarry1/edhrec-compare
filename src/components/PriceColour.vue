<template>
  <component :is="tag" :class="[componentClass, colorClass]" v-bind="$attrs">
    {{ displayValue }}
  </component>
</template>

<script setup lang="ts">
import { computed, withDefaults } from "vue";

const props = withDefaults(
  defineProps<{
    price?: string | number | null;
    currency?: string;
    placeholder?: string;
    tag?: keyof HTMLElementTagNameMap | string;
    pill?: boolean;
    align?: "start" | "center" | "end";
  }>(),
  {
    currency: "$",
    placeholder: "—",
    tag: "div",
    pill: true,
    align: "end",
  }
);

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const numericPrice = computed(() => toNumber(props.price));

const displayValue = computed(() => {
  if (numericPrice.value === null) {
    return props.placeholder;
  }
  return `${props.currency}${numericPrice.value.toFixed(2)}`;
});

const componentClass = computed(() => {
  const alignment =
    props.align === "start"
      ? "justify-start"
      : props.align === "center"
      ? "justify-center"
      : "justify-end";

  if (props.pill) {
    return `inline-flex min-w-[74px] items-center ${alignment} rounded-lg px-3 py-1 font-mono tabular-nums text-sm whitespace-nowrap`;
  }
  return "font-mono tabular-nums text-sm whitespace-nowrap";
});

const colorClass = computed(() => {
  const value = numericPrice.value;
  if (value === null) {
    return "bg-slate-100/60 text-slate-600 dark:bg-slate-800/40 dark:text-slate-200";
  }
  if (value <= 0.5) {
    return "bg-cyan-100/70 text-cyan-900 dark:bg-cyan-600/30 dark:text-cyan-100";
  }
  if (value <= 1) {
    return "bg-emerald-100/70 text-emerald-900 dark:bg-emerald-600/30 dark:text-emerald-100";
  }
  if (value <= 2.5) {
    return "bg-lime-100/70 text-lime-900 dark:bg-lime-600/30 dark:text-lime-100";
  }
  if (value <= 5) {
    return "bg-yellow-100/70 text-yellow-900 dark:bg-yellow-600/30 dark:text-yellow-100";
  }
  if (value <= 10) {
    return "bg-amber-100/70 text-amber-900 dark:bg-amber-600/30 dark:text-amber-100";
  }
  if (value <= 20) {
    return "bg-orange-100/70 text-orange-900 dark:bg-orange-600/30 dark:text-orange-100";
  }
  if (value <= 50) {
    return "bg-red-100/70 text-red-900 dark:bg-red-600/30 dark:text-red-100";
  }
  return "bg-rose-200/70 text-rose-900 dark:bg-rose-600/40 dark:text-rose-100";
});
</script>
