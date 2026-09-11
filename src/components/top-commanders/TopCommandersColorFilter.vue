<template>
  <CInline v-if="colorOptions.length" align="center" gap="sm" class="text-xs flex-wrap">
    <CBadge tone="default" variant="outline" class="shrink-0"> Color filter </CBadge>

    <CSurface
      :full-width="false"
      size="none"
      radius="lg"
      variant="content"
      class="inline-flex p-1"
      role="group"
      aria-label="Filter by color identity"
    >
      <CInline gap="2xs" class="flex-wrap">
        <button
          v-for="color in colorOptions"
          :key="color"
          type="button"
          :class="[
            'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold leading-none transition',
            selectedColors.includes(color)
              ? colorPillClass(color)
              : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--border-strong)]',
          ]"
          :aria-pressed="selectedColors.includes(color)"
          :aria-label="colorLabel(color)"
          :title="colorLabel(color)"
          @click="emit('toggle-color', color)"
        >
          <span
            class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/20 text-[0.72rem] font-bold text-black/75"
            :class="colorDotClass(color)"
            aria-hidden="true"
          >
            {{ color }}
          </span>
        </button>

        <CButton
          v-if="selectedColors.length"
          type="button"
          variant="ghost"
          size="sm"
          @click="emit('clear')"
        >
          Clear
        </CButton>
      </CInline>
    </CSurface>
  </CInline>
</template>

<script setup lang="ts">
import { CBadge, CButton, CInline, CSurface } from "../core";
import type { CommanderColor } from "../../utils/colorIdentity";

defineProps<{
  colorOptions: CommanderColor[];
  selectedColors: CommanderColor[];
  colorDotClass: (color: CommanderColor) => string;
  colorPillClass: (color: CommanderColor) => string;
  colorLabel: (color: CommanderColor) => string;
}>();

const emit = defineEmits<{
  "toggle-color": [color: CommanderColor];
  clear: [];
}>();
</script>
