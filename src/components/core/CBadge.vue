<template>
  <component :is="as" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  badgeBase,
  badgeSizeClasses,
  badgeToneClasses,
  badgeVariantClasses,
  cx,
  type BadgeSize,
  type BadgeTone,
  type BadgeVariant,
} from "./config";

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: BadgeVariant;
    tone?: BadgeTone;
    size?: BadgeSize;
  }>(),
  {
    as: "span",
    variant: "soft",
    tone: "default",
    size: "md",
  }
);

const classes = computed(() =>
  cx(
    "c-badge",
    badgeBase,
    badgeSizeClasses[props.size],
    badgeVariantClasses[props.variant],
    badgeToneClasses[props.tone][props.variant]
  )
);
</script>

