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
          :csv-count="csvCount"
          :inventory-summary="inventorySummary"
          :collection-source-name="collectionSourceName"
          :collection-imported-at="collectionImportedAt"
          :collection-mode-label="collectionModeLabel"
          :collection-mode-hint="collectionModeHint"
          :filter-options="filterOptions"
          :decklist-text="decklistExport?.text"
          :decklist-copied="decklistCopied"
          :export-helper-text="exportHelperText"
          @decklistUpdate="handleDecklistUpdate"
          @selection-change="handleSelectionChange"
          @filter-change="setOwnedFilter"
          @open-control-panel="openControlPanel"
          @open-upload="openUploadModal"
          @clear-upload="clearUploadedCollection"
          @previous-printing="showPreviousCommanderPrinting"
          @next-printing="showNextCommanderPrinting"
          @close-control-panel="closeControlPanel"
          @copy-header-decklist="copyDecklistFromHeader"
          @download-header-decklist="downloadDecklistFromHeader"
        />
      </template>
    </main>
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import DashboardSelectionStage from "./dashboard/DashboardSelectionStage.vue";
import { useDashboardState } from "../composables/useDashboardState";

const DashboardWorkspace = defineAsyncComponent(() => import("./dashboard/DashboardWorkspace.vue"));

const {
  decklistExport,
  decklistCopied,
  controlPanelOpen,
  commanderSelection,
  commanderProfiles,
  commanderSpotlightLoading,
  commanderSpotlightBackdropUrl,
  canonicalEdhrecHref,
  hasCommander,
  hasCsvData,
  csvCount,
  inventorySummary,
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
  handleDecklistUpdate,
  handleSelectionChange,
  copyDecklistFromHeader,
  downloadDecklistFromHeader,
  showNextCommanderPrinting,
  showPreviousCommanderPrinting,
  setOwnedFilter,
} = useDashboardState();
</script>
