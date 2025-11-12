<template>
  <div v-if="sectionsWithIcons.length">
    <nav
      class="fixed left-2 top-24 z-30 hidden lg:flex max-h-[calc(100vh-6rem)] flex-col gap-2 overflow-y-auto rounded-3xl border border-slate-200/70 bg-white/70 p-2 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70"
      aria-label="Cardlist navigation"
    >
      <button
        v-for="section in sectionsWithIcons"
        :key="section.id"
        type="button"
        :title="section.label"
        :aria-label="section.label"
        :class="[
          'rounded-2xl border p-2 transition focus-visible:ring-2 focus-visible:ring-emerald-400/70',
          section.id === activeId
            ? 'border-emerald-400 bg-emerald-50/80 text-emerald-700 dark:border-emerald-300/70 dark:bg-emerald-900/40 dark:text-emerald-100'
            : 'border-transparent text-slate-500 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-200',
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
      class="fixed bottom-6 left-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/60 bg-white/80 text-emerald-700 shadow-lg shadow-emerald-500/20 backdrop-blur transition hover:scale-105 dark:border-emerald-300/60 dark:bg-slate-900/80 dark:text-emerald-200 lg:hidden"
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
        class="fixed inset-0 z-50 flex items-end bg-slate-950/70 px-4 pb-8 pt-16 backdrop-blur-sm lg:hidden"
        role="dialog"
        aria-modal="true"
        @click.self="mobileOpen = false"
      >
        <div
          class="w-full rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-2xl shadow-slate-900/50 dark:border-slate-700/70 dark:bg-slate-900/90"
        >
          <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Jump to cardlist
            </p>
            <button
              type="button"
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/70"
              @click="mobileOpen = false"
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
                  ? 'border-emerald-400 bg-emerald-50/80 text-emerald-700 dark:border-emerald-300/70 dark:bg-emerald-900/40 dark:text-emerald-100'
                  : 'border-slate-200/70 text-slate-600 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-emerald-200',
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
import { computed, ref } from "vue";
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

const handleNavigate = (id: string) => {
  emit("navigate", id);
};

const handleMobileNavigate = (id: string) => {
  emit("navigate", id);
  mobileOpen.value = false;
};
</script>
