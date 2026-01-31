<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
        Commander
      </span>
      <span v-if="hasSelection" class="text-sm text-[color:var(--muted)]">
        Selected:
      </span>
      <div v-if="hasSelection" class="flex flex-wrap items-center gap-2 text-sm">
        <span class="font-semibold text-[color:var(--text)]">
          {{ summaryName }}
        </span>
        <span class="text-xs font-mono text-[color:var(--muted)]">
          {{ summaryManaCost }}
        </span>
      </div>
      <span v-else class="text-sm text-[color:var(--muted)]">
        Search for a commander to start.
      </span>
    </div>
    <div class="flex items-center gap-2">
      <button
        v-if="hasSelection"
        type="button"
        class="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
        aria-label="Clear commander selection"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  hasSelection: boolean;
  summaryName: string;
  summaryManaCost: string;
}>();

const emit = defineEmits<{
  reset: [];
}>();

const { hasSelection, summaryName, summaryManaCost } = toRefs(props);
</script>
