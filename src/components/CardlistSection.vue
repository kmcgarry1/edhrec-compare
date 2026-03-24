<template>
  <Card
    :id="sectionMeta?.id"
    variant="content"
    as="article"
    :class="['cardlist-section', spacing.stackSpace]"
  >
    <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
      <div class="min-w-0">
        <div class="flex items-start gap-3">
          <div
            v-if="sectionMeta?.iconPath"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--surface-muted)] text-[color:var(--accent)]"
            :style="{ color: sectionMeta?.iconColor || undefined }"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
              <path :d="sectionMeta?.iconPath" />
            </svg>
          </div>

          <CStack gap="sm" class="min-w-0">
            <CInline gap="sm" class="flex-wrap text-[0.72rem] font-semibold">
              <CBadge tone="muted" variant="outline" size="sm"> EDHREC </CBadge>
              <CBadge
                v-if="sectionMeta?.label"
                tone="default"
                variant="soft"
                size="sm"
                text-case="normal"
              >
                {{ sectionMeta.label }}
              </CBadge>
              <span class="text-[color:var(--muted)]"> {{ totalCards }} cards </span>
            </CInline>

            <CText
              tag="h2"
              variant="title"
              class="text-xl leading-tight text-balance sm:text-[1.35rem]"
            >
              {{ cardlist.header }}
            </CText>

            <CInline
              gap="sm"
              class="flex-wrap text-[0.72rem] font-semibold text-[color:var(--muted)]"
            >
              <CBadge tone="default" variant="soft" size="sm" text-case="normal">
                {{ ownedCount }} owned
              </CBadge>
              <CBadge tone="default" variant="soft" size="sm" text-case="normal">
                {{ unownedCount }} unowned
              </CBadge>
              <CBadge
                tone="accent"
                variant="soft"
                size="sm"
                text-case="normal"
                class="gap-2"
                role="img"
                :aria-label="`Owned ${ownedPercent}% of cards`"
              >
                <span>{{ ownedPercent }}% owned</span>
                <span class="grid grid-cols-12 gap-1" aria-hidden="true">
                  <span
                    v-for="(filled, index) in ownedSegments"
                    :key="`segment-${index}`"
                    class="h-1.5 w-1.5 rounded-full"
                    :class="
                      filled ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--surface-strong)]'
                    "
                  />
                </span>
              </CBadge>
            </CInline>
          </CStack>
        </div>
      </div>

      <CInline gap="sm" class="flex-wrap text-xs font-semibold xl:justify-end">
        <CButton
          type="button"
          variant="secondary"
          size="sm"
          :disabled="!decklistText.length"
          @click="emitCopy"
        >
          <span class="sm:hidden">
            {{ isCopied ? "Copied" : "Copy" }}
          </span>
          <span class="hidden sm:inline">
            {{ isCopied ? "Copied!" : "Copy decklist" }}
          </span>
        </CButton>
        <CButton
          type="button"
          variant="primary"
          size="sm"
          :disabled="!decklistText.length"
          @click="emitDownload"
        >
          <span class="sm:hidden">Save</span>
          <span class="hidden sm:inline">Download .txt</span>
        </CButton>
      </CInline>
    </div>

    <CStack v-if="loading" gap="md">
      <SkeletonCard v-for="i in 5" :key="i" />
    </CStack>

    <div v-else-if="isDesktopViewport">
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

    <CStack v-else gap="md">
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { Card, CardTable, ScryfallCardRow } from ".";
import { CBadge, CButton, CInline, CStack, CText } from "./core";
import SkeletonCard from "./SkeletonCard.vue";
import type { CardTableRow } from "../types/cards";
import type { ColumnDefinition } from "./CardTable.vue";
import { useLayoutDensity } from "../composables/useLayoutDensity";

const DESKTOP_BREAKPOINT_PX = 768;

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
const isDesktopViewport = ref(
  typeof window === "undefined" ? true : window.innerWidth >= DESKTOP_BREAKPOINT_PX
);

const syncViewportMode = () => {
  if (typeof window === "undefined") {
    return;
  }
  isDesktopViewport.value = window.innerWidth >= DESKTOP_BREAKPOINT_PX;
};

onMounted(() => {
  syncViewportMode();
  window.addEventListener("resize", syncViewportMode, { passive: true });
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncViewportMode);
  }
});

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

<style scoped>
@supports (content-visibility: auto) {
  .cardlist-section {
    content-visibility: auto;
    contain-intrinsic-size: auto 1200px;
  }
}
</style>
