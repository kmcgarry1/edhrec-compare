<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
        Filters
      </span>
      <span class="text-[0.7rem] text-[color:var(--muted)]">
        EDHREC query controls
      </span>
    </div>
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label class="space-y-1 text-[0.8rem] text-[color:var(--text)]">
        <span :class="['text-[0.7rem] uppercase tracking-[0.24em] text-[color:var(--muted)]', spacing.labelText]">
          Bracket
        </span>
        <DropdownSelect
          aria-label="Select bracket"
          :options="bracketOptions"
          :model-value="bracket"
          placeholder="All"
          @update:model-value="setBracket"
        />
      </label>
      <label class="space-y-1 text-[0.8rem] text-[color:var(--text)]">
        <span :class="['text-[0.7rem] uppercase tracking-[0.24em] text-[color:var(--muted)]', spacing.labelText]">
          Budget
        </span>
        <DropdownSelect
          aria-label="Select budget modifier"
          :options="modifierOptions"
          :model-value="modifier"
          placeholder="Any"
          @update:model-value="setModifier"
        />
      </label>
      <label class="space-y-1 text-[0.8rem] text-[color:var(--text)]">
        <span :class="['text-[0.7rem] uppercase tracking-[0.24em] text-[color:var(--muted)]', spacing.labelText]">
          Page
        </span>
        <DropdownSelect
          aria-label="Select page type"
          :options="pageTypeOptions"
          :model-value="pageType"
          placeholder="Commander"
          @update:model-value="setPageType"
        />
      </label>
      <label class="space-y-1 text-[0.8rem] text-[color:var(--text)]">
        <span :class="['text-[0.7rem] uppercase tracking-[0.24em] text-[color:var(--muted)]', spacing.labelText]">
          Companion
        </span>
        <DropdownSelect
          aria-label="Select companion"
          :options="companionOptions"
          :model-value="companion"
          placeholder="None"
          @update:model-value="setCompanion"
        />
      </label>
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
