<template>
  <CSurface
    :id="sectionMeta?.id"
    as="article"
    variant="content"
    size="sm"
    radius="3xl"
    :class="['commander-cardlist-section', spacing.stackSpace]"
  >
    <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
      <div class="min-w-0 space-y-4">
        <div class="flex items-start gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border"
            :class="toneIconShellClass"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              :style="{ color: sectionMeta?.iconColor || undefined }"
              fill="currentColor"
            >
              <path :d="sectionMeta?.iconPath || fallbackIconPath" />
            </svg>
          </div>

          <div class="min-w-0 space-y-3">
            <div class="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold">
              <CBadge
                v-if="sectionMeta?.label"
                :tone="toneBadgeTone"
                variant="soft"
                size="sm"
                text-case="normal"
              >
                {{ sectionMeta.label }}
              </CBadge>
              <span class="text-[color:var(--muted)]">{{ totalCards }} cards</span>
              <span class="text-[color:var(--muted)]">{{ ownedPercent }}% owned</span>
            </div>

            <div class="space-y-1">
              <CText tag="h2" variant="title" class="text-xl leading-tight text-balance sm:text-[1.35rem]">
                {{ cardlist.header }}
              </CText>
              <CText v-if="sectionMeta?.summary" tag="p" variant="body" tone="muted">
                {{ sectionMeta.summary }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                {{ ownedCount }} owned | {{ unownedCount }} missing
              </CText>
            </div>

            <div class="flex flex-wrap items-center gap-2 text-[0.72rem] font-semibold">
              <CBadge
                :tone="toneBadgeTone"
                variant="outline"
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
                    :key="`section-progress-${index}`"
                    class="h-1.5 w-1.5 rounded-full"
                    :class="filled ? toneProgressClass : 'bg-[color:var(--surface-strong)]'"
                  />
                </span>
              </CBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 xl:justify-end">
        <CButton type="button" variant="soft" size="sm" @click="emit('toggle')">
          {{ isExpanded ? "Collapse" : "Expand" }}
        </CButton>
        <template v-if="isExpanded">
          <CButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="!decklistText.length"
            @click="emitCopy"
          >
            <span class="sm:hidden">{{ isCopied ? "Copied" : "Copy" }}</span>
            <span class="hidden sm:inline">{{ isCopied ? "Copied!" : "Copy decklist" }}</span>
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
        </template>
      </div>
    </div>

    <template v-if="isExpanded">
      <div :class="['rounded-[24px] border p-4', toneContentShellClass]">
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
            :key="`${row.id}-mobile`"
            :card="row.card"
            :have="Boolean(row.have)"
            variant="card"
          />
        </CStack>
      </div>
    </template>
  </CSurface>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { mdiCardsOutline } from "@mdi/js";
import CardTable from "../CardTable.vue";
import ScryfallCardRow from "../ScryfallCardRow.vue";
import SkeletonCard from "../SkeletonCard.vue";
import { CBadge, CButton, CStack, CSurface, CText } from "../core";
import { useLayoutDensity } from "../../composables/useLayoutDensity";
import type { CardTableRow } from "../../types/cards";
import type { CardlistSectionMeta } from "../../types/edhrec";
import type { ColumnDefinition } from "../CardTable.vue";

const DESKTOP_BREAKPOINT_PX = 768;

const props = withDefaults(
  defineProps<{
    cardlist: { header: string; cardviews: { id: string; name: string }[] };
    sectionMeta: CardlistSectionMeta | null;
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
  toggle: [];
  copy: [];
  download: [];
}>();

const { spacing, density } = useLayoutDensity();
const fallbackIconPath = mdiCardsOutline;
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

const rowCount = computed(() => props.rows.length);
const summaryCounts = computed(() => {
  if (props.sectionMeta?.summaryCounts) {
    return props.sectionMeta.summaryCounts;
  }

  const ownedCount = props.rows.filter((row) => Boolean(row.have)).length;
  const unownedCount = Math.max(rowCount.value - ownedCount, 0);
  const ownedPercent = rowCount.value ? Math.round((ownedCount / rowCount.value) * 100) : 0;

  return {
    totalCards: rowCount.value,
    ownedCount,
    unownedCount,
    ownedPercent,
  };
});

const totalCards = computed(() => summaryCounts.value.totalCards);
const ownedCount = computed(() => summaryCounts.value.ownedCount);
const unownedCount = computed(() => summaryCounts.value.unownedCount);
const ownedPercent = computed(() => summaryCounts.value.ownedPercent);
const isExpanded = computed(() => props.sectionMeta?.expanded ?? true);
const ownedSegments = computed(() => {
  const segments = 12;
  if (!totalCards.value) {
    return Array.from({ length: segments }, () => false);
  }
  const filled = Math.round((ownedCount.value / totalCards.value) * segments);
  return Array.from({ length: segments }, (_, index) => index < filled);
});

const tone = computed(() => props.sectionMeta?.tone ?? "default");
const toneBadgeTone = computed(() => {
  switch (tone.value) {
    case "success":
      return "success" as const;
    case "warn":
      return "warn" as const;
    case "danger":
      return "danger" as const;
    case "muted":
      return "muted" as const;
    case "accent":
      return "accent" as const;
    default:
      return "default" as const;
  }
});
const toneIconShellClass = computed(() => {
  switch (tone.value) {
    case "success":
      return "border-[color:color-mix(in_srgb,var(--success-soft)_92%,var(--border)_8%)] bg-[color:color-mix(in_srgb,var(--success-soft)_72%,transparent)] text-[color:var(--success)]";
    case "warn":
      return "border-[color:color-mix(in_srgb,var(--warn-soft)_92%,var(--border)_8%)] bg-[color:color-mix(in_srgb,var(--warn-soft)_72%,transparent)] text-[color:var(--warn)]";
    case "danger":
      return "border-[color:color-mix(in_srgb,var(--danger-soft)_92%,var(--border)_8%)] bg-[color:color-mix(in_srgb,var(--danger-soft)_72%,transparent)] text-[color:var(--danger)]";
    case "muted":
      return "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--muted)]";
    case "accent":
      return "border-[color:color-mix(in_srgb,var(--accent-soft)_92%,var(--border)_8%)] bg-[color:color-mix(in_srgb,var(--accent-soft)_72%,transparent)] text-[color:var(--accent)]";
    default:
      return "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--accent)]";
  }
});
const toneContentShellClass = computed(() => {
  switch (tone.value) {
    case "success":
      return "border-[color:color-mix(in_srgb,var(--success-soft)_90%,var(--border)_10%)] bg-[color:color-mix(in_srgb,var(--success-soft)_26%,var(--surface)_74%)]";
    case "warn":
      return "border-[color:color-mix(in_srgb,var(--warn-soft)_90%,var(--border)_10%)] bg-[color:color-mix(in_srgb,var(--warn-soft)_24%,var(--surface)_76%)]";
    case "danger":
      return "border-[color:color-mix(in_srgb,var(--danger-soft)_90%,var(--border)_10%)] bg-[color:color-mix(in_srgb,var(--danger-soft)_20%,var(--surface)_80%)]";
    case "muted":
      return "border-[color:var(--border)] bg-[color:var(--surface)]";
    case "accent":
      return "border-[color:color-mix(in_srgb,var(--accent-soft)_90%,var(--border)_10%)] bg-[color:color-mix(in_srgb,var(--accent-soft)_22%,var(--surface)_78%)]";
    default:
      return "border-[color:var(--border)] bg-[color:var(--surface)]";
  }
});
const toneProgressClass = computed(() => {
  switch (tone.value) {
    case "success":
      return "bg-[color:var(--success)]";
    case "warn":
      return "bg-[color:var(--warn)]";
    case "danger":
      return "bg-[color:var(--danger)]";
    case "muted":
      return "bg-[color:var(--muted)]";
    case "accent":
      return "bg-[color:var(--accent)]";
    default:
      return "bg-[color:var(--accent)]";
  }
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
  .commander-cardlist-section {
    content-visibility: auto;
    contain-intrinsic-size: auto 1200px;
  }
}
</style>
