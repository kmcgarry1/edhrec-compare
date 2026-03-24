<template>
  <nav
    v-if="sectionsWithIcons.length"
    class="surface-sheen sticky top-24 z-20 rounded-[26px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-2.5 py-2 shadow-[var(--shadow-soft)]"
    aria-label="Cardlist navigation"
  >
    <div class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="section in sectionsWithIcons"
        :key="section.id"
        type="button"
        :title="section.label"
        :aria-label="section.label"
        :class="[
          'inline-flex shrink-0 items-center gap-1.5 rounded-2xl border px-2.5 py-1.5 text-left text-[0.72rem] font-semibold transition focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
          section.id === activeId
            ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]'
            : 'border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]',
        ]"
        @click="emit('navigate', section.id)"
      >
        <svg
          :viewBox="section.icon?.viewBox ?? VIEW_BOX"
          class="h-4 w-4 shrink-0"
          :style="{ color: section.icon?.color || 'currentColor' }"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="section.icon?.path ?? defaultIconPath" />
        </svg>
        <span>{{ section.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
    const iconPath = section.iconPath ?? ICONS[index % ICONS.length]?.path ?? defaultIconPath;
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
</script>
