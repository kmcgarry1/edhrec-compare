<template>
  <div class="relative" ref="rootRef" @keydown="handleKeydown">
    <button
      ref="buttonRef"
      type="button"
      class="flex w-full items-center justify-between rounded-2xl border border-slate-300 bg-white/70 px-4 py-2 text-left text-sm font-medium text-slate-700 shadow-inner shadow-white/60 transition hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-60"
      :class="isOpen ? 'border-emerald-400 ring-2 ring-emerald-400' : ''"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :aria-controls="listboxId"
      @click="toggleDropdown"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <div
          v-if="selectedColorSymbols.length"
          class="flex items-center gap-1"
          aria-hidden="true"
        >
          <template
            v-for="(symbol, index) in selectedColorSymbols"
            :key="`selected-${symbol.color}-${index}`"
          >
            <img
              v-if="symbol.svg"
              :src="symbol.svg"
              alt=""
              aria-hidden="true"
              class="h-4 w-4"
              loading="lazy"
            />
            <span
              v-else
              class="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              aria-hidden="true"
            >
              {{ symbol.color }}
            </span>
          </template>
        </div>
        <div class="min-w-0">
          <p
            class="truncate text-sm"
            :class="
              selectedOption
                ? 'text-slate-700 dark:text-slate-100'
                : 'text-slate-400 dark:text-slate-500'
            "
          >
            {{ selectedOption?.label ?? placeholderText }}
          </p>
          <p
            v-if="selectedOption?.description"
            class="truncate text-xs text-slate-500 dark:text-slate-400"
          >
            {{ selectedOption.description }}
          </p>
        </div>
      </div>
      <svg
        class="ml-3 h-4 w-4 text-slate-500 transition-transform dark:text-slate-400"
        :class="isOpen ? 'rotate-180' : ''"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 0 1 1.08 1.04l-4.25 4.25a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="isOpen" class="absolute left-0 z-40 mt-1 w-full">
        <ul
          ref="listRef"
          :id="listboxId"
          role="listbox"
          tabindex="-1"
          class="max-h-64 w-full overflow-auto rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-2xl ring-1 ring-black/5 focus:outline-none dark:border-slate-700 dark:bg-slate-900/95"
          :aria-activedescendant="highlightedOptionId"
        >
          <li
            v-for="(option, index) in options"
            :key="option.value"
            :id="getOptionId(index)"
            role="option"
            :aria-selected="selectedIndex === index"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
            @mouseleave="highlightedIndex = -1"
            :ref="(el) => setOptionRef(el, index)"
            class="flex cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition"
            :class="getOptionClasses(index)"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <div
                  v-if="getOptionColorSymbols(option).length"
                  class="flex items-center gap-1"
                  aria-hidden="true"
                >
                  <template
                    v-for="(symbol, colorIndex) in getOptionColorSymbols(option)"
                    :key="`${option.value}-${symbol.color}-${colorIndex}`"
                  >
                    <img
                      v-if="symbol.svg"
                      :src="symbol.svg"
                      alt=""
                      aria-hidden="true"
                      class="h-4 w-4"
                      loading="lazy"
                    />
                    <span
                      v-else
                      class="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                      aria-hidden="true"
                    >
                      {{ symbol.color }}
                    </span>
                  </template>
                </div>
                <span class="truncate">
                  {{ option.label }}
                </span>
              </div>
              <p
                v-if="option.description"
                class="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
              >
                {{ option.description }}
              </p>
            </div>
            <svg
              v-if="selectedIndex === index"
              viewBox="0 0 20 20"
              class="h-4 w-4 text-emerald-500 dark:text-emerald-300"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.333a1 1 0 0 1-1.437.008l-3.5-3.5a1 1 0 0 1 1.414-1.414l2.793 2.793 6.543-6.613a1 1 0 0 1 1.431-.021Z"
                clip-rule="evenodd"
              />
            </svg>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type { ComponentPublicInstance } from "vue";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";

interface Option {
  value: string | number;
  label: string;
  description?: string;
  colors?: ReadonlyArray<string>;
}

const props = defineProps<{
  modelValue?: string | number;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string | number;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string | number): void;
}>();

const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();

const isOpen = ref(false);
const highlightedIndex = ref(-1);
const rootRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);
const listRef = ref<HTMLUListElement | null>(null);
const optionRefs = ref<Array<HTMLElement | null>>([]);
const listboxId = `dropdown-${Math.random().toString(36).slice(2, 9)}`;

const normalizedValue = computed(
  () => props.modelValue ?? props.defaultValue ?? ""
);

const selectedIndex = computed(() =>
  props.options.findIndex(
    (option) => option.value === normalizedValue.value
  )
);

const selectedOption = computed(() =>
  selectedIndex.value >= 0 ? props.options[selectedIndex.value] : null
);

const placeholderText = computed(
  () => props.placeholder ?? "Select an option"
);

const hasColorOptions = computed(() =>
  props.options.some((option) => (option.colors?.length ?? 0) > 0)
);

type ColorSymbol = { color: string; svg: string | null };

const normalizeColorKey = (color: string) =>
  color.replace(/[{}]/g, "").trim().toUpperCase();

const toSymbolToken = (color: string) => {
  const normalized = normalizeColorKey(color);
  if (!normalized) {
    return "";
  }
  return `{${normalized}}`;
};

const buildColorSymbols = (colors?: ReadonlyArray<string>): ColorSymbol[] =>
  (colors ?? [])
    .map((color) => {
      const normalized = normalizeColorKey(color);
      if (!normalized) {
        return null;
      }
      const token = toSymbolToken(color);
      return {
        color: normalized,
        svg: token ? getSvgForSymbol(token) : null,
      };
    })
    .filter((entry): entry is ColorSymbol => entry !== null);

const selectedColorSymbols = computed(() =>
  buildColorSymbols(selectedOption.value?.colors)
);

const getOptionColorSymbols = (option: Option) =>
  buildColorSymbols(option.colors);

const loadSymbolsIfNeeded = () => {
  if (hasColorOptions.value) {
    void ensureSymbolsLoaded();
  }
};

const highlightedOptionId = computed(() =>
  highlightedIndex.value >= 0 ? getOptionId(highlightedIndex.value) : undefined
);

const optionHighlightClass =
  "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100";
const optionDefaultClass =
  "text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800/70";

const getOptionClasses = (index: number) => [
  highlightedIndex.value === index
    ? optionHighlightClass
    : optionDefaultClass,
  selectedIndex.value === index ? "font-semibold" : "",
];

const getOptionId = (index: number) => `${listboxId}-option-${index}`;

const setOptionRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  optionRefs.value[index] = el as HTMLElement | null;
};

const ensureHighlightedVisible = (index: number) => {
  if (index < 0) {
    return;
  }
  const element = optionRefs.value[index];
  if (element && "scrollIntoView" in element) {
    element.scrollIntoView({ block: "nearest" });
  }
};

watch(highlightedIndex, (index) => {
  if (isOpen.value) {
    ensureHighlightedVisible(index);
  }
});

const openDropdown = async () => {
  if (props.disabled || !props.options.length) {
    return;
  }
  isOpen.value = true;
  highlightedIndex.value =
    selectedIndex.value >= 0 ? selectedIndex.value : 0;
  await nextTick();
  listRef.value?.focus();
};

const closeDropdown = (focusButton = true) => {
  if (!isOpen.value) {
    return;
  }
  isOpen.value = false;
  highlightedIndex.value = -1;
  if (focusButton) {
    buttonRef.value?.focus();
  }
};

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown();
  } else {
    void openDropdown();
  }
};

const selectOption = (option: Option) => {
  if (props.disabled) {
    return;
  }
  emit("update:modelValue", option.value);
  closeDropdown();
};

const selectHighlighted = () => {
  if (
    highlightedIndex.value >= 0 &&
    highlightedIndex.value < props.options.length
  ) {
    const option = props.options[highlightedIndex.value];
    if (option) {
      selectOption(option);
    }
  }
};

const moveHighlight = (delta: number) => {
  if (!props.options.length) {
    return;
  }
  let nextIndex = highlightedIndex.value;
  if (nextIndex === -1) {
    nextIndex =
      selectedIndex.value >= 0 ? selectedIndex.value : delta > 0 ? -1 : 0;
  }
  nextIndex =
    (nextIndex + delta + props.options.length) % props.options.length;
  highlightedIndex.value = nextIndex;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) {
    return;
  }

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (!isOpen.value) {
        void openDropdown();
      } else {
        moveHighlight(1);
      }
      break;
    case "ArrowUp":
      event.preventDefault();
      if (!isOpen.value) {
        void openDropdown();
      } else {
        moveHighlight(-1);
      }
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      if (!isOpen.value) {
        void openDropdown();
      } else {
        selectHighlighted();
      }
      break;
    case "Escape":
      if (isOpen.value) {
        event.preventDefault();
        closeDropdown();
      }
      break;
    default:
      break;
  }
};

const handleClickOutside = (event: Event) => {
  if (
    !isOpen.value ||
    !rootRef.value ||
    rootRef.value.contains(event.target as Node)
  ) {
    return;
  }
  closeDropdown(false);
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("touchstart", handleClickOutside);
  loadSymbolsIfNeeded();
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("touchstart", handleClickOutside);
});

watch(
  () => props.options,
  () => {
    optionRefs.value = [];
    if (isOpen.value) {
      highlightedIndex.value =
        selectedIndex.value >= 0 ? selectedIndex.value : 0;
    }
    loadSymbolsIfNeeded();
  }
);

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) {
      return;
    }
    highlightedIndex.value =
      selectedIndex.value >= 0 ? selectedIndex.value : highlightedIndex.value;
  }
);

watch(hasColorOptions, (value) => {
  if (value) {
    void ensureSymbolsLoaded();
  }
});
</script>
