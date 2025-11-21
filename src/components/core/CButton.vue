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
import { createRipple, getRippleCoordinates } from "../../utils/animations";

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
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "border border-emerald-400/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-500/10 dark:border-emerald-300/70 dark:bg-emerald-900/40 dark:text-emerald-200",
    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200",
    ghost:
      "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800",
  };

  return `${baseClasses} ${variants[props.variant]}`;
})();

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    return;
  }

  if (props.rippleEffect) {
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
