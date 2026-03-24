<template>
  <component :is="as" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLayoutDensity } from "../../composables/useLayoutDensity";
import {
  cx,
  surfaceBase,
  surfacePaddingClasses,
  surfaceRadiusClasses,
  surfaceShadowClasses,
  surfaceToneClasses,
  surfaceVariantClasses,
  type SurfaceRadius,
  type SurfaceShadow,
  type SurfaceSize,
  type SurfaceTone,
  type SurfaceVariant,
} from "./config";

const props = withDefaults(
  defineProps<{
    as?: string;
    variant?: SurfaceVariant;
    tone?: SurfaceTone;
    size?: SurfaceSize;
    radius?: SurfaceRadius;
    shadow?: SurfaceShadow;
    fullWidth?: boolean;
    sheen?: boolean;
    paddingClass?: string | null;
    rounded?: string | null;
    border?: string | null;
    background?: string | null;
    shadowClass?: string | null;
  }>(),
  {
    as: "div",
    variant: "panel",
    tone: "default",
    size: "adaptive",
    radius: "xl",
    shadow: "soft",
    fullWidth: true,
    sheen: false,
    paddingClass: null,
    rounded: null,
    border: null,
    background: null,
    shadowClass: null,
  }
);

const { spacing } = useLayoutDensity();

const resolvedPadding = computed(() => {
  if (props.paddingClass !== null) {
    return props.paddingClass;
  }
  if (props.size === "adaptive") {
    return spacing.value.cardPadding;
  }
  return surfacePaddingClasses[props.size];
});

const classes = computed(() =>
  cx(
    surfaceBase,
    props.fullWidth ? "block w-full" : "",
    surfaceVariantClasses[props.variant],
    surfaceToneClasses[props.tone],
    props.rounded ?? surfaceRadiusClasses[props.radius],
    props.shadowClass ?? surfaceShadowClasses[props.shadow],
    resolvedPadding.value,
    props.sheen ? "surface-sheen" : "",
    props.border,
    props.background
  )
);
</script>
