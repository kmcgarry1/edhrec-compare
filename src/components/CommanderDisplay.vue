<template>
  <Card
    v-if="shouldRenderCard"
    as="div"
    padding="p-4"
    rounded="rounded-2xl"
    class="w-full bg-[color:var(--surface)] text-[color:var(--text)]"
  >
    <CInline
      align="center"
      justify="between"
      gap="lg"
      class="flex-col sm:flex-row"
    >
      <CStack gap="md" class="flex-1">
        <CStack gap="2xs">
          <CText
            tag="p"
            variant="overline"
            tone="inherit"
            class="tracking-[0.3em] text-[color:var(--muted)]"
          >
            {{ label }}
          </CText>
          <CText tag="h3" variant="title" class="text-xl">
            {{ commanderName || "Commander pending" }}
          </CText>
        </CStack>

        <CSurface
          v-if="currentPrinting"
          variant="muted"
          size="sm"
          class="text-sm text-[color:var(--muted)]"
        >
          <CStack gap="md">
            <CGrid variant="halves" gap="sm">
              <CStack gap="xs" class="min-w-[100px]">
                <CText
                  variant="helper"
                  tone="muted"
                  class="uppercase tracking-wide text-[color:var(--muted)]"
                >
                  Set
                </CText>
                <CText variant="body" weight="semibold">
                  {{ setLabel }}
                </CText>
              </CStack>

              <CStack gap="xs" class="min-w-[100px]">
                <CText
                  variant="helper"
                  tone="muted"
                  class="uppercase tracking-wide text-[color:var(--muted)]"
                >
                  Collector #
                </CText>
                <CText variant="body" weight="semibold">
                  {{ collectorNumber }}
                </CText>
              </CStack>

              <CStack gap="xs" class="min-w-[100px]">
                <CText
                  variant="helper"
                  tone="muted"
                  class="uppercase tracking-wide text-[color:var(--muted)]"
                >
                  Release
                </CText>
                <CText variant="body" weight="semibold">
                  {{ releaseDate }}
                </CText>
              </CStack>

              <CStack gap="sm">
                <CStack gap="xs" class="min-w-[100px]">
                  <CText
                    variant="helper"
                    tone="muted"
                    class="uppercase tracking-wide text-[color:var(--muted)]"
                  >
                    USD Price
                  </CText>
                  <PriceColour
                    :price="currentPrinting.prices?.usd ?? null"
                    currency="$"
                    align="start"
                    class="w-full sm:w-auto"
                  />
                </CStack>

                <CStack gap="xs" class="min-w-[100px]">
                  <CText
                    variant="helper"
                    tone="muted"
                    class="uppercase tracking-wide text-[color:var(--muted)]"
                  >
                    EUR Price
                  </CText>
                  <PriceColour
                    :price="currentPrinting.prices?.eur ?? null"
                    currency="EUR "
                    align="start"
                    class="w-full sm:w-auto"
                  />
                </CStack>
              </CStack>
            </CGrid>

            <CInline
              v-if="printingsLoading"
              gap="md"
              class="pt-2"
            >
              <CText variant="helper" tone="muted">
                Loading other printings...
              </CText>
            </CInline>

            <CInline
              v-else-if="canCyclePrintings"
              gap="md"
              class="pt-2"
            >
              <CButton
                type="button"
                variant="secondary"
                size="sm"
                @click="showPreviousPrinting"
              >
                &lt; Prev
              </CButton>
              <CButton
                type="button"
                variant="secondary"
                size="sm"
                @click="showNextPrinting"
              >
                Next &gt;
              </CButton>
              <CText variant="helper" tone="muted">
                Printing {{ printingPosition }} of {{ totalPrintings }}
              </CText>
            </CInline>
          </CStack>
        </CSurface>
      </CStack>

      <CInline align="center" justify="center" class="shrink-0">
        <CSurface
          v-if="isLoading"
          variant="muted"
          size="none"
          radius="xl"
          class="h-40 w-28"
        />
        <img
          v-else-if="cardImageUrl"
          :src="cardImageUrl"
          :alt="commanderName"
          class="h-80 w-auto rounded-xl shadow-[var(--shadow)]"
        />
      </CInline>
    </CInline>
  </Card>
</template>
<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from "vue";
import {
  getCard,
  getCardPrintings,
  type ScryfallCard,
} from "../api/scryfallApi";
import { Card, PriceColour } from ".";
import {
  CButton,
  CGrid,
  CInline,
  CStack,
  CSurface,
  CText,
} from "./core";
import { useCommanderColors } from "../composables/useCommanderColors";

const props = defineProps<{
  commanderName: string;
  label?: string;
  description?: string;
}>();

const { setCommanderColors, clearCommanderColors } = useCommanderColors();
const colorSourceKey = `commander-display-${Math.random().toString(36).slice(2, 9)}`;

const printings = ref<ScryfallCard[]>([]);
const currentPrintingIndex = ref(0);
const isLoading = ref(false);
const printingsLoading = ref(false);
let activeRequestId: symbol | null = null;

const label = computed(() => props.label ?? "Commander Preview");

const shouldRenderCard = computed(() => isLoading.value || printings.value.length > 0);

const currentPrinting = computed<ScryfallCard | null>(() => {
  const entries = printings.value;
  if (!entries.length) {
    return null;
  }
  const active = entries[currentPrintingIndex.value];
  if (active) {
    return active;
  }
  return entries[0] ?? null;
});

watch(
  currentPrinting,
  (card) => {
    setCommanderColors(colorSourceKey, card?.colors ?? []);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearCommanderColors(colorSourceKey);
});

const cardImageUrl = computed(() => {
  const card = currentPrinting.value;
  if (!card) {
    return "";
  }
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }
  const faceWithImage = card.card_faces?.find((face) => face.image_uris?.normal);
  return faceWithImage?.image_uris?.normal ?? "";
});

const setLabel = computed(() => {
  const card = currentPrinting.value;
  if (!card) {
    return "--";
  }
  const code = card.set ? card.set.toUpperCase() : null;
  if (card.set_name && code) {
    return `${card.set_name} (${code})`;
  }
  return card.set_name ?? code ?? "--";
});

const collectorNumber = computed(() => currentPrinting.value?.collector_number ?? "--");

const releaseDate = computed(() => {
  const date = currentPrinting.value?.released_at;
  if (!date) {
    return "--";
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
});

const totalPrintings = computed(() => printings.value.length);
const printingPosition = computed(() =>
  totalPrintings.value ? currentPrintingIndex.value + 1 : 0
);
const canCyclePrintings = computed(() => totalPrintings.value > 1);

const showNextPrinting = () => {
  if (!printings.value.length) {
    return;
  }
  currentPrintingIndex.value = (currentPrintingIndex.value + 1) % printings.value.length;
};

const showPreviousPrinting = () => {
  if (!printings.value.length) {
    return;
  }
  currentPrintingIndex.value =
    (currentPrintingIndex.value - 1 + printings.value.length) % printings.value.length;
};

const loadCommanderData = async () => {
  if (!props.commanderName) {
    printings.value = [];
    currentPrintingIndex.value = 0;
    clearCommanderColors(colorSourceKey);
    return;
  }

  const requestId = Symbol("commander-load");
  activeRequestId = requestId;
  isLoading.value = true;
  try {
    const card = await getCard(props.commanderName);
    if (!card) {
      if (activeRequestId === requestId) {
        printings.value = [];
        currentPrintingIndex.value = 0;
        clearCommanderColors(colorSourceKey);
      }
      return;
    }

    let nextPrintings: ScryfallCard[] = [card];

    if (card.prints_search_uri) {
      if (activeRequestId === requestId) {
        printingsLoading.value = true;
      }
      try {
        const allPrints = await getCardPrintings(card.prints_search_uri);
        if (allPrints.length) {
          nextPrintings = allPrints;
        }
      } finally {
        if (activeRequestId === requestId) {
          printingsLoading.value = false;
        }
      }
    }

    if (activeRequestId !== requestId) {
      return;
    }

    printings.value = nextPrintings;
    currentPrintingIndex.value = 0;
    setCommanderColors(colorSourceKey, nextPrintings[0]?.colors ?? []);
  } catch {
    if (activeRequestId === requestId) {
      printings.value = [];
      currentPrintingIndex.value = 0;
      clearCommanderColors(colorSourceKey);
    }
  } finally {
    if (activeRequestId === requestId) {
      isLoading.value = false;
    }
  }
};

watch(
  () => props.commanderName,
  () => {
    void loadCommanderData();
  },
  { immediate: true }
);
</script>
