<template>
  <section class="mx-auto w-full max-w-[96rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:px-10">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <GlobalLoadingBanner />
    <OnboardingModal
      :open="showOnboarding"
      @upload="openUploadModalFromOnboarding"
      @dismiss="dismissOnboarding"
    />
    <div
      :inert="showOnboarding ? true : undefined"
      :aria-hidden="showOnboarding ? 'true' : undefined"
    >
      <DashboardHero v-if="!hasCommander" @jump="jumpToTab" />
      <DashboardCommanderMasthead
        v-else
        :commander-selection="commanderSelection"
        :csv-count="csvCount"
        :has-csv-data="hasCsvData"
        :decklist-ready="Boolean(decklistExport?.text)"
        :next-step-label="nextStepLabel"
        @jump="jumpToTab"
      />

      <CsvUploadModal :open="showUploadModal" @close="showUploadModal = false" />

      <main
        id="main-content"
        ref="mainContentRef"
        class="mt-8 space-y-6"
      >
        <div class="sticky top-4 z-40 isolate">
          <DashboardToolbar
            :next-step-label="nextStepLabel"
            :next-step-action-label="nextStepActionLabel"
            :filter-options="filterOptions"
            :tab-options="tabOptions"
            :active-tab="activeTab"
            @next-action="handleNextStepAction"
            @filter-change="setOwnedFilter"
            @tab-change="setActiveTab"
          />
        </div>

        <div class="command-deck-grid grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
          <section class="min-w-0 space-y-4">
            <section
              id="panel-search"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-search'"
              :aria-hidden="activeTab !== 'search' && !hasCommander ? 'true' : undefined"
              :class="panelClass('search')"
            >
              <DashboardSearchPanel
                @decklistUpdate="handleDecklistUpdate"
                @selection-change="handleSelectionChange"
              />
            </section>
          </section>

          <aside class="space-y-4 xl:sticky xl:top-28">
            <section
              id="panel-collection"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-collection'"
              :aria-hidden="activeTab !== 'collection' && !hasCommander ? 'true' : undefined"
              :class="panelClass('collection')"
            >
              <DashboardCollectionPanel
                :commander-selection="commanderSelection"
                :csv-count="csvCount"
                :inventory-summary="inventorySummary"
                :filter-options="filterOptions"
                :density-options="densityOptions"
                :density="density"
                :theme="theme"
                :background-enabled="backgroundEnabled"
                @open-upload="showUploadModal = true"
                @filter-change="setOwnedFilter"
                @density-change="setDensity"
                @toggle-theme="toggleTheme"
                @toggle-background="toggleBackground"
              />
            </section>

            <section
              id="panel-export"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-export'"
              :aria-hidden="activeTab !== 'export' && !hasCommander ? 'true' : undefined"
              :class="panelClass('export')"
            >
              <DashboardExportPanel
                :helper-text="exportHelperText"
                :decklist-text="decklistExport?.text"
                :copied="decklistCopied"
                @copy="copyDecklistFromHeader"
                @download="downloadDecklistFromHeader"
              />
            </section>
          </aside>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import DashboardHero from "./dashboard/DashboardHero.vue";
import DashboardCommanderMasthead from "./dashboard/DashboardCommanderMasthead.vue";
import DashboardToolbar from "./dashboard/DashboardToolbar.vue";
import DashboardSearchPanel from "./dashboard/DashboardSearchPanel.vue";
import DashboardCollectionPanel from "./dashboard/DashboardCollectionPanel.vue";
import DashboardExportPanel from "./dashboard/DashboardExportPanel.vue";
import { useDashboardState } from "../composables/useDashboardState";

const OnboardingModal = defineAsyncComponent(() => import("./OnboardingModal.vue"));
const CsvUploadModal = defineAsyncComponent(() => import("./CsvUploadModal.vue"));

const {
  theme,
  toggleTheme,
  backgroundEnabled,
  toggleBackground,
  density,
  setDensity,
  densityOptions,
  showUploadModal,
  decklistExport,
  decklistCopied,
  activeTab,
  tabOptions,
  commanderSelection,
  hasCommander,
  hasCsvData,
  showOnboarding,
  csvCount,
  inventorySummary,
  nextStepLabel,
  nextStepActionLabel,
  exportHelperText,
  filterOptions,
  setActiveTab,
  jumpToTab,
  handleNextStepAction,
  handleDecklistUpdate,
  handleSelectionChange,
  copyDecklistFromHeader,
  downloadDecklistFromHeader,
  setOwnedFilter,
  dismissOnboarding,
  openUploadModalFromOnboarding,
} = useDashboardState();

const panelClass = (tab: "search" | "collection" | "export") => {
  if (activeTab.value === tab) {
    return "space-y-4";
  }
  return hasCommander.value ? "hidden space-y-4 xl:block" : "hidden space-y-4";
};
</script>
