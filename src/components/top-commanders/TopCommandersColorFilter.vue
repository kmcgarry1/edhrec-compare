<template>
  <CInline v-if="colorOptions.length" align="center" gap="sm" class="text-xs flex-wrap">
    <CBadge tone="default" variant="outline" class="shrink-0">
      Color filter
    </CBadge>

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
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :class="colorDotClass(color)"
            aria-hidden="true"
          />
          <span aria-hidden="true">{{ color }}</span>
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
  colorDotClass: (color: CommanderColor) => string;
  colorPillClass: (color: CommanderColor) => string;
  colorLabel: (color: CommanderColor) => string;
}>();

const emit = defineEmits<{
  "toggle-color": [color: CommanderColor];
  clear: [];
}>();
</script>
