<template>
  <Card
    :id="sectionMeta?.id"
    as="article"
    :class="spacing.stackSpace"
  >
    <CInline
      as="header"
      align="center"
      justify="between"
      gap="md"
      class="flex-col md:flex-row"
    >
      <CStack gap="sm">
        <CInline gap="md">
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
          <CText tag="p" variant="eyebrow" tone="muted" class="tracking-[0.3em]">
            EDHREC Cardlist
          </CText>
        </CInline>
        <CText tag="h2" variant="title" class="text-2xl">
          {{ cardlist.header }}
        </CText>
      </CStack>

      <CInline gap="sm" class="text-xs font-semibold">
        <CButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!decklistText.length"
          @click="emitCopy"
        >
          {{ isCopied ? "Copied!" : "Copy for Archidekt/Moxfield" }}
        </CButton>
        <CButton
          type="button"
          variant="primary"
          size="sm"
          :disabled="!decklistText.length"
          @click="emitDownload"
        >
          Download decklist.txt
        </CButton>
      </CInline>
    </CInline>

    <CSurface
      v-if="!loading"
      variant="muted"
      size="none"
      radius="xl"
      class="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-xs font-semibold text-[color:var(--muted)]"
    >
      <CInline gap="md">
        <CBadge tone="muted" variant="outline" size="sm">
          Atlas
        </CBadge>
        <CText tag="span" variant="helper" tone="default">
          {{ totalCards }} cards
        </CText>
        <CText tag="span" variant="helper" tone="default">
          {{ ownedCount }} owned
        </CText>
        <CText tag="span" variant="helper" tone="default">
          {{ unownedCount }} unowned
        </CText>
      </CInline>

      <CInline
        gap="md"
        role="img"
        :aria-label="`Owned ${ownedPercent}% of cards`"
      >
        <CText tag="span" variant="helper" tone="muted">
          {{ ownedPercent }}% owned
        </CText>
        <div class="grid grid-cols-12 gap-1" aria-hidden="true">
          <span
            v-for="(filled, index) in ownedSegments"
            :key="`segment-${index}`"
            class="h-2 w-2 rounded-full"
            :class="filled ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--surface-strong)]'"
          />
        </div>
      </CInline>
    </CSurface>

    <CStack v-if="loading" gap="md">
      <SkeletonCard v-for="i in 5" :key="i" />
    </CStack>

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

    <CStack v-if="!loading" gap="md" class="md:hidden">
      <ScryfallCardRow
        v-for="row in rows"
        :key="row.id + '-mobile'"
        :card="row.card"
        :have="Boolean(row.have)"
        variant="card"
      />
    </CStack>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card, CardTable, ScryfallCardRow } from ".";
import { CBadge, CButton, CInline, CStack, CSurface, CText } from "./core";
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
const ownedCount = computed(() => props.rows.filter((row) => Boolean(row.have)).length);
const unownedCount = computed(() => Math.max(totalCards.value - ownedCount.value, 0));
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
      return 49;
    case "cozy":
      return 53;
    default:
      return 57;
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
