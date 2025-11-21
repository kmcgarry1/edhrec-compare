<template>
  <Teleport v-if="!isInline" :to="stackTargetSelector">
    <Transition name="fade">
      <div
        v-if="isVisible"
        :class="containerClass"
        aria-live="polite"
        role="status"
      >
        <div
          v-bind="attrs"
          class="loading-pulse pointer-events-auto rounded-2xl border border-emerald-400/40 bg-emerald-100/70 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm shadow-emerald-200/60 dark:border-emerald-400/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:shadow-black/30"
        >
          <div class="flex items-center justify-between gap-3 px-4 py-2">
            <div class="flex items-center gap-3">
              <!-- Animated spinner -->
              <svg
                class="h-5 w-5 animate-spin text-emerald-700 dark:text-emerald-300"
                viewBox="0 0 24 24"
                fill="none"
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

              <!-- Loading message -->
              <span class="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                <slot :message="messageToDisplay">{{ messageToDisplay }}</slot>
              </span>
            </div>

            <!-- Progress indicator -->
            <span
              v-if="progressInfo"
              class="text-sm font-medium text-emerald-800/90 dark:text-emerald-200/90"
            >
              {{ progressInfo.current }} / {{ progressInfo.total }}
            </span>
          </div>

          <!-- Progress bar -->
          <div v-if="progressInfo" class="h-1 bg-emerald-200 dark:bg-emerald-900">
            <div
              class="h-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-400"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <div
    v-else
    :class="containerClass"
    aria-live="polite"
    role="status"
  >
    <div
      v-bind="attrs"
      :aria-hidden="isVisible ? 'false' : 'true'"
      class="pointer-events-auto rounded-2xl border border-emerald-400/40 bg-emerald-100/70 px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm shadow-emerald-200/60 transition duration-200 ease-out dark:border-emerald-400/50 dark:bg-emerald-950/40 dark:text-emerald-100 dark:shadow-black/30"
      :class="[
        isVisible
          ? 'opacity-100 translate-y-0 visible loading-pulse'
          : 'pointer-events-none opacity-0 -translate-y-1 invisible'
      ]"
    >
      <div class="flex items-center justify-between gap-3 px-4 py-2">
        <div class="flex items-center gap-3">
          <!-- Animated spinner -->
          <svg
            class="h-5 w-5 animate-spin text-emerald-700 dark:text-emerald-300"
            viewBox="0 0 24 24"
            fill="none"
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

          <!-- Loading message -->
          <span class="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            <slot :message="messageToDisplay">{{ messageToDisplay }}</slot>
          </span>
        </div>

        <!-- Progress indicator -->
        <span
          v-if="progressInfo"
          class="text-sm font-medium text-emerald-800/90 dark:text-emerald-200/90"
        >
          {{ progressInfo.current }} / {{ progressInfo.total }}
        </span>
      </div>

      <!-- Progress bar -->
      <div v-if="progressInfo" class="h-1 bg-emerald-200 dark:bg-emerald-900">
        <div
          class="h-full bg-emerald-600 transition-all duration-300 dark:bg-emerald-400"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, onMounted, watch } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";

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

const progressPercent = computed(() => {
  if (!progressInfo.value) return 0;
  const { current, total } = progressInfo.value;
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
});

const stackDefaultClass =
  "pointer-events-none flex w-full max-w-md justify-center";
const inlineDefaultClass = "w-full flex justify-center";

const containerClass = computed(() => {
  if (props.placementClass) {
    return props.placementClass;
  }
  return props.inline ? inlineDefaultClass : stackDefaultClass;
});
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
