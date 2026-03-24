<template>
  <Teleport to="body">
    <div
      v-if="open"
      ref="modalContainer"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      tabindex="-1"
      @escape-pressed="handleDismiss"
    >
      <Card
        variant="masthead"
        padding="p-5 sm:p-8"
        shadow="shadow-[var(--shadow)]"
        class="w-full max-w-3xl overflow-hidden text-center text-[color:var(--text)]"
      >
        <div class="relative space-y-6">
          <div class="space-y-3">
            <p class="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">First-time setup</p>
            <h2 id="onboarding-title" class="text-2xl font-semibold text-[color:var(--text)] sm:text-3xl">
              Upload your collection or scout first
            </h2>
            <p id="onboarding-description" class="mx-auto max-w-2xl text-sm text-[color:var(--muted)] sm:text-base">
              Bring in a CSV to light up owned-card overlap immediately, or start with commander search
              and return to the collection rail once you know what you want to build.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-4 text-left shadow-[var(--shadow-soft)]">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                Best for matching owned cards
              </p>
              <p class="mt-2 text-base font-semibold text-[color:var(--text)]">Upload a CSV</p>
              <p class="mt-2 text-sm text-[color:var(--muted)]">
                Use your collection to filter owned and unowned cards across every EDHREC list.
              </p>
            </div>
            <div class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-4 text-left shadow-[var(--shadow-soft)]">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                Best for exploration
              </p>
              <p class="mt-2 text-base font-semibold text-[color:var(--text)]">Start searching first</p>
              <p class="mt-2 text-sm text-[color:var(--muted)]">
                Browse commanders, inspect cardlists, and upload later once a deck direction is clear.
              </p>
            </div>
          </div>

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
        </div>
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
