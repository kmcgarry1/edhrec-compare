<template>
  <div class="overflow-x-auto">
    <table
      :class="[
        'min-w-full border border-slate-200/70 dark:border-slate-700/60 text-sm',
        tableClass,
      ]"
    >
      <thead class="bg-slate-100/70 dark:bg-slate-900/60">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :class="[
              'px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700/60',
              column.align ? alignmentClasses[column.align] : alignmentClasses.left,
              column.class || '',
            ]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800/70">
        <template v-if="$slots.default">
          <slot
            v-for="(row, index) in rows"
            :key="resolveRowKey(row, index)"
            :row="row"
            :index="index"
          />
        </template>
        <template v-else>
          <tr
            v-for="(row, index) in rows"
            :key="resolveRowKey(row, index)"
            class="bg-white even:bg-slate-50/60 hover:bg-emerald-50/40 dark:bg-slate-900/50 dark:even:bg-slate-900/70 dark:hover:bg-slate-800/70 transition"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-3 py-2 text-slate-700 dark:text-slate-200',
                column.align ? alignmentClasses[column.align] : alignmentClasses.left,
                column.class || '',
              ]"
            >
              {{ row[column.key as keyof typeof row] }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
type Alignment = "left" | "center" | "right";

interface ColumnDefinition {
  key: string;
  label: string;
  align?: Alignment;
  class?: string;
}

const props = withDefaults(
  defineProps<{
    columns: ColumnDefinition[];
    rows: Array<Record<string, unknown>>;
    rowKey?: string | ((row: Record<string, unknown>, index: number) => string);
    tableClass?: string;
  }>(),
  {
    tableClass: "",
  }
);

const alignmentClasses: Record<Alignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const resolveRowKey = (row: Record<string, unknown>, index: number) => {
  if (typeof props.rowKey === "function") {
    return props.rowKey(row, index);
  }
  if (typeof props.rowKey === "string") {
    return `${row[props.rowKey] ?? index}`;
  }
  return `${index}`;
};
</script>
