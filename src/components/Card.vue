<template>
  <CSurface
    :as="as"
    :size="resolvedSize"
    radius="xl"
    :shadow="resolvedShadow"
    :rounded="rounded"
    :border="border"
    :background="background"
    :shadow-class="shadow"
    :padding-class="padding"
    :sheen="surfaceSheen"
    :full-width="fullWidth"
    :class="cardClass"
  >
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
  </CSurface>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import { CSurface, CText } from "./core";
import type { SurfaceShadow, SurfaceSize } from "./core/config";

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

const hasHeader = computed(
  () => !!props.title || !!props.subtitle || !!slots.header
);

const surfaceSheen = computed(() => {
  const background = props.background ?? "";
  if (!background) {
    return false;
  }
  if (!background.includes("var(--surface")) {
    return false;
  }
  if (background.includes("surface-muted")) {
    return false;
  }
  return true;
});

const resolvedSize = computed<SurfaceSize>(() => (props.padding ? "none" : "adaptive"));
const resolvedShadow = computed<SurfaceShadow>(() => (props.shadow ? "none" : "soft"));
const cardClass = computed(() => (props.hover ? "card-hover" : ""));
</script>
