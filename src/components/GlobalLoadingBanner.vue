<template>
  <div
    v-if="isVisible"
    class="rounded-2xl border border-emerald-400/40 bg-emerald-100/70 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm shadow-emerald-200/60 dark:border-emerald-400/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:shadow-black/30"
    role="status"
    aria-live="polite"
  >
    <slot :message="messageToDisplay">{{ messageToDisplay }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";

const props = defineProps<{
  scope?: string;
}>();

const { isLoading, loadingMessage, getScopeLoading } = useGlobalLoading();

const scopedLoading = props.scope ? getScopeLoading(props.scope) : null;

const isVisible = computed(() =>
  scopedLoading ? scopedLoading.value : isLoading.value
);

const messageToDisplay = computed(() => loadingMessage.value);
</script>
