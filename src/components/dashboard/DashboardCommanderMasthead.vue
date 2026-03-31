<template>
  <CSurface variant="command" size="md" radius="3xl" class="relative overflow-hidden">
    <div
      v-if="heroBackdropUrl"
      class="pointer-events-none absolute inset-y-0 right-0 hidden w-28 xl:block commander-inspector-backdrop"
      :style="{ backgroundImage: `url(${heroBackdropUrl})` }"
      aria-hidden="true"
    />

    <div class="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_8.75rem] xl:items-start">
      <div class="space-y-4">
        <div class="space-y-2">
          <CText tag="p" variant="eyebrow" tone="muted">Commander</CText>
          <CText tag="h2" variant="title" class="text-[clamp(1.35rem,2vw,1.9rem)] leading-tight">
            {{ displayTitle }}
          </CText>
          <CText v-if="titleSupportText" tag="p" variant="body" tone="muted">
            {{ titleSupportText }}
          </CText>
          <CText tag="p" variant="helper" tone="muted" class="max-w-3xl">
            {{ nextStepLabel }}
          </CText>
        </div>

        <div v-if="statusItems.length" class="flex flex-wrap gap-2">
          <CBadge
            v-for="item in statusItems"
            :key="item.label"
            :tone="item.tone ?? 'default'"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            {{ item.label }}
          </CBadge>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <CButton
            class="hidden lg:inline-flex"
            type="button"
            variant="secondary"
            size="sm"
            @click="emit('change-commander')"
          >
            Change commander
          </CButton>
          <CButton
            class="lg:hidden"
            type="button"
            variant="soft"
            size="sm"
            data-testid="dashboard-control-trigger"
            @click="emit('open-controls')"
          >
            Open workbench
          </CButton>
          <CButton
            type="button"
            variant="soft"
            size="sm"
            data-testid="dashboard-utility-trigger"
            @click="emit('open-utilities')"
          >
            Utilities
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
            View on EDHREC
          </CButton>
          <CButton
            v-if="showPrintingsAction"
            type="button"
            variant="ghost"
            size="sm"
            @click="showPrintingBrowser = !showPrintingBrowser"
          >
            {{ showPrintingBrowser ? "Hide printings" : `Printings (${primaryProfile?.totalPrintings ?? 0})` }}
          </CButton>
        </div>

        <template v-if="spotlightLoading && !hasProfiles">
          <div class="space-y-2">
            <CText tag="p" variant="helper" tone="muted">Loading commander details...</CText>
            <div class="grid gap-2 sm:grid-cols-2">
              <div class="h-18 animate-pulse rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface-muted)]" />
              <div class="h-18 animate-pulse rounded-[22px] border border-[color:var(--border)] bg-[color:var(--surface-muted)]" />
            </div>
          </div>
        </template>

        <template v-else-if="commanderSelection.hasPartner && profilesToRender.length">
          <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
            <div
              v-for="(profile, index) in profilesToRender"
              :key="`${profile.id}-snapshot`"
              class="flex flex-wrap items-start justify-between gap-3 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3"
            >
              <div class="space-y-1">
                <CText tag="p" variant="overline" tone="muted">
                  {{ profileRoleLabel(index) }}
                </CText>
                <CText tag="p" variant="body" weight="semibold">
                  {{ profile.name }}
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  {{ formatProfileSet(profile) }} | {{ formatReleaseDate(profile.releasedAt) }}
                </CText>
              </div>
              <div class="flex flex-wrap gap-2">
                <PriceColour :price="profile.prices.usd" currency="$" align="start" />
                <PriceColour :price="profile.prices.eur" currency="EUR " align="start" />
              </div>
            </div>
          </CSurface>
        </template>

        <template v-else-if="primaryProfile">
          <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <CText tag="p" variant="overline" tone="muted">Current printing</CText>
                <CText tag="p" variant="body" weight="semibold">
                  {{ formatProfileSet(primaryProfile) }}
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Released {{ formatReleaseDate(primaryProfile.releasedAt) }}
                </CText>
              </div>
              <div class="flex flex-wrap gap-2">
                <PriceColour :price="primaryProfile.prices.usd" currency="$" align="start" />
                <PriceColour :price="primaryProfile.prices.eur" currency="EUR " align="start" />
              </div>
            </div>

            <div
              v-if="showPrintingBrowser"
              class="flex flex-wrap items-center gap-2 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-3"
            >
              <CButton
                v-if="primaryProfile.canCyclePrintings"
                type="button"
                variant="secondary"
                size="sm"
                @click="emit('previous-printing', 0)"
              >
                Prev
              </CButton>
              <CBadge tone="muted" variant="soft" size="sm" text-case="normal">
                {{
                  primaryProfile.canCyclePrintings
                    ? `Printing ${primaryProfile.printingPosition} of ${primaryProfile.totalPrintings}`
                    : "Single printing shown"
                }}
              </CBadge>
              <CButton
                v-if="primaryProfile.canCyclePrintings"
                type="button"
                variant="secondary"
                size="sm"
                @click="emit('next-printing', 0)"
              >
                Next
              </CButton>
              <CText v-if="primaryProfile.printingsLoading" tag="p" variant="helper" tone="muted">
                Loading printings...
              </CText>
            </div>
          </CSurface>
        </template>

        <div
          v-else
          class="rounded-[24px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4"
        >
          <CText tag="p" variant="title">Commander details unavailable</CText>
          <CText tag="p" variant="helper" tone="muted" class="mt-2">
            Compare still works, but the commander snapshot could not be loaded.
          </CText>
        </div>
      </div>

      <div class="hidden xl:block">
        <div
          v-if="artProfiles.length"
          class="grid gap-2"
          :class="artProfiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <figure
            v-for="(profile, index) in artProfiles"
            :key="`${profile.id}-art`"
            class="relative overflow-hidden rounded-[22px] border border-[color:rgba(255,255,255,0.08)] bg-[color:var(--surface-strong)] shadow-[var(--shadow-soft)]"
          >
            <img
              :src="profile.imageUrl"
              :alt="profile.name"
              class="aspect-[63/88] h-full w-full object-cover object-top"
            />
            <div
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(3,9,13,0.96)] via-[rgba(3,9,13,0.72)] to-transparent px-2 pb-2 pt-6"
            >
              <CText
                tag="figcaption"
                variant="helper"
                tone="inverse"
                class="text-[0.68rem] font-semibold leading-snug"
              >
                {{ artProfiles.length > 1 ? profileRoleLabel(index) : profile.name }}
              </CText>
            </div>
          </figure>
        </div>
      </div>
    </div>
  </CSurface>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import PriceColour from "../PriceColour.vue";
import { CBadge, CButton, CSurface, CText } from "../core";
import type { CommanderProfile } from "../../composables/useCommanderSpotlight";
import type { CommanderSelection } from "../../types/edhrec";

type MastheadStatusTone = "default" | "accent" | "success" | "warn" | "danger" | "muted";

type MastheadStatusItem = {
  label: string;
  tone?: MastheadStatusTone;
};

const props = withDefaults(
  defineProps<{
    commanderSelection: CommanderSelection;
    commanderProfiles: CommanderProfile[];
    spotlightLoading: boolean;
    backdropUrl?: string;
    nextStepLabel: string;
    canonicalEdhrecHref?: string | null;
    statusItems?: MastheadStatusItem[];
  }>(),
  {
    backdropUrl: "",
    canonicalEdhrecHref: null,
    statusItems: () => [],
  }
);

const emit = defineEmits<{
  "open-controls": [];
  "open-utilities": [];
  "change-commander": [];
  "previous-printing": [index: number];
  "next-printing": [index: number];
}>();

const showPrintingBrowser = ref(false);

const primaryProfile = computed(() => props.commanderProfiles[0] ?? null);
const partnerProfile = computed(() => props.commanderProfiles[1] ?? null);
const profilesToRender = computed(() =>
  props.commanderProfiles.slice(0, props.commanderSelection.hasPartner ? 2 : 1)
);
const artProfiles = computed(() =>
  profilesToRender.value.filter((profile) => profile.hasArtwork).slice(0, 2)
);
const hasProfiles = computed(() => profilesToRender.value.length > 0);
const displayPrimaryName = computed(
  () => primaryProfile.value?.name ?? props.commanderSelection.primary
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
  props.commanderSelection.hasPartner ? "Partner commanders selected" : ""
);
const heroBackdropUrl = computed(
  () => props.backdropUrl || primaryProfile.value?.artUrl || primaryProfile.value?.imageUrl || ""
);
const showPrintingsAction = computed(
  () => !props.commanderSelection.hasPartner && Boolean(primaryProfile.value?.canCyclePrintings)
);

watch(
  () => [props.commanderSelection.primary, props.commanderSelection.partner].join("|"),
  () => {
    showPrintingBrowser.value = false;
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

<style scoped>
.commander-inspector-backdrop {
  background-position: center right;
  background-size: cover;
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 30%, #000 100%);
  opacity: 0.18;
}
</style>
