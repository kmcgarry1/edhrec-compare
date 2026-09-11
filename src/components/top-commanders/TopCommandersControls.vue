<template>
  <CInline align="center" justify="between" gap="md" class="flex-col xl:flex-row">
    <CStack gap="xs" class="min-w-0">
      <CText tag="p" variant="label" tone="muted">
        {{ topHeader }}
      </CText>
      <CText tag="h2" variant="body" weight="semibold">
        Top {{ topLimit }} commanders
      </CText>
      <CText tag="p" variant="helper" tone="muted">
        Percentages use EDHREC average decks without extra filters.
      </CText>
    </CStack>

    <CInline gap="sm" class="flex-wrap">
      <CSurface
        :full-width="false"
        size="none"
        radius="lg"
        variant="content"
        class="inline-flex p-1"
        role="group"
        aria-label="Choose top commanders range"
      >
        <CInline gap="2xs">
          <CButton
            v-for="option in limitOptions"
            :key="option"
            type="button"
            size="sm"
            :variant="topLimit === option ? 'soft' : 'ghost'"
            :class="topLimit === option ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]' : ''"
            :aria-pressed="topLimit === option"
            @click="emit('limit-change', option)"
          >
            Top {{ option }}
          </CButton>
        </CInline>
      </CSurface>

      <CSurface
        :full-width="false"
        size="none"
        radius="lg"
        variant="content"
        class="inline-flex p-1"
        role="group"
        aria-label="Sort commanders"
      >
        <CInline gap="2xs">
          <CButton
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            size="sm"
            :variant="sortMode === option.value ? 'soft' : 'ghost'"
            :class="sortMode === option.value ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]' : ''"
            :aria-pressed="sortMode === option.value"
            :disabled="option.value === 'owned' && !canSortOwned"
            @click="emit('sort-change', option.value)"
          >
            {{ option.label }}
          </CButton>
        </CInline>
      </CSurface>

      <CButton
        type="button"
        variant="secondary"
        :disabled="topLoading"
        @click="emit('refresh')"
      >
        Refresh list
      </CButton>
    </CInline>
  </CInline>
</template>

<script setup lang="ts">
import { CButton, CInline, CStack, CSurface, CText } from "../core";
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
  canSortOwned: boolean;
}>();

const emit = defineEmits<{
  "limit-change": [value: TopCommandersLimitOption];
  "sort-change": [value: TopCommandersSortMode];
  refresh: [];
}>();
</script>
