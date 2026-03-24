<template>
  <section class="mx-auto w-full max-w-[104rem] px-4 pb-12 pt-4 sm:px-6 lg:px-8 2xl:px-10">
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
      <DashboardHero
        v-if="!hasCommander && !hasCsvData"
        @browse="openBrowseRail"
        @upload="openUploadModal"
      />
      <DashboardCommanderMasthead
        v-else-if="hasCommander"
        :commander-selection="commanderSelection"
        :spotlight-cards="commanderSpotlightCards"
        :spotlight-loading="commanderSpotlightLoading"
        :backdrop-url="commanderSpotlightBackdropUrl"
        :csv-count="csvCount"
        :has-csv-data="hasCsvData"
        :decklist-ready="Boolean(decklistExport?.text)"
        :decklist-section-count="decklistSectionCount"
        :next-step-label="nextStepLabel"
        @browse="openBrowseRail"
        @upload="openUploadModal"
      />

      <CsvUploadModal :open="showUploadModal" @close="showUploadModal = false" />

      <main id="main-content" ref="mainContentRef" class="mt-6 space-y-5">
        <DashboardSelectionStage
          v-if="hasCsvData && !hasCommander"
          :csv-count="csvCount"
          :density="density"
          :density-options="densityOptions"
          :theme="theme"
          :background-enabled="backgroundEnabled"
          :utility-drawer-open="utilityDrawerOpen"
          @open-upload="openUploadModal"
          @selection-change="handleSelectionChange"
          @density-change="setDensity"
          @toggle-theme="toggleTheme"
          @toggle-background="toggleBackground"
          @toggle-utility="toggleUtilityDrawer"
        />

        <template v-else-if="hasCommander">
          <DashboardToolbar
            :next-step-label="nextStepLabel"
            :next-step-action-label="nextStepActionLabel"
            :has-commander="hasCommander"
            :has-csv-data="hasCsvData"
            :csv-count="csvCount"
            :inventory-summary="inventorySummary"
            :filter-options="filterOptions"
            :decklist-text="decklistExport?.text"
            :decklist-section-count="decklistSectionCount"
            :copied="decklistCopied"
            :density="density"
            :density-options="densityOptions"
            :theme="theme"
            :background-enabled="backgroundEnabled"
            :browse-rail-open="browseRailOpen"
            :utility-drawer-open="utilityDrawerOpen"
            @next-action="handleNextStepAction"
            @open-upload="openUploadModal"
            @filter-change="setOwnedFilter"
            @copy="copyDecklistFromHeader"
            @download="downloadDecklistFromHeader"
            @density-change="setDensity"
            @toggle-theme="toggleTheme"
            @toggle-background="toggleBackground"
            @toggle-browse="toggleBrowseRail"
            @toggle-utility="toggleUtilityDrawer"
          />

          <DashboardWorkspace
            :browse-rail-open="browseRailOpen"
            @decklistUpdate="handleDecklistUpdate"
            @selection-change="handleSelectionChange"
            @close-browse="closeBrowseRail"
          />

          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
            <TopCommanderScanPanel />
            <SiteNotice />
          </div>
        </template>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import SiteNotice from "./SiteNotice.vue";
import TopCommanderScanPanel from "./TopCommanderScanPanel.vue";
import DashboardHero from "./dashboard/DashboardHero.vue";
import DashboardCommanderMasthead from "./dashboard/DashboardCommanderMasthead.vue";
import DashboardSelectionStage from "./dashboard/DashboardSelectionStage.vue";
import DashboardToolbar from "./dashboard/DashboardToolbar.vue";
import DashboardWorkspace from "./dashboard/DashboardWorkspace.vue";
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
  browseRailOpen,
  utilityDrawerOpen,
  commanderSelection,
  commanderSpotlightCards,
  commanderSpotlightLoading,
  commanderSpotlightBackdropUrl,
  hasCommander,
  hasCsvData,
  decklistSectionCount,
  showOnboarding,
  csvCount,
  inventorySummary,
  nextStepLabel,
  nextStepActionLabel,
  filterOptions,
  openUploadModal,
  openBrowseRail,
  closeBrowseRail,
  toggleBrowseRail,
  toggleUtilityDrawer,
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
