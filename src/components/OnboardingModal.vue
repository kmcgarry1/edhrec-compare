<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="modalContainer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      tabindex="-1"
      @escape-pressed="handleDismiss"
    >
      <Card
        padding="p-5 sm:p-8"
        background="bg-[color:var(--surface)]"
        shadow="shadow-[var(--shadow)]"
        class="surface-sheen w-full max-w-2xl space-y-5 text-center text-[color:var(--text)]"
      >
        <p class="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">First-time setup</p>
        <h2 id="onboarding-title" class="text-2xl font-semibold text-[color:var(--text)]">
          Upload your collection or scout first
        </h2>
        <p id="onboarding-description" class="text-sm text-[color:var(--muted)]">
          Bring in a CSV of your collection to highlight owned cards, or start searching commanders
          first and upload later.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105"
            aria-label="Upload CSV collection file"
            @click="handleUpload"
          >
            Upload a CSV
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            aria-label="Start searching commanders without uploading"
            @click="handleDismiss"
          >
            Start searching first
          </button>
        </div>
        <p class="text-xs text-[color:var(--muted)]">
          You can upload later from the Inventory panel.
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
  },
  { immediate: true }
);
</script>
