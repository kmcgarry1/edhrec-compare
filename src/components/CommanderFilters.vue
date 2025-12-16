<template>
  <div class="flex flex-wrap items-center gap-2 sm:gap-3">
    <span
      class="rounded-full border border-slate-200/80 bg-white px-2 py-1 font-semibold uppercase tracking-[0.28em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
      :class="spacing.labelText"
    >
      Filters
    </span>
    <div class="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
      <div class="flex items-center gap-2 text-[0.8rem] text-slate-600 dark:text-slate-300">
        <span :class="['text-slate-500 dark:text-slate-400', spacing.labelText]">Bracket</span>
        <div class="w-32 sm:w-36">
          <DropdownSelect
            aria-label="Select bracket"
            :options="bracketOptions"
            :model-value="bracket"
            placeholder="All"
            @update:model-value="setBracket"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 text-[0.8rem] text-slate-600 dark:text-slate-300">
        <span :class="['text-slate-500 dark:text-slate-400', spacing.labelText]">Budget</span>
        <div class="w-32 sm:w-36">
          <DropdownSelect
            aria-label="Select budget modifier"
            :options="modifierOptions"
            :model-value="modifier"
            placeholder="Any"
            @update:model-value="setModifier"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 text-[0.8rem] text-slate-600 dark:text-slate-300">
        <span :class="['text-slate-500 dark:text-slate-400', spacing.labelText]">Page</span>
        <div class="w-32 sm:w-36">
          <DropdownSelect
            aria-label="Select page type"
            :options="pageTypeOptions"
            :model-value="pageType"
            placeholder="Commander"
            @update:model-value="setPageType"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 text-[0.8rem] text-slate-600 dark:text-slate-300">
        <span :class="['text-slate-500 dark:text-slate-400', spacing.labelText]">Companion</span>
        <div class="w-32 sm:w-36">
          <DropdownSelect
            aria-label="Select companion"
            :options="companionOptions"
            :model-value="companion"
            placeholder="None"
            @update:model-value="setCompanion"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  EDHRECCompanion,
  EDHRECBracket,
  EDHRECPageModifier,
  EDHRECPageType,
} from "./helpers/enums";
import { DropdownSelect } from ".";
import { toRefs } from "vue";
import { useLayoutDensity } from "../composables/useLayoutDensity";

const props = defineProps<{
  bracket: string;
  modifier: string;
  pageType: string;
  companion: string;
}>();

const emit = defineEmits<{
  "update:bracket": [string];
  "update:modifier": [string];
  "update:pageType": [string];
  "update:companion": [string];
}>();

const bracketOptions = Object.values(EDHRECBracket);
const modifierOptions = Object.values(EDHRECPageModifier);
const pageTypeOptions = Object.values(EDHRECPageType);
const companionOptions = Object.values(EDHRECCompanion);

const setBracket = (value: string | number) => {
  emit("update:bracket", String(value));
};
const setModifier = (value: string | number) => {
  emit("update:modifier", String(value));
};
const setPageType = (value: string | number) => {
  emit("update:pageType", String(value));
};
const setCompanion = (value: string | number) => {
  emit("update:companion", String(value));
};

const { bracket, modifier, pageType, companion } = toRefs(props);
const { spacing } = useLayoutDensity();

const __templateBindings = {
  DropdownSelect,
  bracketOptions,
  modifierOptions,
  pageTypeOptions,
  companionOptions,
  setBracket,
  setModifier,
  setPageType,
  setCompanion,
  bracket,
  modifier,
  pageType,
  companion,
};
void __templateBindings;
</script>
