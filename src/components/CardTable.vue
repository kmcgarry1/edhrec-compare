<template>
  <div class="relative">
    <div
      ref="scrollParent"
      :class="[
        'overflow-x-auto',
        virtualEnabled ? 'overflow-y-auto' : '',
      ]"
      :style="virtualContainerStyle"
    >
      <table
        :class="[
          'min-w-full border border-[color:var(--border)] text-sm',
          tableClass,
        ]"
      >
        <thead class="bg-[color:var(--surface-muted)]">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :class="[
                'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)] border-b border-[color:var(--border)]',
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
            <template v-if="virtualEnabled">
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
                v-for="(row, index) in rows"
                :key="resolveRowKey(row, index)"
                :row="row"
                :index="index"
              />
            </template>
          </template>
          <template v-else>
            <template v-if="virtualEnabled">
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
                class="bg-[color:var(--surface)] even:bg-[color:var(--surface-muted)] hover:bg-[color:var(--accent-soft)] transition"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="[
                    'px-3 py-2 text-[color:var(--text)]',
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
                v-for="(row, index) in rows"
                :key="resolveRowKey(row, index)"
                class="bg-[color:var(--surface)] even:bg-[color:var(--surface-muted)] hover:bg-[color:var(--accent-soft)] transition"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  :class="[
                    'px-3 py-2 text-[color:var(--text)]',
                    column.align ? alignmentClasses[column.align] : alignmentClasses.left,
                    column.class || '',
                  ]"
                >
                  {{ row[column.key as keyof typeof row] }}
                </td>
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
  }>(),
  {
    tableClass: "",
    virtual: undefined,
    virtualItemSize: 72,
    virtualOverscan: 8,
    virtualMaxHeight: "70vh",
    virtualTriggerCount: 80,
  }
);

const alignmentClasses: Record<Alignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

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

const virtualEnabled = computed(() => {
  if (typeof props.virtual === "boolean") {
    return props.virtual;
  }
  return props.rows.length >= props.virtualTriggerCount;
});

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.rows.length,
    getScrollElement: () => scrollParent.value,
    estimateSize: () => props.virtualItemSize,
    overscan: props.virtualOverscan,
    getItemKey: (index) => resolveRowKey(props.rows[index], index),
    enabled: virtualEnabled.value,
  }))
);

const virtualItems = computed(() =>
  virtualEnabled.value ? virtualizer.value.getVirtualItems() : []
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
  return Math.max(virtualizer.value.getTotalSize() - last.end, 0);
});

const virtualContainerStyle = computed(() => {
  if (!virtualEnabled.value) {
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
  virtualEnabled.value ? virtualizer.value.getTotalSize() : null
);

const updateShadows = () => {
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

onMounted(() => {
  const el = scrollParent.value;
  if (el) {
    el.addEventListener("scroll", updateShadows, { passive: true });
  }
  nextTick(updateShadows);
});

onUnmounted(() => {
  scrollParent.value?.removeEventListener("scroll", updateShadows);
});

watch([virtualItems, () => props.rows.length, virtualEnabled], () => {
  nextTick(updateShadows);
});

watch(totalVirtualHeight, () => {
  nextTick(updateShadows);
});
</script>
