<template>
  <div class="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold">
    <span class="text-[color:var(--muted)]">Export:</span>
    <button
      type="button"
      class="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      data-testid="header-copy-decklist"
      @click="$emit('copy')"
    >
      <svg :viewBox="'0 0 24 24'" class="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path :d="mdiContentCopy" />
      </svg>
      <span>{{ copied ? "Copied!" : "Copy Decklist" }}</span>
    </button>
    <button
      type="button"
      class="rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-3 py-1.5 text-[color:var(--accent-contrast)] transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="disabled"
      data-testid="header-download-decklist"
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
