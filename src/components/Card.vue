<template>
  <component :is="as" :class="computedClasses">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    as?: string;
    padding?: string | null;
    rounded?: string | null;
    shadow?: string | null;
    border?: string | null;
    background?: string | null;
  }>(),
  {
    as: "div",
    padding: "p-6",
    rounded: "rounded-3xl",
    shadow: "shadow-xl shadow-slate-900/5 dark:shadow-black/40",
    border: "border border-slate-200 dark:border-slate-700/70",
    background: "bg-white/90 dark:bg-slate-900/70",
  }
);

const computedClasses = computed(() =>
  [
    props.rounded,
    props.border,
    props.background,
    props.shadow,
    props.padding,
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
