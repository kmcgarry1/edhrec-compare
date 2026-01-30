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
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!decklistText.length"
          @click="emitCopy"
        >
          {{ isCopied ? "Copied!" : "Copy for Archidekt/Moxfield" }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-3 py-1.5 text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!decklistText.length"
          @click="emitDownload"
        >
          Download decklist.txt
        </button>
      </div>
    </header>

    <div
      v-if="!loading"
      class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[color:var(--muted)]"
    >
      <div class="flex flex-wrap items-center gap-3">
        <span class="uppercase tracking-[0.32em] text-[color:var(--muted)]">
          Atlas
        </span>
        <span class="text-[color:var(--text)]">{{ totalCards }} cards</span>
        <span class="text-[color:var(--text)]">{{ ownedCount }} owned</span>
        <span class="text-[color:var(--text)]">{{ unownedCount }} unowned</span>
      </div>
      <div
        class="flex items-center gap-3"
        role="img"
        :aria-label="`Owned ${ownedPercent}% of cards`"
      >
        <span class="text-[color:var(--muted)]">{{ ownedPercent }}% owned</span>
        <div class="grid grid-cols-12 gap-1" aria-hidden="true">
          <span
            v-for="(filled, index) in ownedSegments"
            :key="`segment-${index}`"
            class="h-2 w-2 rounded-full"
            :class="
              filled
                ? 'bg-[color:var(--accent)]'
                : 'bg-[color:var(--surface-strong)]'
            "
          ></span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="space-y-3">
      <SkeletonCard v-for="i in 5" :key="i" />
    </div>

    <div v-else class="hidden md:block">
      <CardTable
        :columns="columns"
        :rows="rows"
        row-key="id"
        tableClass="w-full"
        aria-live="polite"
        :virtual="true"
        :virtual-item-size="virtualRowSize"
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

const { spacing, density } = useLayoutDensity();

const totalCards = computed(() => props.rows.length);
const ownedCount = computed(
  () => props.rows.filter((row) => Boolean(row.have)).length
);
const unownedCount = computed(() =>
  Math.max(totalCards.value - ownedCount.value, 0)
);
const ownedPercent = computed(() => {
  if (!totalCards.value) {
    return 0;
  }
  return Math.round((ownedCount.value / totalCards.value) * 100);
});
const ownedSegments = computed(() => {
  const segments = 12;
  if (!totalCards.value) {
    return Array.from({ length: segments }, () => false);
  }
  const filled = Math.round((ownedCount.value / totalCards.value) * segments);
  return Array.from({ length: segments }, (_, index) => index < filled);
});

const virtualRowSize = computed(() => {
  switch (density.value) {
    case "compact":
      return 58;
    case "cozy":
      return 66;
    default:
      return 76;
  }
});

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
