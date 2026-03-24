<template>
  <section class="space-y-4">
    <Card
      variant="masthead"
      padding="p-5 sm:p-6 lg:p-7"
      rounded="rounded-[34px]"
      shadow="shadow-[var(--shadow)]"
      class="overflow-hidden"
    >
      <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(19rem,0.92fr)]">
        <div class="space-y-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-3">
              <CInline gap="sm" class="flex-wrap">
                <CBadge tone="success" variant="soft" size="sm" text-case="normal">
                  {{ csvCount }} cards loaded
                </CBadge>
                <CBadge tone="default" variant="outline" size="sm" text-case="normal">
                  Collection ready
                </CBadge>
              </CInline>

              <div class="space-y-2">
                <CText tag="p" variant="eyebrow" tone="muted"> Next deck </CText>
                <CText tag="h1" variant="display" class="max-w-3xl text-balance">
                  Choose the commander to compare next
                </CText>
                <CText tag="p" variant="body" tone="muted" class="max-w-2xl sm:text-base">
                  Search once. The full comparison workspace opens as soon as a commander is
                  selected.
                </CText>
              </div>
            </div>

            <CInline gap="sm" class="flex-wrap lg:justify-end">
              <CButton type="button" variant="secondary" size="sm" @click="toggleFilters">
                {{ filtersOpen ? "Hide filters" : "Route filters" }}
              </CButton>
              <CButton type="button" variant="soft" size="sm" @click="emit('toggle-utility')">
                {{ utilityDrawerOpen ? "Hide display" : "Display" }}
              </CButton>
              <CButton type="button" variant="secondary" size="sm" @click="emit('open-upload')">
                Replace CSV
              </CButton>
            </CInline>
          </div>

          <div class="flex flex-wrap gap-2">
            <CBadge
              v-for="chip in routeSummary"
              :key="chip"
              tone="default"
              variant="soft"
              size="sm"
              text-case="normal"
            >
              {{ chip }}
            </CBadge>
          </div>

          <CommanderSearch
            ref="commanderSearchRef"
            class="selection-stage-search max-w-3xl"
            :selected-slug="currentCommanderSlug"
            @commander-selected="handleCommanderSelection"
            @selection-change="emit('selection-change', $event)"
          />

          <div class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <CText tag="p" variant="overline" tone="muted"> Quick picks </CText>
              <CButton :as="RouterLink" to="/top-commanders" variant="soft" size="sm">
                Top commanders
              </CButton>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-for="commander in popularCommanders"
                :key="commander.name"
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:rgba(56,211,205,0.16)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[color:rgba(56,211,205,0.22)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                @click="selectSuggestedCommander(commander.name)"
              >
                <span class="text-[color:var(--accent)]" aria-hidden="true">◦</span>
                {{ commander.name }}
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <CSurface variant="dense" size="sm" class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <CText tag="p" variant="overline" tone="muted"> Collection </CText>
                <CText tag="p" variant="title"> Ready for comparison </CText>
              </div>
              <CText tag="p" variant="metric">{{ csvCount }}</CText>
            </div>
            <CText tag="p" variant="helper" tone="muted">
              Your ownership lens is loaded. Pick a commander and the results well will switch from
              discovery into comparison mode.
            </CText>
          </CSurface>

          <div
            class="selection-stage-visual relative min-h-[18rem] overflow-hidden rounded-[30px] border border-[color:var(--border)] bg-[linear-gradient(160deg,rgba(7,16,22,0.86),rgba(18,39,44,0.72))] shadow-[var(--shadow)]"
          >
            <div class="selection-stage-card selection-stage-card-back" aria-hidden="true"></div>
            <div class="selection-stage-card selection-stage-card-mid" aria-hidden="true"></div>
            <div class="selection-stage-card selection-stage-card-front" aria-hidden="true">
              <div class="space-y-3">
                <CText tag="p" variant="eyebrow" tone="muted"> Workspace shift </CText>
                <CText tag="p" variant="title" class="max-w-[13rem]">
                  Search first. Compare second.
                </CText>
                <div class="flex flex-wrap gap-2">
                  <span
                    class="rounded-full border border-[color:rgba(255,255,255,0.08)] bg-[color:rgba(255,255,255,0.04)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
                  >
                    Owned overlay
                  </span>
                  <span
                    class="rounded-full border border-[color:rgba(255,255,255,0.08)] bg-[color:rgba(255,255,255,0.04)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
                  >
                    Live pricing
                  </span>
                  <span
                    class="rounded-full border border-[color:rgba(255,255,255,0.08)] bg-[color:rgba(255,255,255,0.04)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
                  >
                    Export ready
                  </span>
                </div>
              </div>
            </div>

            <div class="absolute bottom-4 left-4 right-4">
              <div
                class="rounded-[22px] border border-[color:rgba(255,255,255,0.08)] bg-[color:rgba(7,16,22,0.84)] px-4 py-3"
              >
                <CText tag="p" variant="helper" tone="inverse" class="font-semibold">
                  Commander art and section tables stay off-screen until there is a real deck to
                  inspect.
                </CText>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <CSurface v-if="filtersOpen" variant="toolbar" size="md" radius="3xl" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <CText tag="p" variant="overline" tone="muted"> Route filters </CText>
            <CText tag="p" variant="title"> Adjust the EDHREC lane before you search </CText>
          </div>
          <CButton type="button" variant="soft" size="sm" @click="filtersOpen = false">
            Close
          </CButton>
        </div>
        <CommanderFilters
          :bracket="chosenBracket"
          :modifier="chosenModifier"
          :page-type="chosenPageType"
          :companion="chosenCompanion"
          @update:bracket="setBracket"
          @update:modifier="setModifier"
          @update:page-type="setPageType"
          @update:companion="setCompanion"
        />
      </CSurface>
    </Transition>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <CSurface v-if="utilityDrawerOpen" variant="toolbar" size="md" radius="3xl" class="space-y-3">
        <div class="space-y-1">
          <CText tag="p" variant="overline" tone="muted"> Display </CText>
          <CText tag="p" variant="title"> Density, theme, and accessibility </CText>
        </div>
        <DashboardDisplaySettings
          :density="density"
          :density-options="densityOptions"
          :theme="theme"
          :background-enabled="backgroundEnabled"
          @density-change="emit('density-change', $event)"
          @toggle-theme="emit('toggle-theme')"
          @toggle-background="emit('toggle-background')"
        />
      </CSurface>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  EDHRECBracket,
  EDHRECCompanion,
  EDHRECPageModifier,
  EDHRECPageType,
} from "../helpers/enums";
import CommanderSearch from "../CommanderSearch.vue";
import CommanderFilters from "../CommanderFilters.vue";
import Card from "../Card.vue";
import DashboardDisplaySettings from "./DashboardDisplaySettings.vue";
import { CBadge, CButton, CInline, CSurface, CText } from "../core";
import { useEdhrecRouteState } from "../../composables/useEdhrecRouteState";
import type { Density } from "../../composables/useLayoutDensity";
import type { Theme } from "../../composables/useTheme";
import type { CommanderSelection } from "../../types/edhrec";

const props = defineProps<{
  csvCount: number;
  density: Density;
  densityOptions: ReadonlyArray<{ value: Density; label: string }>;
  theme: Theme;
  backgroundEnabled: boolean;
  utilityDrawerOpen: boolean;
}>();

const emit = defineEmits<{
  "selection-change": [payload: CommanderSelection];
  "open-upload": [];
  "toggle-utility": [];
  "density-change": [value: Density];
  "toggle-theme": [];
  "toggle-background": [];
}>();

const commanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);
const filtersOpen = ref(false);

const {
  chosenPageType,
  chosenBracket,
  chosenModifier,
  chosenCompanion,
  currentCommanderSlug,
  setCommanderSlug,
  setBracket,
  setModifier,
  setPageType,
  setCompanion,
} = useEdhrecRouteState();

const lookupLabel = (
  entries: Array<{ value: string; label: string }>,
  value: string,
  prefix: string
) => `${prefix}: ${entries.find((entry) => entry.value === value)?.label ?? "Default"}`;

const routeSummary = computed(() => [
  lookupLabel(Object.values(EDHRECPageType), chosenPageType.value, "Page"),
  lookupLabel(Object.values(EDHRECBracket), chosenBracket.value, "Bracket"),
  lookupLabel(Object.values(EDHRECPageModifier), chosenModifier.value, "Budget"),
  lookupLabel(Object.values(EDHRECCompanion), chosenCompanion.value, "Companion"),
]);

const popularCommanders = [
  { name: "Atraxa, Grand Unifier" },
  { name: "The Ur-Dragon" },
  { name: "Miirym, Sentinel Wyrm" },
  { name: "Edgar Markov" },
  { name: "Chulane, Teller of Tales" },
];

const handleCommanderSelection = (slug: string) => {
  setCommanderSlug(slug);
};

const selectSuggestedCommander = (name: string) => {
  commanderSearchRef.value?.selectPrimaryCommander(name);
};

const toggleFilters = () => {
  filtersOpen.value = !filtersOpen.value;
};

const __templateBindings = props;
void __templateBindings;
</script>

<style scoped>
.selection-stage-search {
  background-color: color-mix(in srgb, var(--surface) 84%, rgba(255, 255, 255, 0.04));
}

.selection-stage-visual::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(56, 211, 205, 0.18), transparent 42%),
    radial-gradient(circle at bottom right, rgba(255, 179, 102, 0.14), transparent 36%);
}

.selection-stage-card {
  position: absolute;
  inset: auto;
  width: 13rem;
  aspect-ratio: 63 / 88;
  border-radius: 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow);
}

.selection-stage-card-back {
  top: 1.8rem;
  right: 2rem;
  transform: rotate(14deg);
  background: linear-gradient(170deg, rgba(14, 28, 36, 0.92), rgba(11, 20, 29, 0.86));
}

.selection-stage-card-mid {
  top: 2.4rem;
  right: 4.8rem;
  transform: rotate(4deg);
  background: linear-gradient(170deg, rgba(22, 46, 55, 0.94), rgba(14, 28, 36, 0.88));
}

.selection-stage-card-front {
  left: 2rem;
  top: 3.25rem;
  width: min(15.5rem, calc(100% - 4rem));
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
  background:
    linear-gradient(180deg, rgba(56, 211, 205, 0.1), transparent 28%),
    linear-gradient(165deg, rgba(7, 16, 22, 0.92), rgba(17, 40, 44, 0.86));
}

@media (max-width: 639px) {
  .selection-stage-card-back {
    right: 1rem;
  }

  .selection-stage-card-mid {
    right: 2.8rem;
  }

  .selection-stage-card-front {
    left: 1rem;
    width: calc(100% - 2rem);
  }
}
</style>
