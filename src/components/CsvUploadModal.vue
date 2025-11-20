<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm text-center"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('close')"
    >
      <div class="max-w-2xl w-full">
        <Card
          padding="p-4 sm:p-6"
          background="bg-white dark:bg-slate-900"
          shadow="shadow-2xl shadow-slate-900/40 dark:shadow-black/60"
          class="text-center"
        >
          <div class="flex flex-col items-center gap-3">
            <p class="text-xs uppercase tracking-[0.3em] text-emerald-500/80">Upload Collection</p>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">Import your CSV</h2>
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Drag and drop or browse files. We keep data in-memory only.
            </p>
          </div>
          <div class="mt-6 flex justify-center">
            <CSVUpload />
          </div>
          <div class="mt-6 flex justify-center">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
              @click="$emit('close')"
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
import { Card, CSVUpload } from ".";

defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();
</script>
