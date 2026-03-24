<template>
  <CInline align="end" justify="between" gap="md" class="flex-wrap">
    <CStack gap="xs">
      <CText tag="p" variant="eyebrow" tone="muted">
        Results
      </CText>
      <CText tag="h2" variant="title" class="text-lg sm:text-xl">
        Cardlists
      </CText>
    </CStack>
    <CInline gap="sm" class="flex-wrap text-xs font-semibold">
      <CBadge tone="default" variant="soft" size="sm" text-case="normal">
        {{ listCount }} lists
      </CBadge>
      <CBadge tone="default" variant="soft" size="sm" text-case="normal">
        {{ cardCount }} cards
      </CBadge>
    </CInline>
  </CInline>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { CBadge, CInline, CStack, CText } from "../core";

const props = defineProps<{
  listCount: number;
  cardCount: number;
}>();

const { listCount, cardCount } = toRefs(props);
</script>
