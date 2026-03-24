<template>
  <Card
    as="header"
    variant="masthead"
    padding="p-5 sm:p-7"
    rounded="rounded-[32px]"
    shadow="shadow-[var(--shadow)]"
    class="overflow-hidden"
  >
    <div
      class="pointer-events-none absolute -right-10 top-0 h-52 w-52 rounded-full bg-[color:var(--accent-glow-strong)] blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute bottom-0 left-0 h-44 w-64 rounded-full bg-[color:var(--warn-soft)] blur-3xl opacity-60"
      aria-hidden="true"
    />

    <div class="relative space-y-6">
      <CStack gap="lg">
        <CInline align="start" justify="between" gap="lg" class="flex-col lg:flex-row">
          <CStack gap="sm" class="min-w-0">
            <CInline align="center" gap="sm" class="flex-wrap">
              <CBadge tone="accent" variant="solid" size="md">
                Command deck
              </CBadge>
              <CBadge :tone="hasCsvData ? 'success' : 'muted'" variant="soft" size="sm">
                {{ csvLabel }}
              </CBadge>
              <CBadge :tone="decklistReady ? 'accent' : 'muted'" variant="soft" size="sm">
                {{ decklistStatus }}
              </CBadge>
            </CInline>

            <CText tag="h1" variant="display" class="max-w-4xl text-balance">
              {{ commanderSelection.primary }}
            </CText>
            <CText
              v-if="commanderSelection.hasPartner"
              tag="p"
              variant="body"
              tone="muted"
              class="sm:text-base"
            >
              Partnered with {{ commanderSelection.partner }}
            </CText>
            <CText tag="p" variant="body" tone="muted" class="max-w-3xl sm:text-base">
              {{ nextStepLabel }}
            </CText>
          </CStack>

          <CStack gap="sm" class="min-w-full lg:min-w-[15rem] lg:max-w-[17rem]">
            <CText tag="p" variant="overline" tone="muted">
              Route actions
            </CText>
            <CButton type="button" variant="primary" class="w-full" @click="emit('jump', 'search')">
              Browse cardlists
            </CButton>
            <CButton type="button" variant="secondary" class="w-full" @click="emit('jump', 'collection')">
              {{ hasCsvData ? "Update collection" : "Upload CSV" }}
            </CButton>
            <CButton type="button" variant="secondary" class="w-full" @click="emit('jump', 'export')">
              Open export
            </CButton>
          </CStack>
        </CInline>

        <div class="grid gap-3 lg:grid-cols-[1.1fr,1fr,1fr]">
          <CSurface variant="utility" size="sm" class="min-h-[5.5rem]">
            <CStack gap="xs">
              <CText tag="p" variant="overline" tone="muted">
                Collection
              </CText>
              <CText tag="p" variant="title">
                {{ csvCount }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                card{{ csvCount === 1 ? "" : "s" }} loaded into inventory matching
              </CText>
            </CStack>
          </CSurface>

          <CSurface variant="utility" size="sm" class="min-h-[5.5rem]">
            <CStack gap="xs">
              <CText tag="p" variant="overline" tone="muted">
                Route state
              </CText>
              <CText tag="p" variant="title">
                {{ decklistReady ? "Ready" : "Pending" }}
              </CText>
              <CText tag="p" variant="helper" tone="muted">
                {{ decklistReady ? "Filtered decklist can be copied or downloaded." : "Choose a filter to build the decklist export." }}
              </CText>
            </CStack>
          </CSurface>

          <CSurface variant="utility" size="sm" class="min-h-[5.5rem]">
            <CStack gap="xs">
              <CText tag="p" variant="overline" tone="muted">
                Color identity
              </CText>
              <CInline gap="xs" class="flex-wrap">
                <template v-if="commanderColorBadges.length">
                  <CBadge
                    v-for="color in commanderColorBadges"
                    :key="color"
                    variant="soft"
                    size="sm"
                    class="normal-case tracking-[0.08em]"
                    :class="colorPillClass(color)"
                  >
                    {{ colorLabel(color) }}
                  </CBadge>
                </template>
                <CText v-else tag="span" variant="helper" tone="muted">
                  Loading from Scryfall preview
                </CText>
              </CInline>
            </CStack>
          </CSurface>
        </div>
      </CStack>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Card from "../Card.vue";
import { CBadge, CButton, CInline, CStack, CSurface, CText } from "../core";
import { useCommanderColors } from "../../composables/useCommanderColors";
import {
  COLOR_IDENTITY_META,
  COLOR_IDENTITY_ORDER,
  type CommanderColor,
} from "../../utils/colorIdentity";
import type { DashboardTab } from "../../types/dashboard";
import type { CommanderSelection } from "../../types/edhrec";

const props = defineProps<{
  commanderSelection: CommanderSelection;
  csvCount: number;
  hasCsvData: boolean;
  decklistReady: boolean;
  nextStepLabel: string;
}>();

const emit = defineEmits<{
  jump: [tab: DashboardTab];
}>();

const { commanderColors } = useCommanderColors();

const commanderColorBadges = computed(() => {
  const normalized = new Set(
    (commanderColors.value ?? [])
      .map((color) => color?.toUpperCase())
      .filter((value): value is CommanderColor => Boolean(value) && value in COLOR_IDENTITY_META)
  );
  return COLOR_IDENTITY_ORDER.filter((color) => normalized.has(color));
});

const csvLabel = computed(() => {
  if (!props.hasCsvData) {
    return "CSV pending";
  }
  return `${props.csvCount} card${props.csvCount === 1 ? "" : "s"} loaded`;
});

const decklistStatus = computed(() =>
  props.decklistReady ? "Export ready" : "Awaiting decklist"
);

const colorPillClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.pill ?? "";
const colorLabel = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.label ?? color;
</script>
