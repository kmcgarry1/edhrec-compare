<template>
  <nav
    v-if="sectionsWithIcons.length"
    class="sticky top-24 z-20 rounded-[24px] border border-[color:color-mix(in_srgb,var(--border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--surface-muted)_76%,var(--surface-strong)_24%)] px-3 py-3 shadow-[var(--shadow-soft)] backdrop-blur-sm"
    aria-label="Cardlist navigation"
  >
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <CText tag="p" variant="eyebrow" tone="muted"> Section navigation </CText>
        <CText tag="p" variant="helper" tone="muted">
          {{ sectionsWithIcons.length }} active section{{ sectionsWithIcons.length === 1 ? "" : "s" }}
        </CText>
      </div>

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
              : 'border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]',
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
import { CText } from "./core";

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
