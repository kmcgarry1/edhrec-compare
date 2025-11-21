<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="modalContainer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      @escape-pressed="handleDismiss"
    >
      <Card
        padding="p-5 sm:p-8"
        background="bg-white dark:bg-slate-900"
        shadow="shadow-2xl shadow-slate-900/50 dark:shadow-black/60"
        class="w-full max-w-2xl space-y-5 text-center"
      >
        <p class="text-xs uppercase tracking-[0.4em] text-emerald-500/80">First-time setup</p>
        <h2 id="onboarding-title" class="text-2xl font-semibold text-slate-900 dark:text-white">
          Upload your collection or scout first
        </h2>
        <p id="onboarding-description" class="text-sm text-slate-600 dark:text-slate-300">
          Bring in a CSV of your collection to highlight owned cards, or start searching commanders
          first and upload later.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/10 dark:border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-100"
            aria-label="Upload CSV collection file"
            @click="handleUpload"
          >
            Upload a CSV
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
            aria-label="Skip upload and start searching commanders"
            @click="handleDismiss"
          >
            Start searching first
          </button>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          You can upload later using the Toolkit in the corner.
        </p>
      </Card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card } from ".";
import { useFocusTrap } from "../composables/useFocusTrap";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  upload: [];
  dismiss: [];
}>();

const modalContainer = ref<HTMLElement | null>(null);
const isActive = ref(false);
const { activate, deactivate } = useFocusTrap(modalContainer, isActive);

const handleUpload = () => {
  emit("upload");
};

const handleDismiss = () => {
  emit("dismiss");
};

watch(
  () => props.open,
  (newValue) => {
    isActive.value = newValue;
    if (newValue) {
      activate();
    } else {
      deactivate();
    }
  }
);
</script>
