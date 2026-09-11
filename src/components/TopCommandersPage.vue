<template>
  <section class="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
    <GlobalLoadingBanner />
    <CsvUploadModal
      v-if="showUploadModal"
      :open="showUploadModal"
      @close="showUploadModal = false"
    />

    <main id="main-content" class="space-y-4">
      <CSurface variant="content" size="sm" radius="xl" shadow="none" class="space-y-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-3xl space-y-1">
            <CText tag="h1" variant="title" class="text-2xl sm:text-3xl">Top Commanders</CText>
            <CText tag="p" variant="body" tone="muted">
              Browse ranked commanders and scan ownership when a collection is loaded.
            </CText>
          </div>
          <CButton
            type="button"
            :variant="hasCsvData ? 'secondary' : 'primary'"
            @click="showUploadModal = true"
          >
            {{ hasCsvData ? "Replace collection" : "Upload collection" }}
          </CButton>
        </div>

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
          :can-sort-owned="canSortOwned"
          @limit-change="handleTopLimitChange"
          @sort-change="handleSortChange"
          @refresh="refreshTopCommanders"
        />
        <TopCommandersColorFilter
          :color-options="colorOptions"
          :selected-colors="selectedColors"
          :color-pill-class="colorPillClass"
          :color-label="colorLabel"
          @toggle-color="toggleColor"
          @clear="clearColors"
        />
      </CSurface>

      <CSurface variant="content" size="sm" radius="xl" shadow="none" class="space-y-2">
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

        <CGrid v-else variant="cards" gap="md">
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
      </CSurface>
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import { CButton, CGrid, CNotice, CSurface, CText } from "./core";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useTopCommanderScan } from "../composables/useTopCommanderScan";
import { useTopCommandersData } from "../composables/useTopCommandersData";
import { useTopCommanderImages } from "../composables/useTopCommanderImages";
import { useTopCommanderFilters } from "../composables/useTopCommanderFilters";
import TopCommandersStatusCard from "./top-commanders/TopCommandersStatusCard.vue";
import TopCommandersControls from "./top-commanders/TopCommandersControls.vue";
import TopCommandersColorFilter from "./top-commanders/TopCommandersColorFilter.vue";
import TopCommanderCard from "./top-commanders/TopCommanderCard.vue";

const CsvUploadModal = defineAsyncComponent(() => import("./CsvUploadModal.vue"));

const showUploadModal = ref(false);

const { rows, headers } = useCsvUpload();
const {
  results,
  lastUpdated,
  error: scanError,
  failedCount,
  isLoading: scanLoading,
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
  colorPillClass,
  colorLabel,
  matchesColorFilter,
} = useTopCommanderFilters({ getCommanderColors: combinedColorIdentity });

const hasCsvData = computed(() => rows.value.length > 0);
const csvCount = computed(() => rows.value.length);
const canSortOwned = computed(
  () => hasCsvData.value && !scanLoading.value && results.value.length > 0
);

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

const handleSortChange = (value: typeof sortMode.value) => {
  if (value === "owned" && !canSortOwned.value) {
    return;
  }
  setSortMode(value);
};

const handleTopLimitChange = (value: (typeof limitOptions)[number]) => {
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

onMounted(() => {
  void loadTopCommanders();
});
</script>
