<template>
  <section class="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10">
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
      <DashboardHero @jump="jumpToTab" />

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

        <div class="grid gap-6 lg:grid-cols-[18rem,1fr]">
          <section class="space-y-4">
            <section
              v-show="activeTab === 'search'"
              id="panel-search"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-search'"
              :aria-hidden="activeTab !== 'search'"
              class="space-y-4"
            >
              <DashboardSearchPanel
                @decklistUpdate="handleDecklistUpdate"
                @selection-change="handleSelectionChange"
              />
            </section>

            <section
              v-show="activeTab === 'collection'"
              id="panel-collection"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-collection'"
              :aria-hidden="activeTab !== 'collection'"
              class="space-y-4"
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
              v-show="activeTab === 'export'"
              id="panel-export"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-export'"
              class="space-y-4"
            >
              <DashboardExportPanel
                :helper-text="exportHelperText"
                :decklist-text="decklistExport?.text"
                :copied="decklistCopied"
                @copy="copyDecklistFromHeader"
                @download="downloadDecklistFromHeader"
              />
            </section>
          </section>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import DashboardHero from "./dashboard/DashboardHero.vue";
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
</script>
