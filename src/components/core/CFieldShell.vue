<template>
  <component :is="as" :class="classes" v-bind="$attrs">
    <CStack :gap="gap" class="min-w-0">
      <CInline
        v-if="hasHeader"
        align="start"
        justify="between"
        gap="sm"
        class="min-w-0"
      >
        <CStack gap="xs" class="min-w-0 flex-1">
          <slot name="label">
            <CText
              v-if="label"
              :tag="labelAs"
              :for="labelAs === 'label' ? labelFor : undefined"
              variant="eyebrow"
              tone="inherit"
            >
              {{ label }}
            </CText>
          </slot>
          <slot name="helper">
            <CText
              v-if="helper"
              tag="p"
              variant="helper"
              tone="muted"
            >
              {{ helper }}
            </CText>
          </slot>
        </CStack>
        <slot name="meta" />
      </CInline>

      <slot />

      <slot name="status">
        <CText
          v-if="statusText"
          tag="p"
          variant="helper"
          :tone="error ? 'danger' : statusTone"
        >
          {{ statusText }}
        </CText>
      </slot>
    </CStack>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CInline from "./CInline.vue";
import CStack from "./CStack.vue";
import CText from "./CText.vue";
import { cx, type Gap, type TextTone } from "./config";

const props = withDefaults(
  defineProps<{
    as?: string;
    labelAs?: string;
    label?: string | null;
    helper?: string | null;
    status?: string | null;
    error?: string | null;
    labelFor?: string | null;
    gap?: Gap;
    statusTone?: TextTone;
  }>(),
  {
    as: "div",
    labelAs: "label",
    label: null,
    helper: null,
    status: null,
    error: null,
    labelFor: null,
    gap: "sm",
    statusTone: "muted",
  }
);

const hasHeader = computed(() => !!props.label || !!props.helper);
const statusText = computed(() => props.error ?? props.status);
const classes = computed(() => cx("c-field-shell min-w-0"));
</script>
