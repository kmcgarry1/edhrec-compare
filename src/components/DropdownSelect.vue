<template>
  <div class="relative">
    <select
      :value="modelValue ?? defaultValue"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
      :disabled="disabled"
      class="w-full rounded-2xl border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-inner shadow-white/60 transition hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string | number;
  label: string;
}

defineProps<{
  modelValue: string | number;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string | number;
}>();

defineEmits<{
  "update:modelValue": [value: string | number];
}>();
</script>
