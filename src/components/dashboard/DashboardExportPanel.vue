<template>
  <Card id="export-step" variant="utility" padding="p-4 sm:p-5" class="space-y-4">
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
        Export
      </p>
      <h2 class="text-lg font-semibold text-[color:var(--text)]">
        Decklist output
      </h2>
      <p class="text-sm text-[color:var(--muted)]">
        {{ helperText }}
      </p>
    </div>
    <CNotice
      :tone="decklistText ? 'success' : 'info'"
      :title="decklistText ? 'Decklist ready' : 'Waiting for decklist'"
      :message="decklistText ? 'Copy or download the current filter directly into your deck builder.' : 'Select a commander and apply a filter to generate exportable text.'"
      :class="decklistText ? '' : 'border-dashed bg-[color:var(--surface-muted)]'"
    />
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
import { CNotice } from "../core";

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
