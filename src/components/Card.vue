<template>
  <component :is="as" :class="computedClasses">
    <div v-if="hasHeader" class="mb-4">
      <slot name="header">
        <CText
          v-if="title"
          :tag="titleTag"
          variant="title"
          :tone="titleTone"
          class="leading-snug"
        >
          {{ title }}
        </CText>
        <CText
          v-if="subtitle"
          tag="p"
          variant="helper"
          :tone="subtitleTone"
          class="mt-1"
        >
          {{ subtitle }}
        </CText>
      </slot>
    </div>

    <slot />

    <footer v-if="slots.footer" class="mt-4">
      <slot name="footer" />
    </footer>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import { useLayoutDensity } from "../composables/useLayoutDensity";
import { CText } from "./core";

type Tone =
  | "default"
  | "muted"
  | "subtle"
  | "inverse"
  | "danger"
  | "success"
  | "warn"
  | "inherit";

const props = withDefaults(
  defineProps<{
    as?: string;
    padding?: string | null;
    rounded?: string | null;
    shadow?: string | null;
    border?: string | null;
    background?: string | null;
    fullWidth?: boolean;
    hover?: boolean;
    title?: string | null;
    subtitle?: string | null;
    titleTag?: string;
    titleTone?: Tone;
    subtitleTone?: Tone;
  }>(),
  {
    as: "div",
    padding: null,
    rounded: "rounded-2xl",
    shadow: "shadow-[var(--shadow-soft)]",
    border: "border border-[color:var(--border)]",
    background: "bg-[color:var(--surface)]",
    fullWidth: true,
    hover: false,
    title: null,
    subtitle: null,
    titleTag: "h3",
    titleTone: "default" as Tone,
    subtitleTone: "subtle" as Tone,
  }
);

const slots = useSlots();
const { spacing } = useLayoutDensity();

const hasHeader = computed(
  () => !!props.title || !!props.subtitle || !!slots.header
);

const resolvedPadding = computed(() => props.padding ?? spacing.value.cardPadding);

const computedClasses = computed(() =>
  [
    props.fullWidth ? "block w-full" : "",
    props.rounded,
    props.border,
    props.background,
    props.shadow,
    resolvedPadding.value,
    props.hover ? "card-hover" : "",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
