<template>
  <Teleport to="body">
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
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  scope?: string;
  placementClass?: string;
}>();

const attrs = useAttrs();
const { isLoading, loadingMessage, getScopeLoading } = useGlobalLoading();

const scopedLoading = props.scope ? getScopeLoading(props.scope) : null;

const isVisible = computed(() =>
  scopedLoading ? scopedLoading.value : isLoading.value
);

const messageToDisplay = computed(() => loadingMessage.value);

const containerClass = computed(
  () =>
    props.placementClass ??
    "pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4"
);
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
