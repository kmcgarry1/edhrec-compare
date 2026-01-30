<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="space-y-1">
      <p
        class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
      >
        {{ topHeader }}
      </p>
      <h2 class="text-lg font-semibold text-[color:var(--text)]">
        Top {{ topLimit }} commanders
      </h2>
      <p class="text-sm text-[color:var(--muted)]">
        Percentages use EDHREC average decks without extra filters.
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <div
        class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
        role="group"
        aria-label="Choose top commanders range"
      >
        <button
          v-for="option in limitOptions"
          :key="option"
          type="button"
          class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :class="
            topLimit === option
              ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
          "
          :aria-pressed="topLimit === option"
          @click="emit('limit-change', option)"
        >
          Top {{ option }}
        </button>
      </div>
      <div
        class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
        role="group"
        aria-label="Sort commanders"
      >
        <button
          v-for="option in sortOptions"
          :key="option.value"
          type="button"
          class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :class="
            sortMode === option.value
              ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
          "
          :aria-pressed="sortMode === option.value"
          @click="emit('sort-change', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="topLoading"
        @click="emit('refresh')"
      >
        Refresh list
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  TopCommandersLimitOption,
  TopCommandersSortMode,
  TopCommandersSortOption,
} from "../../composables/useTopCommandersData";

defineProps<{
  topHeader: string;
  topLimit: TopCommandersLimitOption;
  sortMode: TopCommandersSortMode;
  limitOptions: ReadonlyArray<TopCommandersLimitOption>;
  sortOptions: ReadonlyArray<TopCommandersSortOption>;
  topLoading: boolean;
}>();

const emit = defineEmits<{
  "limit-change": [value: TopCommandersLimitOption];
  "sort-change": [value: TopCommandersSortMode];
  refresh: [];
}>();
</script>
