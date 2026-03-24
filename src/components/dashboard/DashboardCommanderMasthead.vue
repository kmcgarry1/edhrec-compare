<template>
  <Card
    as="header"
    variant="masthead"
    padding="p-4 sm:p-5"
    rounded="rounded-[32px]"
    shadow="shadow-[var(--shadow)]"
    class="overflow-hidden"
  >
    <div
      v-if="heroBackdropUrl"
      class="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] commander-masthead-backdrop lg:block"
      :style="{ backgroundImage: `url(${heroBackdropUrl})` }"
      aria-hidden="true"
    />
    <div class="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="space-y-4">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <CStack gap="sm" class="min-w-0">
            <CInline align="center" gap="sm" class="flex-wrap">
              <CBadge tone="default" variant="outline" size="sm" text-case="normal">
                Commander workspace
              </CBadge>
              <CBadge
                :tone="hasCsvData ? 'success' : 'muted'"
                variant="soft"
                size="sm"
                text-case="normal"
              >
                {{ csvLabel }}
              </CBadge>
              <CBadge
                :tone="decklistReady ? 'accent' : 'muted'"
                variant="soft"
                size="sm"
                text-case="normal"
              >
                {{ decklistStatus }}
              </CBadge>
            </CInline>

            <div class="space-y-1">
              <CText tag="h1" variant="display" class="max-w-3xl text-balance">
                {{ displayPrimaryName }}
              </CText>
              <CText
                v-if="commanderSelection.hasPartner"
                tag="p"
                variant="body"
                tone="muted"
                class="sm:text-base"
              >
                Partnered with {{ displayPartnerName }}
              </CText>
              <CText tag="p" variant="body" tone="muted" class="max-w-3xl sm:text-base">
                {{ nextStepLabel }}
              </CText>
            </div>
          </CStack>

          <CInline gap="sm" class="flex-wrap xl:justify-end">
            <CButton type="button" variant="secondary" size="sm" @click="emit('browse')">
              Browse rail
            </CButton>
            <CButton type="button" variant="primary" size="sm" @click="emit('upload')">
              {{ hasCsvData ? "Replace CSV" : "Upload CSV" }}
            </CButton>
          </CInline>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <CSurface variant="dense" size="sm" class="min-h-[4.75rem]">
            <CStack gap="xs">
              <CText tag="p" variant="overline" tone="muted"> Collection </CText>
              <CText tag="p" variant="metric">
                {{ csvCount }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                card{{ csvCount === 1 ? "" : "s" }} loaded into the ownership lens
              </CText>
            </CStack>
          </CSurface>

          <CSurface variant="dense" size="sm" class="min-h-[4.75rem]">
            <CStack gap="xs">
              <CText tag="p" variant="overline" tone="muted"> Cardlists </CText>
              <CText tag="p" variant="metric">
                {{ decklistSectionCount }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                sections available in the current comparison route
              </CText>
            </CStack>
          </CSurface>

          <CSurface variant="dense" size="sm" class="min-h-[4.75rem]">
            <CStack gap="xs">
              <CText tag="p" variant="overline" tone="muted"> Export state </CText>
              <CText tag="p" variant="metric">
                {{ decklistReady ? "Ready" : "Pending" }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                {{
                  decklistReady
                    ? "Copy or download from the toolbar below."
                    : "Change the lens or load more context to build an export."
                }}
              </CText>
            </CStack>
          </CSurface>
        </div>
      </div>

      <CSurface variant="dense" size="sm" class="space-y-3 overflow-hidden">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <CText tag="p" variant="overline" tone="muted"> Commander spotlight </CText>
            <CText tag="p" variant="title"> Visual anchor </CText>
          </div>
          <CBadge tone="accent" variant="soft" size="sm" text-case="normal">
            {{ commanderSelection.hasPartner ? "Partner pair" : "Single commander" }}
          </CBadge>
        </div>

        <div
          v-if="spotlightLoading && !hasSpotlight"
          class="grid gap-3"
          :class="commanderSelection.hasPartner ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <div
            v-for="index in commanderSelection.hasPartner ? 2 : 1"
            :key="index"
            class="aspect-[63/88] rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-strong)]"
          />
        </div>

        <div
          v-else-if="hasSpotlight"
          class="grid gap-3"
          :class="spotlightCardsToRender.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <figure
            v-for="(card, index) in spotlightCardsToRender"
            :key="card.name"
            class="relative overflow-hidden rounded-[24px] border border-[color:rgba(255,255,255,0.08)] bg-[color:var(--surface-strong)] shadow-[var(--shadow-soft)]"
            :class="spotlightCardsToRender.length > 1 && index === 1 ? 'md:translate-y-5' : ''"
          >
            <img
              :src="card.imageUrl"
              :alt="card.name"
              class="aspect-[63/88] h-full w-full object-cover object-top"
            />
            <div
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(3,9,13,0.96)] via-[rgba(3,9,13,0.72)] to-transparent px-3 pb-3 pt-8"
            >
              <CBadge tone="accent" variant="soft" size="sm" text-case="normal">
                {{ spotlightRoleLabel(index) }}
              </CBadge>
              <CText
                tag="figcaption"
                variant="helper"
                tone="inverse"
                class="mt-2 text-[0.76rem] font-semibold leading-snug"
              >
                {{ card.name }}
              </CText>
            </div>
          </figure>
        </div>

        <div
          v-else
          class="rounded-[24px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-4"
        >
          <CText tag="p" variant="title"> Artwork unavailable </CText>
          <CText tag="p" variant="helper" tone="muted" class="mt-2">
            The comparison workspace still works, but Scryfall did not return a usable image for
            this commander selection.
          </CText>
        </div>

        <CText tag="p" variant="helper" tone="muted">
          {{
            commanderSelection.hasPartner
              ? "Partner art is stacked so the deck identity reads as one combined selection."
              : "Commander art anchors the page so the data well feels attached to the deck you are comparing."
          }}
        </CText>
      </CSurface>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "../Card.vue";
import { CBadge, CButton, CInline, CStack, CSurface, CText } from "../core";
import type { CommanderSelection } from "../../types/edhrec";
import type { CommanderSpotlightCard } from "../../composables/useCommanderSpotlight";

const props = defineProps<{
  commanderSelection: CommanderSelection;
  spotlightCards: CommanderSpotlightCard[];
  spotlightLoading: boolean;
  backdropUrl?: string;
  csvCount: number;
  hasCsvData: boolean;
  decklistReady: boolean;
  decklistSectionCount: number;
  nextStepLabel: string;
}>();

const emit = defineEmits<{
  browse: [];
  upload: [];
}>();

const csvLabel = computed(() => {
  if (!props.hasCsvData) {
    return "CSV pending";
  }
  return `${props.csvCount} card${props.csvCount === 1 ? "" : "s"} loaded`;
});

const primarySpotlight = computed(() => props.spotlightCards[0] ?? null);
const partnerSpotlight = computed(() => props.spotlightCards[1] ?? null);
const spotlightCardsToRender = computed(() =>
  props.spotlightCards.slice(0, props.commanderSelection.hasPartner ? 2 : 1)
);
const hasSpotlight = computed(() => spotlightCardsToRender.value.length > 0);
const displayPrimaryName = computed(
  () => primarySpotlight.value?.name ?? props.commanderSelection.primary
);
const displayPartnerName = computed(
  () => partnerSpotlight.value?.name ?? props.commanderSelection.partner
);
const heroBackdropUrl = computed(
  () => props.backdropUrl || primarySpotlight.value?.artUrl || primarySpotlight.value?.imageUrl || ""
);
const decklistStatus = computed(() => (props.decklistReady ? "Export ready" : "Awaiting decklist"));

const spotlightRoleLabel = (index: number) => (index === 0 ? "Primary" : "Partner");
</script>

<style scoped>
.commander-masthead-backdrop {
  background-position: center right;
  background-size: cover;
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.24) 20%, #000 58%);
  opacity: 0.28;
}
</style>
