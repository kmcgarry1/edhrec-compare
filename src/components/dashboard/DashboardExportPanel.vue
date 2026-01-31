<template>
  <div class="space-y-1">
    <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
      Export
    </p>
    <h2 class="text-lg font-semibold text-[color:var(--text)]">
      Export your decklist
    </h2>
    <p class="text-sm text-[color:var(--muted)]">
      {{ helperText }}
    </p>
  </div>
  <Card id="export-step" padding="p-4 sm:p-5" class="space-y-3">
    <DecklistExport
      :disabled="!decklistText"
      :copied="copied"
      @copy="emit('copy')"
      @download="emit('download')"
    />
  </Card>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import Card from "../Card.vue";

const DecklistExport = defineAsyncComponent(() => import("../DecklistExport.vue"));

defineProps<{
  helperText: string;
  decklistText?: string | null;
  copied: boolean;
}>();

const emit = defineEmits<{
  copy: [];
  download: [];
}>();
</script>
