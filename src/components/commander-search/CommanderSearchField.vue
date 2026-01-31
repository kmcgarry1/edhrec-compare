<template>
  <div class="space-y-2">
    <label
      :for="fieldId"
      class="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text)]"
    >
      {{ label }}
    </label>
    <div class="flex">
      <div
        class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-base text-[color:var(--text)] shadow-[var(--shadow-soft)] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        :class="containerClass"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4 text-[color:var(--muted)]" fill="currentColor" aria-hidden="true">
          <path :d="iconPath" />
        </svg>
        <input
          :id="fieldId"
          :value="modelValue"
          type="text"
          :placeholder="placeholder"
          :aria-label="label"
          :aria-describedby="describedBy"
          :disabled="disabled"
          class="min-w-0 flex-1 bg-transparent text-base text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none disabled:cursor-not-allowed"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="showClear"
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :aria-label="`Clear ${label.toLowerCase()} search`"
          @click="emit('clear')"
        >
          Clear
        </button>
      </div>
    </div>
    <div class="flex items-center justify-between text-xs text-[color:var(--muted)]">
      <p :id="helperId">
        {{ helperText }}
      </p>
      <span v-if="loading">Searching...</span>
    </div>
    <p
      v-if="hasWarning"
      :id="warningId"
      class="text-xs text-[color:var(--warn)]"
      role="status"
    >
      {{ warningText }}
    </p>
    <p
      v-else-if="hasError"
      :id="errorId"
      class="text-xs text-[color:var(--danger)]"
      role="alert"
    >
      {{ error }}
    </p>
    <Card
      v-if="results.length"
      as="div"
      padding="p-0"
      rounded="rounded-xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface-strong)]"
      shadow="shadow-[var(--shadow-soft)]"
      class="max-h-64 overflow-y-auto"
      aria-live="polite"
    >
      <ul class="divide-y divide-[color:var(--border)]">
        <li
          v-for="option in results"
          :key="option.id"
          tabindex="0"
          class="cursor-pointer px-3.5 py-2.5 text-[color:var(--text)] transition hover:bg-[color:var(--accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          @click="emit('select', option.name)"
          @keydown.enter="emit('select', option.name)"
          @keydown.space.prevent="emit('select', option.name)"
        >
          {{ option.name }}
        </li>
      </ul>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "../Card.vue";

type CommanderOption = { id: string; name: string };

const props = withDefaults(
  defineProps<{
    fieldId: string;
    label: string;
    placeholder: string;
    modelValue: string;
    results: CommanderOption[];
    loading: boolean;
    error?: string;
    helperText: string;
    disabled?: boolean;
    warningText?: string;
    iconPath: string;
    showClear?: boolean;
  }>(),
  {
    disabled: false,
    warningText: "",
    error: "",
    showClear: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  select: [name: string];
  clear: [];
}>();

const helperId = computed(() => `${props.fieldId}-helper-text`);
const errorId = computed(() => `${props.fieldId}-error-text`);
const warningId = computed(() => `${props.fieldId}-warning-text`);

const hasWarning = computed(() => Boolean(props.disabled && props.warningText));
const hasError = computed(() => !hasWarning.value && Boolean(props.error));

const describedBy = computed(() => {
  const ids = [helperId.value];
  if (hasWarning.value) {
    ids.push(warningId.value);
  } else if (hasError.value) {
    ids.push(errorId.value);
  }
  return ids.join(" ");
});

const containerClass = computed(() => (props.disabled ? "opacity-60" : ""));
</script>
