<template>
  <div class="space-y-1">
    <p class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
      Search
    </p>
    <h2 class="text-lg font-semibold text-[color:var(--text)]">
      Search commanders and browse cardlists
    </h2>
    <p class="text-sm text-[color:var(--muted)]">
      Use EDHREC filters to load cardlists and card previews.
    </p>
  </div>
  <EdhrecReader
    @decklistUpdate="emit('decklistUpdate', $event)"
    @selection-change="emit('selection-change', $event)"
  />
</template>

<script setup lang="ts">
import EdhrecReader from "../EdhrecReader.vue";
import type { CommanderSelection, DecklistPayload } from "../../types/edhrec";

const emit = defineEmits<{
  decklistUpdate: [payload: DecklistPayload];
  "selection-change": [payload: CommanderSelection];
}>();
</script>
