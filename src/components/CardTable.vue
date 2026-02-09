<template>
  <div class="relative">
    <div
      ref="scrollParent"
      :class="[
        'overflow-x-auto',
        containerVirtualEnabled ? 'overflow-y-auto' : '',
      ]"
      :style="virtualContainerStyle"
    >
      <table
        :class="[
          'min-w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] text-sm text-[color:var(--text)]',
          tableClass,
        ]"
      >
        <thead class="bg-[color:var(--surface-strong)] text-[color:var(--muted)]">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :class="[
                headerCellClass,
                'font-semibold uppercase tracking-[0.24em] border-b border-[color:var(--border)]',
                column.align ? alignmentClasses[column.align] : alignmentClasses.left,
                column.class || '',
              ]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[color:var(--border)]">
          <template v-if="$slots.default">
            <template v-if="containerVirtualEnabled">
              <tr
                v-if="virtualPaddingTop"
                aria-hidden="true"
                class="h-px border-0 p-0"
                :style="{ height: `${virtualPaddingTop}px` }"
              >
                <td :colspan="columns.length" class="border-0 p-0"></td>
              </tr>
              <slot
                v-for="entry in visibleRows"
                :key="entry.key"
                :row="entry.row"
                :index="entry.index"
              />
              <tr
                v-if="virtualPaddingBottom"
                aria-hidden="true"
                class="h-px border-0 p-0"
                :style="{ height: `${virtualPaddingBottom}px` }"
              >
                <td :colspan="columns.length" class="border-0 p-0"></td>
              </tr>
            </template>
            <template v-else>
              <slot
                v-for="(row, index) in rowsToRender"
                :key="resolveRowKey(row, index)"
                :row="row"
                :index="index"
              />
              <tr
                v-if="showLoadMoreRow"
                ref="loadMoreRef"
                aria-hidden="true"
                class="h-px border-0 p-0"
              >
                <td :colspan="columns.length" class="border-0 p-0"></td>
              </tr>
            </template>
          </template>
          <template v-else>
            <template v-if="containerVirtualEnabled">
              <tr
                v-if="virtualPaddingTop"
                aria-hidden="true"
                class="h-px border-0 p-0"
                :style="{ height: `${virtualPaddingTop}px` }"
              >
                <td :colspan="columns.length" class="border-0 p-0"></td>
              </tr>
              <tr
                v-for="entry in visibleRows"
                :key="entry.key"
                class="bg-[color:var(--surface)] even:bg-[color:var(--surface-muted)] hover:bg-[color:var(--accent-soft)] transition-colors"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="[
                    bodyCellClass,
                    column.align ? alignmentClasses[column.align] : alignmentClasses.left,
                    column.class || '',
                  ]"
                >
                  {{ entry.row[column.key as keyof typeof entry.row] }}
                </td>
              </tr>
              <tr
                v-if="virtualPaddingBottom"
                aria-hidden="true"
                class="h-px border-0 p-0"
                :style="{ height: `${virtualPaddingBottom}px` }"
              >
                <td :colspan="columns.length" class="border-0 p-0"></td>
              </tr>
            </template>
            <template v-else>
              <tr
                v-for="(row, index) in rowsToRender"
                :key="resolveRowKey(row, index)"
                class="bg-[color:var(--surface)] even:bg-[color:var(--surface-muted)] hover:bg-[color:var(--accent-soft)] transition-colors"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="[
                    bodyCellClass,
                    column.align ? alignmentClasses[column.align] : alignmentClasses.left,
                    column.class || '',
                  ]"
                >
                  {{ row[column.key as keyof typeof row] }}
                </td>
              </tr>
              <tr
                v-if="showLoadMoreRow"
                ref="loadMoreRef"
                aria-hidden="true"
                class="h-px border-0 p-0"
              >
                <td :colspan="columns.length" class="border-0 p-0"></td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
    <div
      v-if="showTopShadow"
      class="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[color:var(--bg-strong)] via-[color:var(--bg)] to-transparent"
      aria-hidden="true"
    />
    <div
      v-if="showBottomShadow"
      class="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[color:var(--bg-strong)] via-[color:var(--bg)] to-transparent"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { useLayoutDensity } from "../composables/useLayoutDensity";

type Alignment = "left" | "center" | "right";
type VisibleRow = { row: Record<string, unknown>; index: number; key: string };

export type ColumnDefinition = {
  key: string;
  label: string;
  align?: Alignment;
  class?: string;
};

const props = withDefaults(
  defineProps<{
    columns: ColumnDefinition[];
    rows: Array<Record<string, unknown>>;
    rowKey?: string | ((row: Record<string, unknown>, index: number) => string);
    tableClass?: string;
    virtual?: boolean;
    virtualItemSize?: number;
    virtualOverscan?: number;
    virtualMaxHeight?: number | string;
    virtualTriggerCount?: number;
    scrollMode?: "container" | "page";
  }>(),
  {
    tableClass: "",
    virtual: undefined,
    virtualItemSize: 72,
    virtualOverscan: 8,
    virtualMaxHeight: "70vh",
    virtualTriggerCount: 80,
    scrollMode: "container",
  }
);

const alignmentClasses: Record<Alignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const { density } = useLayoutDensity();

const headerCellClass = computed(() => {
  switch (density.value) {
    case "compact":
      return "px-2.5 py-1 text-[0.6rem]";
    case "cozy":
      return "px-3 py-1.5 text-[0.65rem]";
    default:
      return "px-3 py-2 text-[0.68rem]";
  }
});

const bodyCellClass = computed(() => {
  switch (density.value) {
    case "compact":
      return "px-2.5 py-1 text-[0.78rem] text-[color:var(--text)]";
    case "cozy":
      return "px-3 py-1.5 text-[0.82rem] text-[color:var(--text)]";
    default:
      return "px-3 py-2 text-sm text-[color:var(--text)]";
  }
});

const resolveRowKey = (
  row: Record<string, unknown> | undefined,
  index: number
) => {
  if (typeof props.rowKey === "function") {
    return props.rowKey(row ?? {}, index);
  }
  if (typeof props.rowKey === "string") {
    return `${row?.[props.rowKey] ?? index}`;
  }
  return `${index}`;
};

const scrollParent = ref<HTMLElement | null>(null);
const loadMoreRef = ref<HTMLElement | null>(null);
let loadMoreObserver: IntersectionObserver | null = null;

const virtualEnabled = computed(() => {
  if (typeof props.virtual === "boolean") {
    return props.virtual;
  }
  return props.rows.length >= props.virtualTriggerCount;
});

const useWindowScroll = computed(() => props.scrollMode === "page");
const containerVirtualEnabled = computed(
  () => virtualEnabled.value && !useWindowScroll.value
);
const progressiveEnabled = computed(
  () =>
    useWindowScroll.value &&
    virtualEnabled.value &&
    props.rows.length >= props.virtualTriggerCount
);

const elementVirtualizer = useVirtualizer(
  computed(() => ({
    count: props.rows.length,
    getScrollElement: () => scrollParent.value,
    estimateSize: () => props.virtualItemSize,
    overscan: props.virtualOverscan,
    getItemKey: (index) => resolveRowKey(props.rows[index], index),
    enabled: containerVirtualEnabled.value,
  }))
);

const virtualItems = computed(() =>
  containerVirtualEnabled.value ? elementVirtualizer.value.getVirtualItems() : []
);

const virtualPaddingTop = computed(() => virtualItems.value[0]?.start ?? 0);

const virtualPaddingBottom = computed(() => {
  if (!virtualEnabled.value || !virtualItems.value.length) {
    return 0;
  }
  const last = virtualItems.value[virtualItems.value.length - 1];
  if (!last) {
    return 0;
  }
  return Math.max(elementVirtualizer.value.getTotalSize() - last.end, 0);
});

const virtualContainerStyle = computed(() => {
  if (!containerVirtualEnabled.value) {
    return undefined;
  }
  const maxHeight =
    typeof props.virtualMaxHeight === "number"
      ? `${props.virtualMaxHeight}px`
      : props.virtualMaxHeight;
  return { maxHeight };
});

const visibleRows = computed<VisibleRow[]>(() => {
  if (!virtualEnabled.value) {
    return props.rows.map((row, index) => ({
      row,
      index,
      key: resolveRowKey(row, index),
    }));
  }

  return virtualItems.value
    .map((item) => ({
      row: props.rows[item.index],
      index: item.index,
      key: String(item.key ?? resolveRowKey(props.rows[item.index], item.index)),
    }))
    .filter((entry): entry is VisibleRow => Boolean(entry.row));
});

const showTopShadow = ref(false);
const showBottomShadow = ref(false);

const totalVirtualHeight = computed(() =>
  containerVirtualEnabled.value ? elementVirtualizer.value.getTotalSize() : null
);

const attachScrollListener = () => {
  const el = scrollParent.value;
  if (!el) {
    return;
  }
  el.addEventListener("scroll", updateShadows, { passive: true });
};

const detachScrollListener = () => {
  scrollParent.value?.removeEventListener("scroll", updateShadows);
};

const updateShadows = () => {
  if (!containerVirtualEnabled.value) {
    showTopShadow.value = false;
    showBottomShadow.value = false;
    return;
  }
  const el = scrollParent.value;
  if (!el) {
    showTopShadow.value = false;
    showBottomShadow.value = false;
    return;
  }

  const maxScrollTop = Math.max(el.scrollHeight - el.clientHeight, 0);
  const hasOverflow = maxScrollTop > 2;
  if (!hasOverflow) {
    showTopShadow.value = false;
    showBottomShadow.value = false;
    return;
  }

  const scrollTop = el.scrollTop;
  const remaining = maxScrollTop - scrollTop;
  showTopShadow.value = scrollTop > 2;
  showBottomShadow.value = remaining > 2;
};

const progressiveLimit = ref(0);
const progressiveChunkSize = computed(() =>
  Math.max(20, Math.round(props.virtualTriggerCount / 2))
);

const rowsToRender = computed(() => {
  if (!progressiveEnabled.value) {
    return props.rows;
  }
  return props.rows.slice(0, progressiveLimit.value);
});

const showLoadMoreRow = computed(
  () => progressiveEnabled.value && progressiveLimit.value < props.rows.length
);

const resetProgressiveLimit = () => {
  if (!progressiveEnabled.value) {
    progressiveLimit.value = props.rows.length;
    return;
  }
  progressiveLimit.value = Math.min(props.virtualTriggerCount, props.rows.length);
};

const loadMoreRows = () => {
  if (!progressiveEnabled.value) {
    return;
  }
  const nextLimit = Math.min(
    props.rows.length,
    progressiveLimit.value + progressiveChunkSize.value
  );
  if (nextLimit !== progressiveLimit.value) {
    progressiveLimit.value = nextLimit;
  }
};

const cleanupLoadMoreObserver = () => {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect();
    loadMoreObserver = null;
  }
};

const setupLoadMoreObserver = () => {
  if (
    !showLoadMoreRow.value ||
    typeof window === "undefined" ||
    !loadMoreRef.value
  ) {
    cleanupLoadMoreObserver();
    return;
  }
  cleanupLoadMoreObserver();
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreRows();
      }
    },
    { root: null, rootMargin: "400px 0px", threshold: 0.01 }
  );
  loadMoreObserver.observe(loadMoreRef.value);
};

onMounted(() => {
  if (containerVirtualEnabled.value) {
    attachScrollListener();
  }
  nextTick(() => {
    updateShadows();
    setupLoadMoreObserver();
  });
});

onUnmounted(() => {
  detachScrollListener();
  cleanupLoadMoreObserver();
});

watch(
  [virtualItems, () => props.rows.length, containerVirtualEnabled],
  () => {
    nextTick(updateShadows);
  }
);

watch([progressiveEnabled, () => props.rows.length], () => {
  resetProgressiveLimit();
  nextTick(setupLoadMoreObserver);
});

watch(totalVirtualHeight, () => {
  nextTick(updateShadows);
});

watch(containerVirtualEnabled, (enabled) => {
  if (enabled) {
    nextTick(() => {
      attachScrollListener();
      updateShadows();
    });
  } else {
    detachScrollListener();
    updateShadows();
  }
});

watch(showLoadMoreRow, () => {
  nextTick(setupLoadMoreObserver);
});

watch(loadMoreRef, () => {
  nextTick(setupLoadMoreObserver);
});

resetProgressiveLimit();
</script>
