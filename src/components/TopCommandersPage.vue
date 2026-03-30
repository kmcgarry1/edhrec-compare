<template>
  <section
    class="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10"
  >
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <GlobalLoadingBanner />

    <main id="main-content" class="mt-5 space-y-4">
      <Card
        variant="command"
        padding="p-4 sm:p-5"
        class="sticky top-24 z-20 space-y-4 border border-[color:var(--border)] bg-[color:var(--surface-strong)] backdrop-blur"
      >
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div class="space-y-3">
            <div class="flex flex-wrap gap-2">
              <CBadge tone="default" variant="outline" size="sm" text-case="normal">
                Ranking dashboard
              </CBadge>
              <CBadge
                :tone="hasCsvData ? 'success' : 'muted'"
                variant="soft"
                size="sm"
                text-case="normal"
              >
                {{ csvStatusLabel }}
              </CBadge>
              <CBadge tone="default" variant="soft" size="sm" text-case="normal">
                {{ topHeader }}
              </CBadge>
            </div>

            <div class="space-y-1">
              <CText tag="h1" variant="title" class="text-xl sm:text-2xl">
                Scan commanders and jump straight into compare
              </CText>
              <CText tag="p" variant="helper" tone="muted" class="max-w-3xl">
                Filter the ranking, sort by owned overlap when a collection is loaded, and open a
                commander route as soon as something looks promising.
              </CText>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <CButton type="button" variant="primary" size="sm" @click="openUploadModal">
              {{ hasCsvData ? "Replace collection CSV" : "Upload collection CSV" }}
            </CButton>
            <CButton
              type="button"
              variant="secondary"
              size="sm"
              :disabled="topLoading"
              @click="refreshTopCommanders"
            >
              Refresh list
            </CButton>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <CBadge tone="default" variant="soft" size="sm" text-case="normal">
            {{ topLimit }} ranked
          </CBadge>
          <CBadge tone="default" variant="soft" size="sm" text-case="normal">
            {{ sortedCommanders.length }} visible
          </CBadge>
          <CBadge tone="accent" variant="soft" size="sm" text-case="normal">
            {{ sortMode === "owned" ? "Sorted by owned overlap" : "Sorted by rank" }}
          </CBadge>
          <CBadge
            v-if="formattedLastUpdated"
            tone="muted"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            Updated {{ formattedLastUpdated }}
          </CBadge>
          <CBadge
            v-if="failedCount"
            tone="warn"
            variant="soft"
            size="sm"
            text-case="normal"
          >
            {{ failedCount }} failed to load
          </CBadge>
        </div>

        <div class="grid gap-3 xl:grid-cols-[auto_auto_minmax(0,1fr)] xl:items-end">
          <section class="space-y-2">
            <CText tag="p" variant="eyebrow" tone="muted">Range</CText>
            <div
              class="inline-flex flex-wrap items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1"
              role="group"
              aria-label="Choose top commanders range"
            >
              <CButton
                v-for="option in limitOptions"
                :key="option"
                type="button"
                size="sm"
                :variant="topLimit === option ? 'soft' : 'ghost'"
                :class="topLimit === option ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]' : ''"
                :aria-pressed="topLimit === option"
                @click="handleTopLimitChange(option)"
              >
                Top {{ option }}
              </CButton>
            </div>
          </section>

          <section class="space-y-2">
            <CText tag="p" variant="eyebrow" tone="muted">Sort</CText>
            <div
              class="inline-flex flex-wrap items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1"
              role="group"
              aria-label="Sort commanders"
            >
              <CButton
                v-for="option in sortOptions"
                :key="option.value"
                type="button"
                size="sm"
                :variant="sortMode === option.value ? 'soft' : 'ghost'"
                :class="sortMode === option.value ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]' : ''"
                :aria-pressed="sortMode === option.value"
                @click="setSortMode(option.value)"
              >
                {{ option.label }}
              </CButton>
            </div>
          </section>

          <section class="space-y-2">
            <CText tag="p" variant="eyebrow" tone="muted">Color identity</CText>
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
          </section>
        </div>

        <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <TopCommandersOwnedLegend />
          <CText tag="p" variant="helper" tone="muted">
            {{ scanStatusLabel }}
          </CText>
        </div>

        <CNotice
          v-if="scanError"
          tone="danger"
          :message="scanError"
          role="alert"
          aria-live="assertive"
        />
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
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { Card, GlobalLoadingBanner } from ".";
import { CBadge, CButton, CGrid, CNotice, CText } from "./core";
import TopCommandersColorFilter from "./top-commanders/TopCommandersColorFilter.vue";
import TopCommandersOwnedLegend from "./top-commanders/TopCommandersOwnedLegend.vue";
import TopCommanderCard from "./top-commanders/TopCommanderCard.vue";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useTopCommanderScan } from "../composables/useTopCommanderScan";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";
import { useTopCommandersData } from "../composables/useTopCommandersData";
import { useTopCommanderImages } from "../composables/useTopCommanderImages";
import { useTopCommanderFilters } from "../composables/useTopCommanderFilters";
import { useUploadModal } from "../composables/useUploadModal";
import { type CommanderColor } from "../utils/colorIdentity";

const { rows, headers } = useCsvUpload();
const {
  results,
  lastUpdated,
  error: scanError,
  failedCount,
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
const { openUploadModal } = useUploadModal();

const hasCsvData = computed(() => rows.value.length > 0);
const csvCount = computed(() => rows.value.length);
const csvStatusLabel = computed(() =>
  hasCsvData.value ? `${csvCount.value} cards loaded` : "Collection upload optional"
);
const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) {
    return "";
  }
  return lastUpdated.value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});
const scanStatusLabel = computed(() => {
  if (!hasCsvData.value) {
    return "Upload a collection to surface owned overlap across the ranking.";
  }
  if (!results.value.length) {
    return "Collection loaded. Ownership scan will fill in as commander averages finish loading.";
  }
  return `Ownership scan is active for ${results.value.length} ranked commanders.`;
});

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
