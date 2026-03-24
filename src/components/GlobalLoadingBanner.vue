<template>
  <Teleport
    :to="stackTargetSelector"
    :disabled="isInline"
  >
    <div :class="containerClass">
      <Transition name="fade">
        <CNotice
          v-if="!isInline ? isVisible : true"
          v-bind="attrs"
          tone="loading"
          :message="messageToDisplay"
          :progress="progressInfo ?? null"
          :aria-hidden="isInline ? String(!isVisible) : undefined"
          :class="inlineNoticeClass"
        >
          <template #icon>
            <svg
              class="h-5 w-5 text-[color:var(--accent)]"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </template>

          <template #default="{ message }">
            <CText tag="span" variant="body" weight="medium">
              <slot :message="message">{{ message }}</slot>
            </CText>
          </template>

          <template #actions>
            <CText
              v-if="progressInfo"
              tag="span"
              variant="body"
              tone="muted"
              weight="medium"
            >
              {{ progressInfo.current }} / {{ progressInfo.total }}
            </CText>
          </template>
        </CNotice>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, useAttrs, watch } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { CNotice, CText } from "./core";

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    scope?: string;
    placementClass?: string;
    inline?: boolean;
  }>(),
  {
    inline: false,
  }
);

const STACK_TARGET_ID = "global-loading-stack";
const STACK_CLASS =
  "pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-3 px-4";

const ensureStackContainer = () => {
  if (typeof document === "undefined") {
    return;
  }
  let existing = document.getElementById(STACK_TARGET_ID);
  if (!existing) {
    existing = document.createElement("div");
    existing.id = STACK_TARGET_ID;
    document.body.appendChild(existing);
  }
  existing.className = STACK_CLASS;
};

const shouldUseStack = computed(() => !props.inline);

if (shouldUseStack.value) {
  ensureStackContainer();
}

onMounted(() => {
  if (shouldUseStack.value) {
    ensureStackContainer();
  }
});

watch(shouldUseStack, (useStack) => {
  if (useStack) {
    ensureStackContainer();
  }
});

const stackTargetSelector = `#${STACK_TARGET_ID}`;

const attrs = useAttrs();
const {
  isLoading,
  loadingMessage,
  loadingProgress,
  getScopeLoading,
  getScopeMessage,
  getScopeProgress,
} = useGlobalLoading();

const scopeName = props.scope ?? "global";
const scopedLoading = props.scope ? getScopeLoading(scopeName) : null;
const scopedMessage = props.scope ? getScopeMessage(scopeName) : null;
const scopedProgress = props.scope ? getScopeProgress(scopeName) : null;

const isVisible = computed(() =>
  scopedLoading ? scopedLoading.value : isLoading.value
);

const isInline = computed(() => props.inline);

const messageToDisplay = computed(() =>
  scopedMessage ? scopedMessage.value : loadingMessage.value
);

const progressInfo = computed(() =>
  scopedProgress ? scopedProgress.value : loadingProgress.value
);

const stackDefaultClass =
  "pointer-events-none flex w-full max-w-md justify-center";
const inlineDefaultClass = "flex w-full justify-center";

const containerClass = computed(() => {
  if (props.placementClass) {
    return props.placementClass;
  }
  return props.inline ? inlineDefaultClass : stackDefaultClass;
});

const inlineNoticeClass = computed(() =>
  !props.inline
    ? ""
    : isVisible.value
      ? "pointer-events-auto visible translate-y-0 opacity-100 transition duration-200 ease-out"
      : "pointer-events-none invisible -translate-y-1 opacity-0 transition duration-200 ease-out"
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
