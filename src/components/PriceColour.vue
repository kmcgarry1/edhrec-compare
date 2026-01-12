<template>
  <component :is="tag" :class="[componentClass, colorClass]" v-bind="$attrs">
    {{ displayValue }}
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  const tone = (() => {
    if (value === null) {
      return "muted";
    }
    if (value <= 1) {
      return "low";
    }
    if (value <= 5) {
      return "mid";
    }
    if (value <= 20) {
      return "high";
    }
    return "premium";
  })();

  const pillClasses: Record<string, string> = {
    muted:
      "bg-[color:var(--surface-muted)] text-[color:var(--muted)] border border-[color:var(--border)]",
    low:
      "bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] border border-[color:var(--accent)]",
    mid:
      "bg-[color:var(--surface-muted)] text-[color:var(--text)] border border-[color:var(--border)]",
    high:
      "bg-[color:var(--warn-soft)] text-[color:var(--warn)] border border-[color:var(--warn)]",
    premium:
      "bg-[color:var(--danger-soft)] text-[color:var(--danger)] border border-[color:var(--danger)]",
  };

  const textClasses: Record<string, string> = {
    muted: "text-[color:var(--muted)]",
    low: "text-[color:var(--accent-strong)]",
    mid: "text-[color:var(--text)]",
    high: "text-[color:var(--warn)]",
    premium: "text-[color:var(--danger)]",
  };

  return props.pill ? pillClasses[tone] : textClasses[tone];
});
</script>
