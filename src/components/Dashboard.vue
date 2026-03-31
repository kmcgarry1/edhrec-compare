<template>
  <section
    class="mx-auto flex min-h-screen w-full max-w-[104rem] flex-col px-4 pb-12 pt-4 sm:px-6 lg:px-8 2xl:px-10"
  >
    <GlobalLoadingBanner />

    <main
      id="main-content"
      :ref="setMainContentRef"
      class="mt-2 flex min-h-[calc(100vh-5.5rem)] flex-1 items-center"
    >
      <DashboardSelectionStage
        class="w-full"
        :has-csv-data="hasCsvData"
        :csv-count="csvCount"
        @open-upload="openUploadModal"
        @open-utilities="openUtilityTray"
        @selection-change="handleSelectionChange"
      />
    </main>

    <DashboardUtilityTray
      :open="utilityTrayOpen"
      title="Collection, scan, and display settings"
      description="Keep search dominant on the landing state while collection tools and scan utilities stay tucked away."
      @close="closeUtilityTray"
    >
      <DashboardUtilityContent
        :has-commander="false"
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
import type { ComponentPublicInstance } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import DashboardSelectionStage from "./dashboard/DashboardSelectionStage.vue";
import DashboardUtilityContent from "./dashboard/DashboardUtilityContent.vue";
import DashboardUtilityTray from "./dashboard/DashboardUtilityTray.vue";
import { useDashboardState } from "../composables/useDashboardState";

const {
  decklistExport,
  decklistCopied,
  mainContentRef,
  utilityTrayOpen,
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
  exportHelperText,
  openUploadModal,
  clearUploadedCollection,
  openUtilityTray,
  closeUtilityTray,
  handleSelectionChange,
  copyDecklistFromHeader,
  downloadDecklistFromHeader,
} = useDashboardState();

const setMainContentRef = (element: Element | ComponentPublicInstance | null) => {
  mainContentRef.value = element instanceof HTMLElement ? element : null;
};
</script>
