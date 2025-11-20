<template>
  <Card
    :id="sectionMeta?.id"
    as="article"
    class="space-y-6"
    padding="p-4 sm:p-6"
    background="bg-white/95 dark:bg-slate-900/60"
    shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/50"
  >
    <header class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <svg
            v-if="sectionMeta?.iconPath"
            viewBox="0 0 24 24"
            class="h-7 w-7 rounded-2xl bg-slate-100 p-1 text-emerald-600 dark:bg-slate-800"
            :style="{ color: sectionMeta?.iconColor || undefined }"
            fill="currentColor"
            aria-hidden="true"
          >
            <path :d="sectionMeta?.iconPath" />
          </svg>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500/80 dark:text-emerald-300/70">
            EDHREC Cardlist
          </p>
        </div>
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
          {{ cardlist.header }}
        </h2>
      </div>
      <div class="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-300"
          :disabled="!decklistText.length"
          @click="emitCopy"
        >
          {{ isCopied ? "Copied!" : "Copy for Archidekt/Moxfield" }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-emerald-400 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-300 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
          :disabled="!decklistText.length"
          @click="emitDownload"
        >
          Download decklist.txt
        </button>
      </div>
    </header>

    <div class="hidden md:block">
      <CardTable :columns="columns" :rows="rows" row-key="id" aria-live="polite">
        <template #default="{ row }">
          <ScryfallCardRow
            :card="(row as CardTableRow).card"
            :have="Boolean((row as CardTableRow).have)"
          />
        </template>
      </CardTable>
    </div>

    <div class="md:hidden space-y-3">
      <ScryfallCardRow
        v-for="row in rows"
        :key="row.id + '-mobile'"
        :card="row.card"
        :have="Boolean(row.have)"
        variant="card"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card, CardTable, ScryfallCardRow } from ".";
import type { CardTableRow } from "../types/cards";
import type { ColumnDefinition } from "./CardTable.vue";

type SectionMeta = {
  id: string;
  label: string;
  iconPath?: string;
  iconColor?: string;
} | null;

const props = defineProps<{
  cardlist: { header: string; cardviews: { id: string; name: string }[] };
  sectionMeta: SectionMeta;
  rows: CardTableRow[];
  columns: ColumnDefinition[];
  decklistText: string;
  copiedSectionId: string | null;
}>();

const emit = defineEmits<{
  copy: [];
  download: [];
}>();

const isCopied = computed(
  () => props.sectionMeta?.id && props.sectionMeta.id === props.copiedSectionId
);

const emitCopy = () => {
  if (props.decklistText.length) {
    emit("copy");
  }
};

const emitDownload = () => {
  if (props.decklistText.length) {
    emit("download");
  }
};
</script>
