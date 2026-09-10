<template>
  <CSurface variant="content" size="sm" radius="2xl" shadow="none" class="commander-route-masthead">
    <div class="flex flex-col gap-4">
      <div
        class="h-24 w-16 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)]"
      >
        <img
          v-if="primaryProfile?.imageUrl"
          :src="primaryProfile.imageUrl"
          :alt="displayPrimaryName"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full items-center justify-center px-2 text-center text-xs text-[color:var(--muted)]"
        >
          {{ spotlightLoading ? "Loading" : "No image" }}
        </div>
      </div>

      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="color in commanderColorIdentity"
            :key="`commander-color-${color}`"
            class="inline-flex min-h-6 items-center gap-1 rounded-md px-2 text-xs font-semibold"
            :class="COLOR_IDENTITY_META[color].pill"
          >
            <span
              class="inline-flex h-2 w-2 rounded-full"
              :class="COLOR_IDENTITY_META[color].dot"
              aria-hidden="true"
            />
            {{ color }}
          </span>
        </div>

        <CText tag="h1" variant="display" class="truncate text-[clamp(1.8rem,3vw,2.6rem)]">
          {{ displayTitle }}
        </CText>
        <CText v-if="titleSupportText" tag="p" variant="helper" tone="muted">
          {{ titleSupportText }}
        </CText>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <CButton
          type="button"
          variant="secondary"
          size="sm"
          data-testid="dashboard-control-trigger"
          @click="emit('open-controls')"
        >
          Change commander
        </CButton>
        <CButton
          v-if="canonicalEdhrecHref"
          as="a"
          :href="canonicalEdhrecHref"
          target="_blank"
          rel="noreferrer"
          variant="secondary"
          size="sm"
        >
          EDHREC
        </CButton>
        <CButton
          type="button"
          variant="ghost"
          size="sm"
          @click="detailsOpen = !detailsOpen"
        >
          {{ detailsOpen ? "Hide details" : "Details" }}
        </CButton>
      </div>
    </div>

    <div v-if="detailsOpen" class="mt-4 border-t border-[color:var(--border)] pt-4">
      <template v-if="spotlightLoading && !hasProfiles">
        <div class="h-20 animate-pulse rounded-lg bg-[color:var(--surface-muted)]" />
      </template>

      <div v-else-if="profilesToRender.length" class="space-y-3">
        <article
          v-for="(profile, index) in profilesToRender"
          :key="`${profile.id}-profile`"
          class="space-y-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-3"
        >
          <img
            v-if="profile.imageUrl"
            :src="profile.imageUrl"
            :alt="profile.name"
            class="h-24 w-16 rounded-md object-cover"
          />
          <div class="min-w-0 space-y-2">
            <CText tag="p" variant="caption" tone="muted">{{ profileRoleLabel(index) }}</CText>
            <CText tag="p" variant="title">{{ profile.name }}</CText>
            <CText tag="p" variant="helper" tone="muted">
              {{ formatProfileSet(profile) }} | {{ formatReleaseDate(profile.releasedAt) }}
            </CText>
            <div class="flex flex-wrap gap-2">
              <PriceColour :price="profile.prices.usd" currency="$" align="start" />
              <PriceColour :price="profile.prices.eur" currency="EUR " align="start" />
            </div>
            <div
              v-if="index === 0 && profile.canCyclePrintings"
              class="flex flex-wrap items-center gap-2"
            >
              <CButton type="button" variant="secondary" size="sm" @click="emit('previous-printing', 0)">
                Prev
              </CButton>
              <span class="text-xs font-semibold text-[color:var(--muted)]">
                Printing {{ profile.printingPosition }} of {{ profile.totalPrintings }}
              </span>
              <CButton type="button" variant="secondary" size="sm" @click="emit('next-printing', 0)">
                Next
              </CButton>
              <CText v-if="profile.printingsLoading" tag="p" variant="helper" tone="muted">
                Loading printings...
              </CText>
            </div>
          </div>
        </article>
      </div>

      <div
        v-else
        class="rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4"
      >
        <CText tag="p" variant="title">Commander details unavailable</CText>
        <CText tag="p" variant="helper" tone="muted" class="mt-2">
          The deck route is still available, but the commander snapshot could not be loaded.
        </CText>
      </div>
    </div>
  </CSurface>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import PriceColour from "../PriceColour.vue";
import { CButton, CSurface, CText } from "../core";
import type { CommanderProfile } from "../../composables/useCommanderSpotlight";
import type { CommanderSelection } from "../../types/edhrec";
import { COLOR_IDENTITY_META, type CommanderColor } from "../../utils/colorIdentity";

type StatusTone = "default" | "accent" | "success" | "warn" | "danger" | "muted";

type StatusItem = {
  label: string;
  tone?: StatusTone;
};

type StatItem = {
  label: string;
  value: string;
  tone?: StatusTone;
};

const props = withDefaults(
  defineProps<{
    commanderSelection: CommanderSelection;
    commanderProfiles: CommanderProfile[];
    commanderColorIdentity: CommanderColor[];
    spotlightLoading: boolean;
    backdropUrl?: string;
    nextStepLabel: string;
    canonicalEdhrecHref?: string | null;
    statusItems?: StatusItem[];
    statItems?: StatItem[];
  }>(),
  {
    backdropUrl: "",
    canonicalEdhrecHref: null,
    statusItems: () => [],
    statItems: () => [],
  }
);

const emit = defineEmits<{
  "open-controls": [];
  "open-utilities": [];
  "change-commander": [];
  "previous-printing": [index: number];
  "next-printing": [index: number];
}>();

const detailsOpen = ref(false);

const primaryProfile = computed(() => props.commanderProfiles[0] ?? null);
const partnerProfile = computed(() => props.commanderProfiles[1] ?? null);
const profilesToRender = computed(() =>
  props.commanderProfiles.slice(0, props.commanderSelection.hasPartner ? 2 : 1)
);
const hasProfiles = computed(() => profilesToRender.value.length > 0);
const displayPrimaryName = computed(
  () => primaryProfile.value?.name ?? props.commanderSelection.primary ?? "Commander route"
);
const displayPartnerName = computed(
  () => partnerProfile.value?.name ?? props.commanderSelection.partner
);
const displayTitle = computed(() => {
  if (!props.commanderSelection.hasPartner) {
    return displayPrimaryName.value;
  }
  return `${displayPrimaryName.value} + ${displayPartnerName.value}`;
});
const titleSupportText = computed(() =>
  props.commanderSelection.hasPartner ? "Partner commanders selected" : props.nextStepLabel
);

watch(
  () => [props.commanderSelection.primary, props.commanderSelection.partner].join("|"),
  () => {
    detailsOpen.value = false;
  }
);

const formatProfileSet = (profile: CommanderProfile) => {
  if (profile.setName && profile.setCode) {
    return `${profile.setName} (${profile.setCode})`;
  }
  return profile.setName || profile.setCode || "Set unavailable";
};

const formatReleaseDate = (value: string) => {
  if (!value) {
    return "Release unavailable";
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const profileRoleLabel = (index: number) => (index === 0 ? "Primary" : "Partner");
</script>
