<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="modalContainer"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8 text-center backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-upload-title"
      aria-describedby="csv-upload-description"
      tabindex="-1"
      @click.self="handleClose"
      @escape-pressed="handleClose"
    >
      <div class="max-w-2xl w-full">
        <Card
          padding="p-4 sm:p-6"
          background="bg-[color:var(--surface)]"
          shadow="shadow-[var(--shadow)]"
          class="max-h-[90vh] overflow-y-auto text-center text-[color:var(--text)]"
        >
          <div class="flex flex-col items-center gap-3">
            <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Upload Collection</p>
            <h2 id="csv-upload-title" class="text-2xl font-semibold text-[color:var(--text)]">Import your CSV</h2>
            <p id="csv-upload-description" class="text-sm text-[color:var(--muted)]">
              Drag and drop or browse files. We keep data in-memory only.
            </p>
          </div>
          <div class="mt-6 flex justify-center">
            <CSVUpload />
          </div>
          <div class="mt-6 flex justify-center">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-4 py-1.5 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              aria-label="Close upload dialog"
              @click="handleClose"
            >
              Close
            </button>
          </div>
        </Card>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card, CSVUpload } from ".";
import { useFocusTrap } from "../composables/useFocusTrap";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const modalContainer = ref<HTMLElement | null>(null);
const isActive = ref(false);
const { activate, deactivate } = useFocusTrap(modalContainer, isActive);

const handleClose = () => {
  emit("close");
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
