<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="modalContainer"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 text-center"
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
          padding="p-0"
          background="bg-[color:var(--surface)]"
          shadow="shadow-[var(--shadow)]"
          class="flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden text-center text-[color:var(--text)]"
        >
          <header class="flex items-start justify-between gap-4 border-b border-[color:var(--border)] px-4 py-4 text-left sm:px-6">
            <div>
              <h2 id="csv-upload-title" class="text-xl font-semibold text-[color:var(--text)]">Import collection</h2>
              <p id="csv-upload-description" class="mt-1 text-sm text-[color:var(--muted)]">
                Collection data stays in this browser session and clears on refresh.
              </p>
            </div>
            <button
              type="button"
              class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-1.5 text-sm font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              aria-label="Close upload dialog"
              @click="handleClose"
            >
              Close
            </button>
          </header>
          <div class="overflow-y-auto px-4 py-5 sm:px-6">
            <CSVUpload @done="handleClose" />
          </div>
        </Card>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useFocusTrap } from "../composables/useFocusTrap";
import Card from "./Card.vue";
import CSVUpload from "./CSVUpload.vue";

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
