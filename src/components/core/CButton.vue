<template>
  <button
    :type="type"
    :class="computedClasses"
    :disabled="disabled"
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
  </button>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  createRipple,
  getRippleCoordinates,
  prefersReducedMotion,
} from "../../utils/animations";

type Variant = "primary" | "secondary" | "ghost";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    variant?: Variant;
    disabled?: boolean;
    rippleEffect?: boolean;
  }>(),
  {
    type: "button",
    variant: "primary",
    disabled: false,
    rippleEffect: true,
  }
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const ripples = ref<Array<{ id: number; x: number; y: number }>>([]);

const computedClasses = (() => {
  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "border border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)] hover:border-[color:var(--accent-strong)]",
    secondary:
      "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
    ghost:
      "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--surface-muted)]",
  };

  return `${baseClasses} ${variants[props.variant]}`;
})();

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
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
