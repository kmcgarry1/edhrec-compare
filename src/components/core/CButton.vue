<template>
  <component
    :is="as"
    v-bind="rootProps"
    :class="computedClasses"
    class="relative overflow-hidden"
    @click="handleClick"
  >
    <span class="relative z-10">
      <slot />
    </span>
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
      }"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, type Component } from "vue";
import {
  createRipple,
  getRippleCoordinates,
  prefersReducedMotion,
} from "../../utils/animations";
import {
  buttonBase,
  buttonSizeClasses,
  buttonToneClasses,
  buttonVariantClasses,
  cx,
} from "./config";

type Variant = keyof typeof buttonVariantClasses;
type Size = keyof typeof buttonSizeClasses;
type Tone = keyof typeof buttonToneClasses;

const props = withDefaults(
  defineProps<{
    as?: string | Component;
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    size?: Size;
    tone?: Tone;
    disabled?: boolean;
    rippleEffect?: boolean;
  }>(),
  {
    as: "button",
    type: "button",
    variant: "primary",
    size: "md",
    tone: "default",
    disabled: false,
    rippleEffect: true,
  }
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const ripples = ref<Array<{ id: number; x: number; y: number }>>([]);
const attrs = useAttrs();

const isNativeButton = computed(() => props.as === "button");

const rootProps = computed(() => ({
  ...attrs,
  type: isNativeButton.value ? props.type : undefined,
  disabled: isNativeButton.value ? props.disabled : undefined,
  "aria-disabled": !isNativeButton.value && props.disabled ? "true" : undefined,
  tabindex: !isNativeButton.value && props.disabled ? -1 : undefined,
}));

const computedClasses = computed(() =>
  cx(
    "c-button",
    buttonBase,
    buttonSizeClasses[props.size],
    buttonVariantClasses[props.variant],
    buttonToneClasses[props.tone]
  )
);

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (props.rippleEffect && !prefersReducedMotion()) {
    const { x, y } = getRippleCoordinates(event);
    const ripple = createRipple(x, y);
    ripples.value.push(ripple);

    setTimeout(() => {
      ripples.value = ripples.value.filter((r) => r.id !== ripple.id);
    }, 600);
  }

  emit("click", event);
};
</script>
