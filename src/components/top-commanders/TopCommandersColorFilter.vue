<template>
  <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
    <span class="font-semibold uppercase tracking-[0.24em]">Color filter</span>
    <div
      class="inline-flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 shadow-[var(--shadow-soft)]"
      role="group"
      aria-label="Filter by color identity"
    >
      <button
        v-for="color in colorOptions"
        :key="color"
        type="button"
        class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        :class="
          selectedColors.includes(color)
            ? colorPillClass(color)
            : 'border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--text)]'
        "
        :aria-pressed="selectedColors.includes(color)"
        @click="emit('toggle-color', color)"
      >
        <img
          v-if="manaSymbol(color)"
          :src="manaSymbol(color)"
          :alt="colorLabel(color)"
          class="h-4 w-4"
        />
        <span
          v-else
          class="h-2.5 w-2.5 rounded-full"
          :class="colorDotClass(color)"
          aria-hidden="true"
        ></span>
        <span class="sr-only">{{ colorLabel(color) }}</span>
      </button>
      <button
        v-if="selectedColors.length"
        type="button"
        class="rounded-full border border-[color:var(--border)] px-3 py-1 text-[0.7rem] font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CommanderColor } from "../../utils/colorIdentity";

defineProps<{
  colorOptions: CommanderColor[];
  selectedColors: CommanderColor[];
  manaSymbol: (color: CommanderColor) => string | undefined;
  colorDotClass: (color: CommanderColor) => string;
  colorPillClass: (color: CommanderColor) => string;
  colorLabel: (color: CommanderColor) => string;
}>();

const emit = defineEmits<{
  "toggle-color": [color: CommanderColor];
  clear: [];
}>();
</script>
