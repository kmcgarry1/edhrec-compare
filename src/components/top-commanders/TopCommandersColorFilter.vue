<template>
  <CInline gap="md" class="text-xs flex-wrap">
    <CBadge tone="default" variant="outline">
      Color filter
    </CBadge>

    <CSurface
      size="none"
      radius="pill"
      variant="content"
      class="inline-flex px-3 py-2"
      role="group"
      aria-label="Filter by color identity"
    >
      <CInline gap="sm">
        <CButton
          v-for="color in colorOptions"
          :key="color"
          type="button"
          size="sm"
          :variant="selectedColors.includes(color) ? 'soft' : 'ghost'"
          :class="selectedColors.includes(color) ? colorPillClass(color) : 'border border-[color:var(--border)] text-[color:var(--muted)]'"
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
          />
          <span class="sr-only">{{ colorLabel(color) }}</span>
        </CButton>

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
