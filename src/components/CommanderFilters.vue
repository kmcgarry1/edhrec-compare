<template>
  <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Bracket
      </p>
      <DropdownSelect
        :options="bracketOptions"
        :model-value="bracket"
        placeholder="Select Bracket"
        @update:model-value="setBracket"
      />
    </div>
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Budget
      </p>
      <DropdownSelect
        :options="modifierOptions"
        :model-value="modifier"
        placeholder="Select Modifier"
        @update:model-value="setModifier"
      />
    </div>
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Page Type
      </p>
      <DropdownSelect
        :options="pageTypeOptions"
        :model-value="pageType"
        placeholder="Select Page Type"
        @update:model-value="setPageType"
      />
    </div>
    <div class="space-y-1">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Companion
      </p>
      <DropdownSelect
        :options="companionOptions"
        :model-value="companion"
        placeholder="Select Companion"
        @update:model-value="setCompanion"
      />
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
