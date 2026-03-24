<template>
  <CSurface
    :as="as"
    :size="size"
    :radius="radius"
    shadow="soft"
    :background="toneStyles.background"
    :border="toneStyles.border"
    class="c-notice"
    :role="role"
    :aria-live="ariaLive"
    v-bind="$attrs"
  >
    <CStack :gap="progress ? 'sm' : 'none'" class="min-w-0">
      <CInline
        align="start"
        justify="between"
        gap="md"
        class="min-w-0"
      >
        <CInline
          align="start"
          gap="md"
          class="min-w-0 flex-1"
        >
          <slot name="icon">
            <CText
              v-if="resolvedIcon"
              tag="span"
              variant="title"
              weight="bold"
              tone="inherit"
              class="min-w-5"
            >
              {{ resolvedIcon }}
            </CText>
          </slot>

          <CStack gap="xs" class="min-w-0 flex-1 text-left">
            <slot name="title">
              <CText
                v-if="title"
                tag="p"
                variant="title"
                weight="semibold"
                tone="inherit"
              >
                {{ title }}
              </CText>
            </slot>
            <slot :message="message">
              <CText
                v-if="message"
                tag="p"
                variant="body"
                :tone="bodyTone"
              >
                {{ message }}
              </CText>
            </slot>
          </CStack>
        </CInline>

        <slot name="actions">
          <CButton
            v-if="dismissible"
            type="button"
            variant="ghost"
            size="sm"
            @click="$emit('dismiss')"
          >
            {{ dismissLabel }}
          </CButton>
        </slot>
      </CInline>

      <slot name="progress">
        <CProgress
          v-if="progress"
          :current="progress.current"
          :total="progress.total"
          :tone="progressTone"
          aria-label="Progress"
        />
      </slot>
    </CStack>
  </CSurface>
</template>

<script setup lang="ts">
import { computed } from "vue";
import CButton from "./CButton.vue";
import CInline from "./CInline.vue";
import CProgress from "./CProgress.vue";
import CStack from "./CStack.vue";
import CSurface from "./CSurface.vue";
import CText from "./CText.vue";
import type {
  ProgressTone,
  SurfaceRadius,
  SurfaceSize,
  TextTone,
} from "./config";

type NoticeTone = "info" | "success" | "warn" | "danger" | "loading";

const props = withDefaults(
  defineProps<{
    as?: string;
    tone?: NoticeTone;
    title?: string | null;
    message?: string | null;
    icon?: string | null;
    dismissible?: boolean;
    dismissLabel?: string;
    progress?: { current: number; total: number } | null;
    role?: string;
    ariaLive?: "polite" | "assertive";
    size?: SurfaceSize;
    radius?: SurfaceRadius;
  }>(),
  {
    as: "div",
    tone: "info",
    title: null,
    message: null,
    icon: null,
    dismissible: false,
    dismissLabel: "Close",
    progress: null,
    role: "status",
    ariaLive: "polite",
    size: "md",
    radius: "xl",
  }
);

const toneStyles = computed(() => {
  if (props.tone === "success" || props.tone === "loading") {
    return {
      border: "border border-[color:var(--accent)]",
      background: "bg-[color:var(--accent-soft)]",
    };
  }
  if (props.tone === "warn") {
    return {
      border: "border border-[color:var(--warn)]",
      background: "bg-[color:var(--warn-soft)]",
    };
  }
  if (props.tone === "danger") {
    return {
      border: "border border-[color:var(--danger)]",
      background: "bg-[color:var(--danger-soft)]",
    };
  }
  return {
    border: "border border-[color:var(--border)]",
    background: "bg-[color:var(--surface)]",
  };
});

const resolvedIcon = computed(() => {
  if (props.icon) {
    return props.icon;
  }
  if (props.tone === "success") {
    return "OK";
  }
  if (props.tone === "warn") {
    return "!";
  }
  if (props.tone === "danger") {
    return "X";
  }
  if (props.tone === "loading") {
    return "...";
  }
  return "i";
});

const bodyTone = computed<TextTone>(() => {
  if (props.tone === "danger") {
    return "danger";
  }
  if (props.tone === "warn") {
    return "warn";
  }
  return "default";
});

const progressTone = computed<ProgressTone>(() => {
  if (props.tone === "warn") {
    return "warn";
  }
  if (props.tone === "danger") {
    return "danger";
  }
  return "accent";
});

defineEmits<{
  dismiss: [];
}>();
</script>

