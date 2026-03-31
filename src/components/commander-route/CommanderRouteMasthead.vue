<template>
  <CSurface variant="masthead" size="md" radius="3xl" class="commander-route-masthead relative overflow-hidden">
    <div
      v-if="heroBackdropUrl"
      class="commander-route-masthead-backdrop pointer-events-none absolute inset-0"
      :style="{ backgroundImage: `url(${heroBackdropUrl})` }"
      aria-hidden="true"
    />

    <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_18rem] xl:items-start">
      <div class="space-y-5">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <CText tag="p" variant="eyebrow" tone="muted"> Commander destination </CText>
            <div v-if="commanderColorIdentity.length" class="flex flex-wrap gap-2">
              <span
                v-for="color in commanderColorIdentity"
                :key="`commander-color-${color}`"
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold"
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
          </div>

          <CText
            tag="h1"
            variant="display"
            class="text-balance text-[clamp(2rem,3.2vw,3rem)] leading-[0.95]"
          >
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
            variant="primary"
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
            Browse rail
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

        <div v-if="statItems.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <CSurface
            v-for="item in statItems"
            :key="item.label"
            variant="command"
            size="sm"
            radius="2xl"
            :class="statCardClass(item.tone)"
          >
            <CText tag="p" variant="eyebrow" tone="muted">{{ item.label }}</CText>
            <CText tag="p" variant="title" class="mt-2">{{ item.value }}</CText>
          </CSurface>
        </div>

        <template v-if="spotlightLoading && !hasProfiles">
          <div class="grid gap-3 sm:grid-cols-2">
            <div
              v-for="index in 2"
              :key="`masthead-loading-${index}`"
              class="h-24 animate-pulse rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-muted)]"
            />
          </div>
        </template>

        <template v-else-if="commanderSelection.hasPartner && profilesToRender.length">
          <div class="grid gap-3 sm:grid-cols-2">
            <CSurface
              v-for="(profile, index) in profilesToRender"
              :key="`${profile.id}-profile`"
              variant="utility"
              size="sm"
              radius="2xl"
              class="space-y-2"
            >
              <CText tag="p" variant="eyebrow" tone="muted">{{ profileRoleLabel(index) }}</CText>
              <CText tag="p" variant="title">{{ profile.name }}</CText>
              <CText tag="p" variant="helper" tone="muted">
                {{ formatProfileSet(profile) }} | {{ formatReleaseDate(profile.releasedAt) }}
              </CText>
              <div class="flex flex-wrap gap-2">
                <PriceColour :price="profile.prices.usd" currency="$" align="start" />
                <PriceColour :price="profile.prices.eur" currency="EUR " align="start" />
              </div>
            </CSurface>
          </div>
        </template>

        <template v-else-if="primaryProfile">
          <CSurface variant="utility" size="sm" radius="2xl" class="space-y-3">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <CText tag="p" variant="eyebrow" tone="muted"> Current printing </CText>
                <CText tag="p" variant="title">{{ formatProfileSet(primaryProfile) }}</CText>
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
            The deck route is still available, but the commander snapshot could not be loaded.
          </CText>
        </div>
      </div>

      <div class="hidden xl:block">
        <div
          v-if="artProfiles.length"
          class="grid gap-3"
          :class="artProfiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <figure
            v-for="(profile, index) in artProfiles"
            :key="`${profile.id}-art`"
            class="relative overflow-hidden rounded-[26px] border border-[color:rgba(255,255,255,0.08)] bg-[color:var(--surface-strong)] shadow-[var(--shadow)]"
          >
            <img
              :src="profile.imageUrl"
              :alt="profile.name"
              class="aspect-[63/88] h-full w-full object-cover object-top"
            />
            <div
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(3,9,13,0.95)] via-[rgba(3,9,13,0.78)] to-transparent px-3 pb-3 pt-8"
            >
              <CText tag="figcaption" variant="helper" tone="inverse" class="font-semibold">
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

const statCardClass = (tone?: StatusTone) => {
  switch (tone) {
    case "success":
      return "border-[color:color-mix(in_srgb,var(--success-soft)_92%,var(--border)_8%)]";
    case "warn":
      return "border-[color:color-mix(in_srgb,var(--warn-soft)_92%,var(--border)_8%)]";
    case "accent":
      return "border-[color:color-mix(in_srgb,var(--accent-soft)_92%,var(--border)_8%)]";
    case "muted":
      return "opacity-90";
    default:
      return "";
  }
};

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
.commander-route-masthead {
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--surface-strong) 94%, var(--bg) 6%),
      color-mix(in srgb, var(--surface) 82%, var(--bg-strong) 18%) 46%,
      color-mix(in srgb, var(--surface-muted) 78%, var(--bg-strong) 22%)
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 56%);
}

.commander-route-masthead::before {
  content: "";
  position: absolute;
  inset: 1rem;
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 2rem;
  pointer-events: none;
}

.commander-route-masthead-backdrop {
  background-position: center right;
  background-size: cover;
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.12) 30%, #000 100%);
  opacity: 0.16;
}
</style>
