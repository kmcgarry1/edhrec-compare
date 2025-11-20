<template>
  <div class="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold">
    <span class="text-slate-500 dark:text-slate-300">Export:</span>
    <button
      type="button"
      class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
      :disabled="disabled"
      @click="$emit('copy')"
    >
      <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path :d="mdiContentCopy" />
      </svg>
      <span>{{ copied ? "Copied!" : "Copy Decklist" }}</span>
    </button>
    <button
      type="button"
      class="rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
      :disabled="disabled"
      @click="$emit('download')"
    >
      <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path :d="mdiDownloadOutline" />
      </svg>
      <span>Download decklist.txt</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { mdiContentCopy, mdiDownloadOutline } from "@mdi/js";

defineProps<{
  disabled: boolean;
  copied: boolean;
}>();

defineEmits<{
  copy: [];
  download: [];
}>();
</script>
