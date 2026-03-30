<template>
  <footer class="dashboard-control-panel-footer space-y-3">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <CText tag="p" variant="eyebrow" tone="muted">Export</CText>
        <CBadge
          :tone="decklistReady ? 'accent' : 'muted'"
          variant="soft"
          size="sm"
          text-case="normal"
        >
          {{ decklistReady ? "Ready" : "Waiting for decklist" }}
        </CBadge>
      </div>
      <CText tag="p" variant="title">Finish with your filtered list</CText>
      <CText tag="p" variant="helper" tone="muted">
        {{ exportHelperText }}
      </CText>
    </div>

    <DecklistExport
      :disabled="!decklistReady"
      :copied="copied"
      @copy="emit('copy')"
      @download="emit('download')"
    />
  </footer>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { CBadge, CText } from "../core";

const DecklistExport = defineAsyncComponent(() => import("../DecklistExport.vue"));

const props = defineProps<{
  decklistText?: string | null;
  copied: boolean;
  exportHelperText: string;
}>();

const emit = defineEmits<{
  copy: [];
  download: [];
}>();

const decklistReady = computed(() => Boolean(props.decklistText));
</script>
