<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <CStack gap="xs" class="min-w-0">
      <CText tag="p" variant="eyebrow" tone="muted"> Results </CText>
      <div class="flex flex-wrap items-center gap-2">
        <CText tag="h2" variant="title" class="text-lg sm:text-xl"> Cardlists </CText>
        <CBadge tone="default" variant="soft" size="sm" text-case="normal">
          {{ listCount }} active of {{ totalSectionCount }}
        </CBadge>
        <CBadge tone="default" variant="soft" size="sm" text-case="normal">
          {{ cardCount }} cards
        </CBadge>
        <CBadge tone="accent" variant="soft" size="sm" text-case="normal">
          {{ deckViewLabel }}
        </CBadge>
      </div>
      <CText tag="p" variant="helper" tone="muted">
        {{ ownershipSummary }}
      </CText>
    </CStack>

    <div class="flex flex-wrap items-center gap-2 lg:justify-end">
      <CButton type="button" variant="secondary" size="sm" @click="emit('toggle-expand-all')">
        {{ allExpanded ? "Collapse all" : "Expand all" }}
      </CButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CBadge, CButton, CStack, CText } from "../core";

defineProps<{
  listCount: number;
  totalSectionCount: number;
  cardCount: number;
  deckViewLabel: string;
  ownershipSummary: string;
  allExpanded: boolean;
}>();

const emit = defineEmits<{
  "toggle-expand-all": [];
}>();
</script>
