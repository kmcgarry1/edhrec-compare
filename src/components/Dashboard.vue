<template>
  <section
    class="mx-auto flex min-h-screen w-full max-w-[104rem] flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8 2xl:px-10"
  >
    <GlobalLoadingBanner />

    <main
      id="main-content"
      ref="mainContentRef"
      :class="
        hasCommander
          ? 'mt-5 flex-1 space-y-4'
          : 'mt-2 flex min-h-[calc(100vh-5.5rem)] flex-1 items-center'
      "
    >
      <DashboardSelectionStage
        v-if="!hasCommander"
        class="w-full"
        :has-csv-data="hasCsvData"
        :csv-count="csvCount"
        @open-upload="openUploadModal"
        @open-utilities="openUtilityTray"
        @selection-change="handleSelectionChange"
      />

      <template v-else-if="hasCommander">
        <DashboardWorkspace
          :control-panel-open="controlPanelOpen"
          :commander-selection="commanderSelection"
          :commander-profiles="commanderProfiles"
          :commander-spotlight-loading="commanderSpotlightLoading"
          :commander-spotlight-backdrop-url="commanderSpotlightBackdropUrl"
          :canonical-edhrec-href="canonicalEdhrecHref"
          :next-step-label="nextStepLabel"
          :has-csv-data="hasCsvData"
          :inventory-summary="inventorySummary"
          :filter-options="filterOptions"
          @decklistUpdate="handleDecklistUpdate"
          @selection-change="handleSelectionChange"
          @filter-change="setOwnedFilter"
          @open-control-panel="openControlPanel"
          @open-utilities="openUtilityTray"
          @previous-printing="showPreviousCommanderPrinting"
          @next-printing="showNextCommanderPrinting"
          @close-control-panel="closeControlPanel"
        />
      </template>
    </main>

    <DashboardUtilityTray
      :open="utilityTrayOpen"
      :title="
        hasCommander ? 'Collection, export, and display settings' : 'Collection, scan, and display settings'
      "
      :description="
        hasCommander
          ? 'Secondary dashboard actions stay here so the compare canvas can stay focused.'
          : 'Keep search dominant on the landing state while collection tools and scan utilities stay tucked away.'
      "
      @close="closeUtilityTray"
    >
      <DashboardUtilityContent
        :has-commander="hasCommander"
        :has-csv-data="hasCsvData"
        :inventory-summary="inventorySummary"
        :collection-mode-label="collectionModeLabel"
        :collection-mode-hint="collectionModeHint"
        :collection-source-name="collectionSourceName"
        :collection-imported-at="collectionImportedAt"
        :decklist-text="decklistExport?.text"
        :decklist-copied="decklistCopied"
        :export-helper-text="exportHelperText"
        :density="density"
        :density-options="densityOptions"
        :theme="theme"
        :background-enabled="backgroundEnabled"
        @open-upload="openUploadModal"
        @clear-upload="clearUploadedCollection"
        @copy-decklist="copyDecklistFromHeader"
        @download-decklist="downloadDecklistFromHeader"
        @density-change="setDensity"
        @toggle-theme="toggleTheme"
        @toggle-background="toggleBackground"
      />
    </DashboardUtilityTray>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import DashboardSelectionStage from "./dashboard/DashboardSelectionStage.vue";
import DashboardUtilityContent from "./dashboard/DashboardUtilityContent.vue";
import DashboardUtilityTray from "./dashboard/DashboardUtilityTray.vue";
import { useDashboardState } from "../composables/useDashboardState";

const DashboardWorkspace = defineAsyncComponent(() => import("./dashboard/DashboardWorkspace.vue"));

const {
  decklistExport,
  decklistCopied,
  mainContentRef,
  controlPanelOpen,
  utilityTrayOpen,
  commanderSelection,
  commanderProfiles,
  commanderSpotlightLoading,
  commanderSpotlightBackdropUrl,
  canonicalEdhrecHref,
  hasCommander,
  hasCsvData,
  csvCount,
  inventorySummary,
  theme,
  toggleTheme,
  backgroundEnabled,
  toggleBackground,
  density,
  setDensity,
  densityOptions,
  collectionModeLabel,
  collectionModeHint,
  collectionSourceName,
  collectionImportedAt,
  nextStepLabel,
  exportHelperText,
  filterOptions,
  openUploadModal,
  clearUploadedCollection,
  openControlPanel,
  closeControlPanel,
  openUtilityTray,
  closeUtilityTray,
  handleDecklistUpdate,
  handleSelectionChange,
  copyDecklistFromHeader,
  downloadDecklistFromHeader,
  showNextCommanderPrinting,
  showPreviousCommanderPrinting,
  setOwnedFilter,
} = useDashboardState();
</script>
