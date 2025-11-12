<template>
  <section
    class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8"
  >
    <GlobalLoadingBanner />
    <div
      v-if="!headerCollapsed"
      class="sticky top-4 z-40 mb-6"
    >
      <Card
        as="header"
        padding="p-2 sm:p-3"
        rounded="rounded-2xl"
        border="border border-slate-200/70 dark:border-slate-700/70"
        background="bg-white/90 dark:bg-slate-900/85"
        shadow="shadow-lg shadow-slate-900/10 dark:shadow-black/40"
        class="backdrop-blur flex flex-col gap-2 text-xs"
      >
        <div
          class="flex flex-wrap items-center justify-between gap-2 text-[0.7rem]"
        >
          <div class="flex flex-wrap items-baseline gap-2">
            <span
              class="uppercase tracking-[0.3em] text-emerald-500/70 dark:text-emerald-300/70"
            >
              Toolkit
            </span>
            <h1
              class="text-base font-semibold normal-case tracking-tight text-slate-900 dark:text-white"
            >
              Commander Scout
            </h1>
            <span
              class="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
            >
              CSV • EDHREC • Scryfall
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-1 text-[0.65rem] font-semibold text-slate-500 transition hover:text-slate-700 dark:border-slate-700 dark:text-slate-300"
              @click="collapseHeader"
            >
              <span aria-hidden="true">✕</span>
              <span class="hidden sm:inline">Hide</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
              :aria-pressed="theme === 'dark'"
              @click="toggleTheme"
            >
              <span class="text-sm" aria-hidden="true">
                {{ theme === "dark" ? "☀️" : "🌙" }}
              </span>
              <span>{{ theme === "dark" ? "Light" : "Dark" }}</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/70 px-2.5 py-1 text-[0.7rem] font-semibold text-emerald-700 transition hover:bg-emerald-500/15 dark:border-emerald-300/60 dark:text-emerald-200"
              @click="showUploadModal = true"
            >
              <span aria-hidden="true">⬆️</span>
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
            class="rounded-full border px-3 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === true
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100'
                : 'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setOwnedFilter(true)"
          >
            Owned
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === false
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100'
                : 'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setOwnedFilter(false)"
          >
            Unowned
          </button>
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            :class="
              showOwned === null
                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-100'
                : 'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            @click="setOwnedFilter(null)"
          >
            Show All
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold">
          <span class="text-slate-500 dark:text-slate-300">Export:</span>
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50"
            :class="
              'border-slate-200 text-slate-600 hover:border-emerald-400 dark:border-slate-700 dark:text-slate-300'
            "
            :disabled="!decklistExport?.text"
            @click="copyDecklistFromHeader"
          >
            {{ decklistCopied ? "Copied!" : "Copy Decklist" }}
          </button>
          <button
            type="button"
            class="rounded-full border border-emerald-400 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-300 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
            :disabled="!decklistExport?.text"
            @click="downloadDecklistFromHeader"
          >
            Download decklist.txt
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="showUploadModal = false"
      >
        <div class="max-w-2xl w-full">
          <Card
            padding="p-4 sm:p-6"
            background="bg-white dark:bg-slate-900"
            shadow="shadow-2xl shadow-slate-900/40 dark:shadow-black/60"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-emerald-500/80">
                  Upload Collection
                </p>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
                  Import your CSV
                </h2>
                <p class="text-sm text-slate-600 dark:text-slate-300">
                  Drag and drop or browse files. We keep data in-memory only.
                </p>
              </div>
              <button
                type="button"
                class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500/70"
                @click="showUploadModal = false"
              >
                Close
              </button>
            </div>
            <div class="mt-4">
              <CSVUpload />
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
import { ref, onMounted, onBeforeUnmount } from "vue";
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

type DecklistPayload = {
  text: string;
  filterLabel: string;
  sections: Array<{ id: string; label: string; text: string }>;
};

const { theme, toggleTheme } = useTheme();
const { showOwned, setOwnedFilter } = useOwnedFilter();
const showUploadModal = ref(false);
const headerCollapsed = ref(false);
const decklistExport = ref<DecklistPayload | null>(null);
const decklistCopied = ref(false);
let decklistCopyHandle: ReturnType<typeof setTimeout> | null = null;

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
</script>
