<template>
  <div ref="rootRef" class="space-y-2" @focusout="handleFocusOut">
    <label
      :for="fieldId"
      class="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text)]"
      :class="{ 'sr-only': labelSrOnly }"
    >
      {{ label }}
    </label>
    <div class="flex">
      <div
        class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-base text-[color:var(--text)] shadow-[var(--shadow-soft)] focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
        :class="containerClass"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4 text-[color:var(--muted)]"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="iconPath" />
        </svg>
        <input
          :id="fieldId"
          ref="inputRef"
          :value="modelValue"
          type="text"
          :placeholder="placeholder"
          :aria-label="label"
          :aria-describedby="describedBy"
          :aria-controls="showListbox ? listboxId : undefined"
          :aria-activedescendant="activeDescendant"
          :aria-expanded="showListbox"
          aria-autocomplete="list"
          :disabled="disabled"
          role="combobox"
          class="min-w-0 flex-1 bg-transparent text-base text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none disabled:cursor-not-allowed"
          @focus="handleFocus"
          @keydown="handleKeydown"
          @input="handleInput"
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
    <div
      v-if="helperText || loading"
      class="flex items-center justify-between text-xs text-[color:var(--muted)]"
    >
      <p :id="helperId" :class="{ 'sr-only': helperSrOnly }">
        {{ helperText }}
      </p>
      <span v-if="loading">Searching...</span>
    </div>
    <p v-if="hasWarning" :id="warningId" class="text-xs text-[color:var(--warn)]" role="status">
      {{ warningText }}
    </p>
    <p v-else-if="hasError" :id="errorId" class="text-xs text-[color:var(--danger)]" role="alert">
      {{ error }}
    </p>
    <Card
      v-if="showListbox"
      as="div"
      padding="p-0"
      rounded="rounded-xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface-strong)]"
      shadow="shadow-[var(--shadow-soft)]"
      class="max-h-64 overflow-y-auto"
      aria-live="polite"
    >
      <div
        v-if="resultTypeLabel"
        class="border-b border-[color:var(--border)] px-3.5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]"
      >
        {{ resultTypeLabel }}
      </div>
      <ul :id="listboxId" role="listbox" class="divide-y divide-[color:var(--border)]">
        <li
          v-for="(option, index) in displayedResults"
          :id="optionDomId(index)"
          :key="option.id"
          role="option"
          :aria-selected="highlightedIndex === index"
          class="cursor-pointer px-3.5 py-2.5 text-[color:var(--text)] transition"
          :class="
            highlightedIndex === index
              ? 'bg-[color:var(--accent-soft)]'
              : 'hover:bg-[color:var(--accent-soft)]'
          "
          @click="selectOption(option.name)"
          @mousedown.prevent="selectOption(option.name)"
          @mousemove="highlightedIndex = index"
        >
          {{ option.name }}
        </li>
      </ul>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import Card from "../Card.vue";

type CommanderOption = { id: string; name: string };

const props = withDefaults(
  defineProps<{
    fieldId: string;
    label: string;
    placeholder: string;
    modelValue: string;
    results: CommanderOption[];
    recentResults?: CommanderOption[];
    loading: boolean;
    error?: string;
    helperText: string;
    disabled?: boolean;
    warningText?: string;
    iconPath: string;
    recentLabel?: string;
    searchResultsLabel?: string;
    showClear?: boolean;
    labelSrOnly?: boolean;
    helperSrOnly?: boolean;
  }>(),
  {
    recentResults: () => [],
    disabled: false,
    warningText: "",
    error: "",
    recentLabel: "Recent commanders",
    searchResultsLabel: "",
    showClear: false,
    labelSrOnly: false,
    helperSrOnly: false,
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
const listboxId = computed(() => `${props.fieldId}-listbox`);
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxExpanded = ref(false);
const highlightedIndex = ref(-1);

const hasWarning = computed(() => Boolean(props.disabled && props.warningText));
const hasError = computed(() => !hasWarning.value && Boolean(props.error));
const usingRecentResults = computed(
  () =>
    listboxExpanded.value &&
    !props.disabled &&
    props.modelValue.trim().length === 0 &&
    props.recentResults.length > 0
);
const displayedResults = computed(() =>
  usingRecentResults.value ? props.recentResults : props.results
);
const showListbox = computed(() => listboxExpanded.value && displayedResults.value.length > 0);
const resultTypeLabel = computed(() => {
  if (usingRecentResults.value) {
    return props.recentLabel;
  }
  return props.searchResultsLabel;
});
const activeDescendant = computed(() =>
  showListbox.value && highlightedIndex.value >= 0
    ? optionDomId(highlightedIndex.value)
    : undefined
);

const describedBy = computed(() => {
  const ids = props.helperText ? [helperId.value] : [];
  if (hasWarning.value) {
    ids.push(warningId.value);
  } else if (hasError.value) {
    ids.push(errorId.value);
  }
  return ids.join(" ");
});

const containerClass = computed(() => (props.disabled ? "opacity-60" : ""));

const optionDomId = (index: number) => `${props.fieldId}-option-${index}`;

const syncHighlightedIndex = () => {
  if (!showListbox.value) {
    highlightedIndex.value = -1;
    return;
  }
  if (highlightedIndex.value < 0 || highlightedIndex.value >= displayedResults.value.length) {
    highlightedIndex.value = 0;
  }
};

const focusHighlightedOption = async () => {
  await nextTick();
  if (!showListbox.value || highlightedIndex.value < 0) {
    return;
  }
  const element = document.getElementById(optionDomId(highlightedIndex.value));
  element?.scrollIntoView({ block: "nearest" });
};

const closeListbox = () => {
  listboxExpanded.value = false;
  highlightedIndex.value = -1;
};

const openListbox = () => {
  if (props.disabled) {
    closeListbox();
    return;
  }
  listboxExpanded.value = true;
  syncHighlightedIndex();
};

const selectOption = (name: string) => {
  emit("select", name);
  closeListbox();
  void nextTick(() => inputRef.value?.focus());
};

const handleInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
  openListbox();
};

const handleFocus = () => {
  openListbox();
};

const handleFocusOut = () => {
  window.setTimeout(() => {
    if (!rootRef.value?.contains(document.activeElement)) {
      closeListbox();
    }
  }, 0);
};

const handleKeydown = async (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    openListbox();
    if (!displayedResults.value.length) {
      return;
    }
    highlightedIndex.value =
      highlightedIndex.value >= displayedResults.value.length - 1
        ? 0
        : highlightedIndex.value + 1;
    await focusHighlightedOption();
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    openListbox();
    if (!displayedResults.value.length) {
      return;
    }
    highlightedIndex.value =
      highlightedIndex.value <= 0
        ? displayedResults.value.length - 1
        : highlightedIndex.value - 1;
    await focusHighlightedOption();
    return;
  }

  if (event.key === "Enter" && showListbox.value && highlightedIndex.value >= 0) {
    event.preventDefault();
    const option = displayedResults.value[highlightedIndex.value];
    if (option) {
      selectOption(option.name);
    }
    return;
  }

  if (event.key === "Escape" && showListbox.value) {
    event.preventDefault();
    closeListbox();
  }
};

watch(displayedResults, () => {
  syncHighlightedIndex();
});

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      closeListbox();
    }
  }
);
</script>
