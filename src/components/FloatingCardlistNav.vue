<template>
  <div v-if="sectionsWithIcons.length">
    <nav
      class="surface-sheen fixed left-2 top-24 z-30 hidden lg:flex max-h-[calc(100vh-6rem)] flex-col gap-2 overflow-y-auto rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 shadow-[var(--shadow-soft)] backdrop-blur"
      aria-label="Cardlist navigation"
    >
      <button
        v-for="section in sectionsWithIcons"
        :key="section.id"
        type="button"
        :title="section.label"
        :aria-label="section.label"
        :class="[
          'rounded-2xl border p-2 transition focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
          section.id === activeId
            ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
            : 'border-transparent text-[color:var(--muted)] hover:text-[color:var(--accent)]',
        ]"
        @click="handleNavigate(section.id)"
      >
        <svg
          :viewBox="section.icon?.viewBox ?? VIEW_BOX"
          class="h-5 w-5"
          :style="{ color: section.icon?.color || 'currentColor' }"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="section.icon?.path ?? defaultIconPath" />
        </svg>
      </button>
    </nav>

    <button
      type="button"
      class="fixed bottom-6 left-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--accent)] bg-[color:var(--surface)] text-[color:var(--text)] shadow-[var(--shadow-soft)] backdrop-blur transition hover:scale-105 lg:hidden"
      aria-label="Open cardlist navigation"
      @click="mobileOpen = true"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-5 w-5"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <Teleport to="body">
      <div
      v-if="mobileOpen"
      ref="mobileModalRef"
      class="fixed inset-0 z-50 flex items-end bg-black/70 px-4 pb-8 pt-16 backdrop-blur-sm lg:hidden"
      role="dialog"
      aria-modal="true"
        aria-labelledby="nav-modal-title"
        tabindex="-1"
        @click.self="closeMobileNav"
        @escape-pressed="closeMobileNav"
      >
        <div
          class="surface-sheen w-full rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow)]"
        >
          <div class="mb-3 flex items-center justify-between">
            <p id="nav-modal-title" class="text-sm font-semibold text-[color:var(--text)]">
              Jump to cardlist
            </p>
            <button
              type="button"
              class="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
              aria-label="Close navigation dialog"
              @click="closeMobileNav"
            >
              Close
            </button>
          </div>
          <div class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2">
            <button
              v-for="section in sectionsWithIcons"
              :key="section.id + '-mobile'"
              type="button"
              :class="[
                'flex items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition',
                section.id === activeId
                  ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                  : 'border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--accent)]',
              ]"
              @click="handleMobileNavigate(section.id)"
            >
              <svg
                :viewBox="section.icon?.viewBox ?? VIEW_BOX"
                class="h-5 w-5 flex-shrink-0"
                :style="{ color: section.icon?.color || 'currentColor' }"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="section.icon?.path ?? defaultIconPath" />
              </svg>
              <span class="flex-1 text-left text-[0.8rem] font-medium">
                {{ section.label }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  mdiCards,
  mdiMagicStaff,
  mdiCrownOutline,
  mdiSwordCross,
  mdiChartLine,
  mdiShieldCross,
  mdiCastle,
  mdiLightningBoltCircle,
  mdiWater,
  mdiTreeOutline,
  mdiFire,
  mdiSkullCrossbones,
  mdiInfinity,
  mdiStarFourPoints,
  mdiAccountGroup,
} from "@mdi/js";
import { useFocusTrap } from "../composables/useFocusTrap";

const props = defineProps<{
  sections: Array<{
    id: string;
    label: string;
    iconPath?: string;
    iconColor?: string;
  }>;
  activeId?: string | null;
}>();

const emit = defineEmits<{
  navigate: [id: string];
}>();

const VIEW_BOX = "0 0 24 24";
const ICON_PATHS = [
  mdiCards,
  mdiMagicStaff,
  mdiCrownOutline,
  mdiSwordCross,
  mdiChartLine,
  mdiShieldCross,
  mdiCastle,
  mdiLightningBoltCircle,
  mdiWater,
  mdiTreeOutline,
  mdiFire,
  mdiSkullCrossbones,
  mdiInfinity,
  mdiStarFourPoints,
  mdiAccountGroup,
];
const ICONS = ICON_PATHS.map((path) => ({
  viewBox: VIEW_BOX,
  path,
}));
const defaultIconPath = ICONS[0]?.path ?? mdiCards;

const activeId = computed(() => props.activeId ?? null);

const sectionsWithIcons = computed(() =>
  props.sections.map((section, index) => {
    const iconPath =
      section.iconPath ?? ICONS[index % ICONS.length]?.path ?? defaultIconPath;
    return {
      ...section,
      icon: {
        viewBox: VIEW_BOX,
        path: iconPath,
        color: section.iconColor,
      },
    };
  })
);

const mobileOpen = ref(false);
const mobileModalRef = ref<HTMLElement | null>(null);
const { activate, deactivate } = useFocusTrap(mobileModalRef, mobileOpen);

const handleNavigate = (id: string) => {
  emit("navigate", id);
};

const handleMobileNavigate = (id: string) => {
  emit("navigate", id);
  closeMobileNav();
};

const closeMobileNav = () => {
  mobileOpen.value = false;
};

watch(
  mobileOpen,
  (newValue) => {
    if (newValue) {
      activate();
    } else {
      deactivate();
    }
  },
  { immediate: true }
);
</script>
