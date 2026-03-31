<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-black/70"
      :class="isMobileViewport ? 'p-0' : 'backdrop-blur-[2px]'"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="dialogTitleId"
      :aria-describedby="dialogDescriptionId"
      @click.self="emit('close')"
      @escape-pressed="emit('close')"
    >
      <div
        v-if="!isMobileViewport"
        ref="dialogRef"
        class="absolute inset-y-0 right-0 flex w-full max-w-[31rem] flex-col overflow-hidden border-l border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-[var(--shadow)]"
        data-testid="dashboard-utility-tray"
      >
        <header class="border-b border-[color:var(--border)] px-4 py-4 sm:px-5">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CText :id="dialogTitleId" tag="p" variant="eyebrow" tone="muted">
                {{ eyebrow }}
              </CText>
              <CText tag="h2" variant="title" class="text-lg">
                {{ title }}
              </CText>
              <CText :id="dialogDescriptionId" tag="p" variant="helper" tone="muted">
                {{ description }}
              </CText>
            </div>
            <CButton type="button" variant="soft" size="sm" @click="emit('close')"> Close </CButton>
          </div>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <slot />
        </div>
      </div>

      <div
        v-else
        ref="dialogRef"
        class="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[32px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] shadow-[var(--shadow)]"
        data-testid="dashboard-utility-sheet"
      >
        <div class="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[color:var(--border)]" aria-hidden="true" />
        <header class="border-b border-[color:var(--border)] px-4 pb-4 pt-3">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CText :id="dialogTitleId" tag="p" variant="eyebrow" tone="muted">
                {{ eyebrow }}
              </CText>
              <CText tag="h2" variant="title" class="text-lg">
                {{ title }}
              </CText>
              <CText :id="dialogDescriptionId" tag="p" variant="helper" tone="muted">
                {{ description }}
              </CText>
            </div>
            <CButton type="button" variant="soft" size="sm" @click="emit('close')"> Close </CButton>
          </div>
        </header>

        <div class="max-h-[calc(88vh-8.5rem)] overflow-y-auto px-4 py-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useFocusTrap } from "../../composables/useFocusTrap";
import { CButton, CText } from "../core";

const MOBILE_BREAKPOINT_PX = 1280;

const props = withDefaults(
  defineProps<{
    open: boolean;
    eyebrow?: string;
    title: string;
    description: string;
  }>(),
  {
    eyebrow: "Dashboard utilities",
  }
);

const emit = defineEmits<{
  close: [];
}>();

const dialogRef = ref<HTMLElement | null>(null);
const isMobileViewport = ref(typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT_PX : false);
const trapOpen = computed(() => props.open);
const { activate, deactivate } = useFocusTrap(dialogRef, trapOpen);
const idBase = `dashboard-utility-${Math.random().toString(36).slice(2, 9)}`;
const dialogTitleId = `${idBase}-title`;
const dialogDescriptionId = `${idBase}-description`;

const syncViewportMode = () => {
  if (typeof window === "undefined") {
    return;
  }
  isMobileViewport.value = window.innerWidth < MOBILE_BREAKPOINT_PX;
};

watch(
  trapOpen,
  (isOpen) => {
    if (isOpen) {
      activate();
      return;
    }
    deactivate();
  },
  { immediate: true }
);

onMounted(() => {
  syncViewportMode();
  window.addEventListener("resize", syncViewportMode, { passive: true });
});

onBeforeUnmount(() => {
  deactivate();
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncViewportMode);
  }
});
</script>
