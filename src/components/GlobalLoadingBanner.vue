<template>
  <Teleport v-if="!isInline" :to="stackTargetSelector">
    <Transition name="fade">
      <div
        v-if="isVisible"
        :class="containerClass"
        aria-live="polite"
        role="status"
      >
        <div
          v-bind="attrs"
          class="pointer-events-auto rounded-2xl border border-emerald-400/40 bg-emerald-100/70 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm shadow-emerald-200/60 dark:border-emerald-400/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:shadow-black/30"
        >
          <slot :message="messageToDisplay">{{ messageToDisplay }}</slot>
        </div>
      </div>
    </Transition>
  </Teleport>

  <div
    v-else
    :class="containerClass"
    aria-live="polite"
    role="status"
  >
    <div
      v-bind="attrs"
      :aria-hidden="isVisible ? 'false' : 'true'"
      class="pointer-events-auto rounded-2xl border border-emerald-400/40 bg-emerald-100/70 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm shadow-emerald-200/60 transition duration-200 ease-out dark:border-emerald-400/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:shadow-black/30"
      :class="
        isVisible
          ? 'opacity-100 translate-y-0 visible'
          : 'pointer-events-none opacity-0 -translate-y-1 invisible'
      "
    >
      <slot :message="messageToDisplay">{{ messageToDisplay }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, watch } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    scope?: string;
    placementClass?: string;
    inline?: boolean;
  }>(),
  {
    inline: false,
  }
);

const STACK_TARGET_ID = "global-loading-stack";
const STACK_CLASS =
  "pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-3 px-4";

const ensureStackContainer = () => {
  if (typeof document === "undefined") {
    return;
  }
  let existing = document.getElementById(STACK_TARGET_ID);
  if (!existing) {
    existing = document.createElement("div");
    existing.id = STACK_TARGET_ID;
    document.body.appendChild(existing);
  }
  existing.className = STACK_CLASS;
};

const shouldUseStack = computed(() => !props.inline);

if (shouldUseStack.value) {
  ensureStackContainer();
}

onMounted(() => {
  if (shouldUseStack.value) {
    ensureStackContainer();
  }
});

watch(shouldUseStack, (useStack) => {
  if (useStack) {
    ensureStackContainer();
  }
});

const stackTargetSelector = `#${STACK_TARGET_ID}`;

const attrs = useAttrs();
const { isLoading, loadingMessage, getScopeLoading, getScopeMessage } =
  useGlobalLoading();

const scopeName = props.scope ?? "global";
const scopedLoading = props.scope ? getScopeLoading(scopeName) : null;
const scopedMessage = props.scope ? getScopeMessage(scopeName) : null;

const isVisible = computed(() =>
  scopedLoading ? scopedLoading.value : isLoading.value
);

const isInline = computed(() => props.inline);

const messageToDisplay = computed(() =>
  scopedMessage ? scopedMessage.value : loadingMessage.value
);

const stackDefaultClass =
  "pointer-events-none flex w-full max-w-md justify-center";
const inlineDefaultClass = "w-full flex justify-center";

const containerClass = computed(() => {
  if (props.placementClass) {
    return props.placementClass;
  }
  return props.inline ? inlineDefaultClass : stackDefaultClass;
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
