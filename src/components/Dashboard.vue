<template>
  <section
    class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8"
  >
    <GlobalLoadingBanner />
    <Teleport to="body">
      <div
        v-if="showOnboarding"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
      >
        <Card
          padding="p-5 sm:p-8"
          background="bg-white dark:bg-slate-900"
          shadow="shadow-2xl shadow-slate-900/50 dark:shadow-black/60"
          class="w-full max-w-2xl space-y-5 text-center"
        >
          <p class="text-xs uppercase tracking-[0.4em] text-emerald-500/80">
            First-time setup
          </p>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
            Upload your collection or scout first
          </h2>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Bring in a CSV of your collection to highlight owned cards, or start searching commanders first and upload later.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/10 dark:border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-100"
              @click="openUploadModalFromOnboarding"
            >
              Upload a CSV
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
              @click="dismissOnboarding"
            >
              Start searching first
            </button>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            You can upload later using the Toolkit in the corner.
          </p>
        </Card>
      </div>
    </Teleport>
    <div v-if="!headerCollapsed" class="sticky top-4 z-40 mb-6">
      <Card
        as="header"
        padding="p-3 sm:p-4"
        rounded="rounded-3xl"
        border="border border-slate-200/70 dark:border-slate-700/70"
        background="bg-white/95 dark:bg-slate-900/85"
        shadow="shadow-lg shadow-slate-900/10 dark:shadow-black/40"
        class="backdrop-blur flex flex-col gap-3 text-xs"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 text-[0.7rem]"
        >
          <div class="flex flex-wrap items-baseline gap-2">
            <span
              class="uppercase tracking-[0.4em] text-emerald-500/80 dark:text-emerald-300/80"
            >
              Toolkit
            </span>
            <h1
              class="text-lg font-semibold normal-case tracking-tight text-slate-900 dark:text-white"
            >
              Commander Scout
            </h1>
            <span
              class="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400"
            >
              CSV • EDHREC • Scryfall
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-slate-500 shadow-sm transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              @click="collapseHeader"
            >
              <span class="text-xs" aria-hidden="true">✕</span>
              <span class="hidden sm:inline">Hide</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[0.7rem] font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
              :aria-pressed="theme === 'dark'"
              @click="toggleTheme"
            >
              <svg
                :viewBox="'0 0 24 24'"
                class="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="theme === 'dark' ? mdiSunCompass : mdiMoonWaningCrescent" />
              </svg>
              <span>{{ theme === "dark" ? "Light" : "Dark" }}</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/80 bg-emerald-50 px-3 py-1.5 text-[0.7rem] font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-500/10 dark:border-emerald-300/70 dark:bg-emerald-900/40 dark:text-emerald-200"
              @click="showUploadModal = true"
            >
              <svg
                :viewBox="'0 0 24 24'"
                class="h-4 w-4"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="mdiUploadOutline" />
              </svg>
              <span>Upload CSV</span>
            </button>
          </div>
        </div>
        <p class="text-[0.7rem] text-slate-600 dark:text-slate-300">
          Match your collection against live commander recommendations, then tag
          owned cards by uploading your CSV.
        </p>
        <div class="flex flex-wrap gap-2 text-[0.7rem] font-semibold">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === true
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-sm dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100'
                : 'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setOwnedFilter(true)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiCardsOutline" />
            </svg>
            <span>Owned</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === false
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-sm dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100'
                : 'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setOwnedFilter(false)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiBookmarkOffOutline" />
            </svg>
            <span>Unowned</span>
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === null
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-sm dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100'
                : 'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setOwnedFilter(null)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path :d="mdiCheckDecagram" />
            </svg>
            <span>Show All</span>
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold">
          <span class="text-slate-500 dark:text-slate-300">Export:</span>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
            :disabled="!decklistExport?.text"
            @click="copyDecklistFromHeader"
          >
            <svg
              :viewBox="'0 0 24 24'"
              class="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="mdiContentCopy" />
            </svg>
            <span>{{ decklistCopied ? "Copied!" : "Copy Decklist" }}</span>
          </button>
          <button
            type="button"
            class="rounded-full border border-emerald-400 bg-emerald-50 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
            :disabled="!decklistExport?.text"
            @click="downloadDecklistFromHeader"
          >
            <svg
              :viewBox="'0 0 24 24'"
              class="h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="mdiDownloadOutline" />
            </svg>
            <span>Download decklist.txt</span>
          </button>
        </div>
      </Card>
    </div>

    <button
      v-else
      type="button"
      class="sticky top-4 z-40 mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm shadow-slate-900/10 backdrop-blur transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
      @click="expandHeader"
    >
      <span aria-hidden="true">☰</span>
      <span>Show Toolkit</span>
    </button>

    <Teleport to="body">
      <div
        v-if="showUploadModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm text-center"
        role="dialog"
        aria-modal="true"
        @click.self="showUploadModal = false"
      >
        <div class="max-w-2xl w-full">
          <Card
            padding="p-4 sm:p-6"
            background="bg-white dark:bg-slate-900"
            shadow="shadow-2xl shadow-slate-900/40 dark:shadow-black/60"
            class="text-center"
          >
            <div class="flex flex-col items-center gap-3">
              <p class="text-xs uppercase tracking-[0.3em] text-emerald-500/80">
                Upload Collection
              </p>
              <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
                Import your CSV
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Drag and drop or browse files. We keep data in-memory only.
              </p>
            </div>
            <div class="mt-6 flex justify-center">
              <CSVUpload />
            </div>
            <div class="mt-6 flex justify-center">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
                @click="showUploadModal = false"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Teleport>

    <EdhrecReader @decklistUpdate="handleDecklistUpdate" />

    <SiteNotice />
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import {
  Card,
  EdhrecReader,
  CSVUpload,
  GlobalLoadingBanner,
  SiteNotice,
} from "../components";
import { useTheme } from "../composables/useTheme";
import { useOwnedFilter } from "../composables/useOwnedFilter";
import { downloadTextFile } from "../utils/downloadTextFile";
import { useCsvUpload } from "../composables/useCsvUpload";
import {
  mdiUploadOutline,
  mdiMoonWaningCrescent,
  mdiSunCompass,
  mdiContentCopy,
  mdiDownloadOutline,
  mdiCardsOutline,
  mdiCheckDecagram,
  mdiBookmarkOffOutline,
} from "@mdi/js";

type DecklistPayload = {
  text: string;
  filterLabel: string;
  sections: Array<{ id: string; label: string; text: string }>;
};

const { theme, toggleTheme } = useTheme();
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
    console.error("Unable to copy decklist:", error);
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
