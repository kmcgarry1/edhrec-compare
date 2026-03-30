<template>
  <section
    class="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10"
  >
    <GlobalLoadingBanner />
    <CsvUploadModal v-if="showUploadModal" :open="showUploadModal" @close="showUploadModal = false" />

    <TopCommandersHero
      :has-csv-data="hasCsvData"
      :csv-count="csvCount"
      @upload="showUploadModal = true"
    />

    <main id="main-content" class="mt-8 space-y-6">
      <Card variant="command" padding="p-4 sm:p-5" class="space-y-4">
        <TopCommandersStatusCard
          :has-csv-data="hasCsvData"
          :csv-count="csvCount"
          :last-updated="lastUpdated"
          :failed-count="failedCount"
          :scan-scope="scanScope"
          :scan-error="scanError"
        />
        <TopCommandersControls
          :top-header="topHeader"
          :top-limit="topLimit"
          :limit-options="limitOptions"
          :sort-options="sortOptions"
          :sort-mode="sortMode"
          :top-loading="topLoading"
          @limit-change="handleTopLimitChange"
          @sort-change="setSortMode"
          @refresh="refreshTopCommanders"
        />
        <TopCommandersColorFilter
          :color-options="colorOptions"
          :selected-colors="selectedColors"
          :mana-symbol="manaSymbol"
          :color-dot-class="colorDotClass"
          :color-pill-class="colorPillClass"
          :color-label="colorLabel"
          @toggle-color="toggleColor"
          @clear="clearColors"
        />
        <TopCommandersOwnedLegend />
      </Card>

      <Card variant="content" padding="p-4 sm:p-5" class="space-y-4">
        <CNotice
          v-if="topLoading"
          tone="info"
          message="Loading top commanders..."
          class="bg-[color:var(--surface-muted)]"
        />
        <CNotice
          v-else-if="topError"
          tone="danger"
          :message="topError"
          role="alert"
          aria-live="assertive"
        />

        <CGrid
          v-else
          variant="cards"
          gap="md"
          class="xl:grid-cols-2 2xl:grid-cols-3"
        >
          <TopCommanderCard
            v-for="commander in sortedCommanders"
            :key="commander.slug"
            :commander="commander"
            :scan-result="scanLookup.get(commander.slug) ?? null"
            :has-csv-data="hasCsvData"
            :image-stack="getImageStack(commander.name)"
            :image-loading="imageLoading"
            :colors="combinedColorIdentity(commander.name)"
          />
        </CGrid>
      </Card>

      <SiteNotice />
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import Card from "./Card.vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import SiteNotice from "./SiteNotice.vue";
import { CGrid, CNotice } from "./core";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useTopCommanderScan } from "../composables/useTopCommanderScan";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";
import { useTopCommandersData } from "../composables/useTopCommandersData";
import { useTopCommanderImages } from "../composables/useTopCommanderImages";
import { useTopCommanderFilters } from "../composables/useTopCommanderFilters";
import { type CommanderColor } from "../utils/colorIdentity";
import TopCommandersHero from "./top-commanders/TopCommandersHero.vue";
import TopCommandersStatusCard from "./top-commanders/TopCommandersStatusCard.vue";
import TopCommandersControls from "./top-commanders/TopCommandersControls.vue";
import TopCommandersColorFilter from "./top-commanders/TopCommandersColorFilter.vue";
import TopCommandersOwnedLegend from "./top-commanders/TopCommandersOwnedLegend.vue";
import TopCommanderCard from "./top-commanders/TopCommanderCard.vue";

const CsvUploadModal = defineAsyncComponent(() => import("./CsvUploadModal.vue"));

const showUploadModal = ref(false);

const { rows, headers } = useCsvUpload();
const {
  results,
  lastUpdated,
  error: scanError,
  failedCount,
  scope: scanScope,
  runScan,
  clearResults,
} = useTopCommanderScan();

const {
  topCommanders,
  topHeader,
  topLoading,
  topError,
  topLimit,
  sortMode,
  sortOptions,
  limitOptions,
  fetchTopCommanders,
  setSortMode,
  setTopLimit,
} = useTopCommandersData();

const { imageLoading, getImageStack, loadCommanderImages, combinedColorIdentity } =
  useTopCommanderImages();

const {
  selectedColors,
  colorOptions,
  toggleColor,
  clearColors,
  selectedColorPath,
  colorDotClass,
  colorPillClass,
  colorLabel,
  matchesColorFilter,
} = useTopCommanderFilters({ getCommanderColors: combinedColorIdentity });

const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();

const hasCsvData = computed(() => rows.value.length > 0);
const csvCount = computed(() => rows.value.length);

const scanLookup = computed(() => {
  const map = new Map<string, (typeof results.value)[number]>();
  results.value.forEach((entry) => map.set(entry.slug, entry));
  return map;
});

const filteredCommanders = computed(() =>
  topCommanders.value.filter((commander) => matchesColorFilter(commander.name))
);

const sortedCommanders = computed(() => {
  const base = filteredCommanders.value;
  if (sortMode.value !== "owned") {
    return base;
  }
  const entries = [...base];
  entries.sort((a, b) => {
    const aResult = scanLookup.value.get(a.slug);
    const bResult = scanLookup.value.get(b.slug);
    const aPercent = aResult?.ownedPercent ?? -1;
    const bPercent = bResult?.ownedPercent ?? -1;
    if (bPercent !== aPercent) {
      return bPercent - aPercent;
    }
    return (a.rank ?? 0) - (b.rank ?? 0);
  });
  return entries;
});

const loadTopCommanders = async () => {
  const commanders = await fetchTopCommanders(selectedColorPath.value);
  if (commanders) {
    await loadCommanderImages(commanders.map((entry) => entry.name));
  }
};

const refreshTopCommanders = () => {
  void loadTopCommanders();
};

const handleTopLimitChange = (value: typeof limitOptions[number]) => {
  if (!setTopLimit(value)) {
    return;
  }
  void loadTopCommanders();
  if (hasCsvData.value) {
    void runScan(rows.value, headers.value, {
      limit: topLimit.value,
      force: true,
      path: selectedColorPath.value,
    });
  }
};

watch(
  [rows, headers],
  ([nextRows, nextHeaders]) => {
    if (!nextRows.length) {
      clearResults();
      return;
    }
    if (!nextHeaders.length) {
      return;
    }
    void runScan(nextRows, nextHeaders, {
      limit: topLimit.value,
      path: selectedColorPath.value,
    });
  },
  { immediate: true }
);

const handleSelectedColorPathChange = useDebounceFn(() => {
  void loadTopCommanders();
  if (hasCsvData.value) {
    void runScan(rows.value, headers.value, {
      limit: topLimit.value,
      force: true,
      path: selectedColorPath.value,
    });
  }
}, 250);

watch(selectedColorPath, () => {
  handleSelectedColorPathChange();
});

const manaTokenMap: Record<CommanderColor, string> = {
  W: "{W}",
  U: "{U}",
  B: "{B}",
  R: "{R}",
  G: "{G}",
  C: "{C}",
};

const manaSymbol = (color: CommanderColor) =>
  getSvgForSymbol(manaTokenMap[color]) ?? undefined;

onMounted(() => {
  void ensureSymbolsLoaded();
  void loadTopCommanders();
});
</script>
