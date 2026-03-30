<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-1"
  >
    <div
      v-if="open && !isMobileViewport"
      ref="desktopPanelRef"
      class="absolute right-0 top-full z-40 mt-3 w-full max-w-[32rem]"
      data-testid="dashboard-settings-panel"
    >
      <Card
        variant="command"
        padding="p-4 sm:p-5"
        rounded="rounded-[30px]"
        shadow="shadow-[var(--shadow)]"
        class="space-y-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CText tag="p" variant="eyebrow" tone="muted"> Workspace settings </CText>
            <CText tag="h2" variant="title" class="text-lg"> Collection, export, and display </CText>
            <CText tag="p" variant="helper" tone="muted">
              Route-level controls stay tucked here so the commander header can stay focused.
            </CText>
          </div>
          <CButton type="button" variant="soft" size="sm" @click="emit('close')"> Close </CButton>
        </div>

        <DashboardSettingsContent
          :has-csv-data="hasCsvData"
          :inventory-summary="inventorySummary"
          :decklist-text="decklistText"
          :decklist-section-count="decklistSectionCount"
          :export-helper-text="exportHelperText"
          :copied="copied"
          :density="density"
          :density-options="densityOptions"
          :theme="theme"
          :background-enabled="backgroundEnabled"
          @open-upload="emit('open-upload')"
          @copy="emit('copy')"
          @download="emit('download')"
          @density-change="emit('density-change', $event)"
          @toggle-theme="emit('toggle-theme')"
          @toggle-background="emit('toggle-background')"
        />
      </Card>
    </div>
  </Transition>

  <Teleport to="body">
    <div
      v-if="open && isMobileViewport"
      ref="mobileDialogRef"
      class="fixed inset-0 z-50 flex items-end bg-black/75 p-4 sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="dialogTitleId"
      :aria-describedby="dialogDescriptionId"
      tabindex="-1"
      data-testid="dashboard-settings-dialog"
      @click.self="emit('close')"
      @escape-pressed="emit('close')"
    >
      <div class="w-full max-w-2xl">
        <Card
          variant="command"
          padding="p-4 sm:p-5"
          rounded="rounded-[30px]"
          shadow="shadow-[var(--shadow)]"
          class="max-h-[90vh] space-y-4 overflow-y-auto"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CText :id="dialogTitleId" tag="p" variant="eyebrow" tone="muted">
                Workspace settings
              </CText>
              <CText tag="h2" variant="title" class="text-lg"> Collection, export, and display </CText>
              <CText :id="dialogDescriptionId" tag="p" variant="helper" tone="muted">
                Route-level controls stay tucked here so the commander header can stay focused.
              </CText>
            </div>
            <CButton type="button" variant="soft" size="sm" @click="emit('close')"> Close </CButton>
          </div>

          <DashboardSettingsContent
            :has-csv-data="hasCsvData"
            :inventory-summary="inventorySummary"
            :decklist-text="decklistText"
            :decklist-section-count="decklistSectionCount"
            :export-helper-text="exportHelperText"
            :copied="copied"
            :density="density"
            :density-options="densityOptions"
            :theme="theme"
            :background-enabled="backgroundEnabled"
            @open-upload="emit('open-upload')"
            @copy="emit('copy')"
            @download="emit('download')"
            @density-change="emit('density-change', $event)"
            @toggle-theme="emit('toggle-theme')"
            @toggle-background="emit('toggle-background')"
          />
        </Card>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Card from "../Card.vue";
import DashboardSettingsContent from "./DashboardSettingsContent.vue";
import { CButton, CText } from "../core";
import { useFocusTrap } from "../../composables/useFocusTrap";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";

const MOBILE_BREAKPOINT_PX = 1024;

const props = defineProps<{
  open: boolean;
  hasCsvData: boolean;
  inventorySummary: string;
  decklistText?: string | null;
  decklistSectionCount: number;
  exportHelperText: string;
  copied: boolean;
  density: Density;
  densityOptions: ReadonlyArray<{ value: Density; label: string }>;
  theme: Theme;
  backgroundEnabled: boolean;
}>();

const emit = defineEmits<{
  close: [];
  "open-upload": [];
  copy: [];
  download: [];
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
}>();

const desktopPanelRef = ref<HTMLElement | null>(null);
const mobileDialogRef = ref<HTMLElement | null>(null);
const isMobileViewport = ref(typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT_PX : false);
const mobileDialogOpen = computed(() => props.open && isMobileViewport.value);
const { activate, deactivate } = useFocusTrap(mobileDialogRef, mobileDialogOpen);
const idBase = `dashboard-settings-${Math.random().toString(36).slice(2, 9)}`;
const dialogTitleId = `${idBase}-title`;
const dialogDescriptionId = `${idBase}-description`;

const syncViewportMode = () => {
  if (typeof window === "undefined") {
    return;
  }
  isMobileViewport.value = window.innerWidth < MOBILE_BREAKPOINT_PX;
};

const handleDocumentPointerDown = (event: MouseEvent) => {
  if (!props.open || isMobileViewport.value) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }
  if (desktopPanelRef.value?.contains(target)) {
    return;
  }
  emit("close");
};

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (!props.open || isMobileViewport.value || event.key !== "Escape") {
    return;
  }
  event.preventDefault();
  emit("close");
};

watch(
  mobileDialogOpen,
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
  document.addEventListener("mousedown", handleDocumentPointerDown);
  document.addEventListener("keydown", handleDocumentKeydown);
});

onBeforeUnmount(() => {
  deactivate();
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncViewportMode);
  }
  document.removeEventListener("mousedown", handleDocumentPointerDown);
  document.removeEventListener("keydown", handleDocumentKeydown);
});
</script>
