<template>
  <Card
    :id="sectionMeta?.id"
    as="article"
    :class="spacing.stackSpace"
  >
    <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <svg
            v-if="sectionMeta?.iconPath"
            viewBox="0 0 24 24"
            class="h-7 w-7 rounded-2xl bg-[color:var(--surface-muted)] p-1 text-[color:var(--accent)]"
            :style="{ color: sectionMeta?.iconColor || undefined }"
            fill="currentColor"
            aria-hidden="true"
          >
            <path :d="sectionMeta?.iconPath" />
          </svg>
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
            EDHREC Cardlist
          </p>
        </div>
        <h2 class="text-2xl font-semibold text-[color:var(--text)]">
          {{ cardlist.header }}
        </h2>
      </div>
      <div class="flex flex-wrap gap-2 text-xs font-semibold">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!decklistText.length"
          @click="emitCopy"
        >
          {{ isCopied ? "Copied!" : "Copy for Archidekt/Moxfield" }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] px-3 py-1.5 text-[color:var(--text)] transition hover:bg-[color:var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!decklistText.length"
          @click="emitDownload"
        >
          Download decklist.txt
        </button>
      </div>
    </header>

    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="i in 5" :key="i" />
    </div>

    <div v-else class="hidden md:block">
      <CardTable
        :columns="columns"
        :rows="rows"
        row-key="id"
        aria-live="polite"
        :virtual="true"
        :virtual-item-size="76"
        :virtual-overscan="12"
      >
        <template #default="{ row }">
          <ScryfallCardRow
            :card="(row as CardTableRow).card"
            :have="Boolean((row as CardTableRow).have)"
          />
        </template>
      </CardTable>
    </div>

    <div v-if="!loading" class="md:hidden space-y-3">
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
import SkeletonCard from "./SkeletonCard.vue";
import type { CardTableRow } from "../types/cards";
import type { ColumnDefinition } from "./CardTable.vue";
import { useLayoutDensity } from "../composables/useLayoutDensity";

type SectionMeta = {
  id: string;
  label: string;
  iconPath?: string;
  iconColor?: string;
} | null;

const props = withDefaults(
  defineProps<{
    cardlist: { header: string; cardviews: { id: string; name: string }[] };
    sectionMeta: SectionMeta;
    rows: CardTableRow[];
    columns: ColumnDefinition[];
    decklistText: string;
    copiedSectionId: string | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  }
);

const emit = defineEmits<{
  copy: [];
  download: [];
}>();

const { spacing } = useLayoutDensity();

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
