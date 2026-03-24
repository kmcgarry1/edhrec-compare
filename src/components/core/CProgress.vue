<template>
  <component :is="as" :class="wrapperClasses" v-bind="$attrs">
    <div
      v-if="showHeader"
      class="flex items-center justify-between gap-3"
    >
      <slot name="label">
        <CText
          v-if="label"
          tag="span"
          variant="helper"
          :tone="labelTone"
        >
          {{ label }}
        </CText>
      </slot>
      <slot name="value">
        <CText
          v-if="showValue"
          tag="span"
          variant="helper"
          :tone="valueTone"
        >
          {{ valueLabel }}
        </CText>
      </slot>
    </div>

    <div
      class="overflow-hidden rounded-full bg-[color:var(--surface-muted)]"
      :class="trackClasses"
      role="progressbar"
      :aria-label="ariaLabel"
      :aria-valuemin="0"
      :aria-valuemax="100"
      :aria-valuenow="Math.round(percent)"
    >
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="fillClasses"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  cx,
  progressFillClasses,
  progressTrackClasses,
  type ProgressSize,
  type ProgressTone,
  type TextTone,
} from "./config";
import CText from "./CText.vue";

const props = withDefaults(
  defineProps<{
    as?: string;
    current?: number | null;
    total?: number | null;
    value?: number | null;
    tone?: ProgressTone;
    size?: ProgressSize;
    label?: string | null;
    showValue?: boolean;
    ariaLabel?: string;
    labelTone?: TextTone;
    valueTone?: TextTone;
  }>(),
  {
    as: "div",
    current: null,
    total: null,
    value: null,
    tone: "accent",
    size: "sm",
    label: null,
    showValue: false,
    ariaLabel: "Progress",
    labelTone: "muted",
    valueTone: "muted",
  }
);

const percent = computed(() => {
  if (props.total !== null && props.total !== undefined) {
    if (!props.total) {
      return 0;
    }
    return Math.min(
      Math.max((Number(props.current ?? 0) / props.total) * 100, 0),
      100
    );
  }
  return Math.min(Math.max(Number(props.value ?? 0), 0), 100);
});

const valueLabel = computed(() => {
  if (props.total !== null && props.total !== undefined) {
    return `${Number(props.current ?? 0)} / ${props.total}`;
  }
  return `${Math.round(percent.value)}%`;
});

const showHeader = computed(() => !!props.label || props.showValue);
const wrapperClasses = computed(() => cx("c-progress flex flex-col gap-2"));
const trackClasses = computed(() => progressTrackClasses[props.size]);
const fillClasses = computed(() => progressFillClasses[props.tone]);
</script>

