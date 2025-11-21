<template>
  <section
    class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8"
  >
    <GlobalLoadingBanner />
    <OnboardingModal
      :open="showOnboarding"
      @upload="openUploadModalFromOnboarding"
      @dismiss="dismissOnboarding"
    />
    <div
      :inert="showOnboarding ? '' : undefined"
      :aria-hidden="showOnboarding ? 'true' : undefined"
    >
      <ToolkitHeader
      v-if="!headerCollapsed"
      :theme="theme"
      :background-enabled="backgroundEnabled"
      :show-owned="showOwned"
      :decklist-available="Boolean(decklistExport?.text)"
      :decklist-copied="decklistCopied"
      @collapse="collapseHeader"
      @toggle-theme="toggleTheme"
      @toggle-background="toggleBackground"
      @show-upload="showUploadModal = true"
      @set-owned="setOwnedFilter"
      @copy-decklist="copyDecklistFromHeader"
      @download-decklist="downloadDecklistFromHeader"
    />

      <button
      v-else
      type="button"
      class="sticky top-4 z-40 mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-900/10 backdrop-blur transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
      aria-label="Show toolkit controls"
      aria-expanded="false"
      @click="expandHeader"
    >
      <span aria-hidden="true">☰</span>
      <span>Show Toolkit</span>
    </button>

      <CsvUploadModal :open="showUploadModal" @close="showUploadModal = false" />

      <EdhrecReader @decklistUpdate="handleDecklistUpdate" />

      <SiteNotice />
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import {
  EdhrecReader,
  GlobalLoadingBanner,
  SiteNotice,
  ToolkitHeader,
  OnboardingModal,
  CsvUploadModal,
} from "../components";
import { useTheme } from "../composables/useTheme";
import { useOwnedFilter } from "../composables/useOwnedFilter";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useBackgroundPreference } from "../composables/useBackgroundPreference";

type DecklistPayload = {
  text: string;
  filterLabel: string;
  sections: Array<{ id: string; label: string; text: string }>;
};

const { theme, toggleTheme } = useTheme();
const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
const { rows: csvRows } = useCsvUpload();
const hasCsvData = computed(() => csvRows.value.length > 0);
const { showOwned, setOwnedFilter } = useOwnedFilter();
const showUploadModal = ref(false);
const headerCollapsed = ref(false);
const decklistExport = ref<DecklistPayload | null>(null);
const decklistCopied = ref(false);
let decklistCopyHandle: ReturnType<typeof setTimeout> | null = null;
const onboardingDismissed = ref(false);
const showOnboarding = computed(
  () => !onboardingDismissed.value && !hasCsvData.value
);

const collapseHeader = () => {
  headerCollapsed.value = true;
};

const expandHeader = () => {
  headerCollapsed.value = false;
};

onMounted(() => {
  if (typeof window !== "undefined") {
    const prefersCollapse = window.matchMedia("(max-width: 640px)");
    if (prefersCollapse.matches) {
      headerCollapsed.value = true;
    }
  }
});

const clearDecklistCopiedState = () => {
  if (decklistCopyHandle) {
    clearTimeout(decklistCopyHandle);
    decklistCopyHandle = null;
  }
  decklistCopied.value = false;
};

const handleDecklistUpdate = (payload: DecklistPayload) => {
  decklistExport.value = payload;
};

const copyDecklistFromHeader = async () => {
  if (!decklistExport.value?.text) {
    return;
  }
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    console.warn("Clipboard API unavailable in this environment.");
    return;
  }
  try {
    clearDecklistCopiedState();
    decklistCopied.value = true;
    await navigator.clipboard.writeText(decklistExport.value.text);
    decklistCopyHandle = setTimeout(() => {
      decklistCopied.value = false;
      decklistCopyHandle = null;
    }, 1600);
  } catch (error) {
    handleError(error, {
      notify: true,
      fallbackMessage: "Unable to copy that decklist to your clipboard.",
      context: "Dashboard decklist copy",
    });
  }
};

const downloadDecklistFromHeader = () => {
  if (!decklistExport.value?.text) {
    return;
  }
  const filename = `commander-scout-${decklistExport.value.filterLabel
    .toLowerCase()
    .replace(/\s+/g, "-")}.txt`;
  downloadTextFile(decklistExport.value.text, filename);
};

onBeforeUnmount(() => {
  clearDecklistCopiedState();
});

watch(hasCsvData, (value) => {
  if (value) {
    onboardingDismissed.value = true;
  }
});

const dismissOnboarding = () => {
  onboardingDismissed.value = true;
};

const openUploadModalFromOnboarding = () => {
  onboardingDismissed.value = true;
  showUploadModal.value = true;
};
</script>
