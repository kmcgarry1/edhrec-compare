<template>
  <section class="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
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
      <header class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">
              Commander Scout
            </p>
            <h1 class="text-2xl font-semibold text-[color:var(--text)] sm:text-3xl">
              Deck Intelligence Dashboard
            </h1>
            <p class="text-sm text-[color:var(--muted)]">
              Search EDHREC, compare your collection, and export optimized decklists.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div
              class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2 py-1 text-[0.7rem] font-semibold text-[color:var(--muted)]"
              role="group"
              aria-label="Adjust layout density"
            >
              <span class="hidden sm:inline uppercase tracking-[0.24em]">Density</span>
              <button
                v-for="option in densityOptions"
                :key="option.value"
                type="button"
                class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                :class="
                  density === option.value
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                    : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                "
                :aria-pressed="density === option.value"
                @click="setDensity(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
              :aria-pressed="theme === 'dark'"
              @click="toggleTheme"
            >
              <span class="uppercase tracking-[0.2em] text-[0.62rem] text-[color:var(--muted)]">Theme</span>
              <span>{{ theme === "dark" ? "Dark" : "Light" }}</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              :aria-label="`${backgroundEnabled ? 'Hide' : 'Show'} background texture`"
              :aria-pressed="backgroundEnabled"
              @click="toggleBackground"
            >
              <span class="uppercase tracking-[0.2em] text-[0.62rem] text-[color:var(--muted)]">Backdrop</span>
              <span>{{ backgroundEnabled ? "On" : "Off" }}</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-4 py-2 text-[0.72rem] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent-strong)]"
              aria-label="Upload CSV collection file"
              @click="showUploadModal = true"
            >
              Upload CSV
            </button>
          </div>
        </div>
      </header>

      <CsvUploadModal :open="showUploadModal" @close="showUploadModal = false" />

      <main class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <EdhrecReader @decklistUpdate="handleDecklistUpdate" />
        <aside class="space-y-4">
          <Card
            padding="p-4 sm:p-5"
            class="space-y-4"
            :aria-busy="csvRows.length === 0 ? undefined : 'false'"
          >
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Inventory
              </p>
              <h2 class="text-lg font-semibold text-[color:var(--text)]">Collection</h2>
              <p class="text-sm text-[color:var(--muted)]">
                {{ inventorySummary }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)]"
              @click="showUploadModal = true"
            >
              {{ csvRows.length ? "Replace CSV" : "Upload CSV" }}
            </button>
            <div class="space-y-2">
              <p class="text-[0.7rem] uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Ownership filter
              </p>
              <div class="grid grid-cols-3 gap-2 text-[0.72rem] font-semibold">
                <button
                  v-for="option in filterOptions"
                  :key="option.label"
                  type="button"
                  class="rounded-xl border px-2 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                  :class="option.active ? activeFilterClass : inactiveFilterClass"
                  :aria-label="`Show ${option.label.toLowerCase()} cards`"
                  :aria-pressed="option.active"
                  @click="setOwnedFilter(option.value)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </Card>
          <Card padding="p-4 sm:p-5" class="space-y-3">
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Decklist
              </p>
              <h2 class="text-lg font-semibold text-[color:var(--text)]">Export</h2>
              <p class="text-sm text-[color:var(--muted)]">
                {{
                  decklistExport?.text
                    ? "Export the filtered decklist or copy it to a deck builder."
                    : "Select a commander to generate decklists."
                }}
              </p>
            </div>
            <DecklistExport
              :disabled="!decklistExport?.text"
              :copied="decklistCopied"
              @copy="copyDecklistFromHeader"
              @download="downloadDecklistFromHeader"
            />
          </Card>
          <SiteNotice />
        </aside>
      </main>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onBeforeUnmount, computed, watch, defineAsyncComponent } from "vue";
import {
  Card,
  EdhrecReader,
  GlobalLoadingBanner,
  SiteNotice,
} from "../components";
import { useTheme } from "../composables/useTheme";
import { useOwnedFilter } from "../composables/useOwnedFilter";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useBackgroundPreference } from "../composables/useBackgroundPreference";
import { useLayoutDensity } from "../composables/useLayoutDensity";

// Lazy load modal components (only needed when user interacts)
const OnboardingModal = defineAsyncComponent(() =>
  import("./OnboardingModal.vue")
);

const CsvUploadModal = defineAsyncComponent(() =>
  import("./CsvUploadModal.vue")
);
const DecklistExport = defineAsyncComponent(() =>
  import("./DecklistExport.vue")
);

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
const { density, setDensity, densityOptions } = useLayoutDensity();
const showUploadModal = ref(false);
const decklistExport = ref<DecklistPayload | null>(null);
const decklistCopied = ref(false);
let decklistCopyHandle: ReturnType<typeof setTimeout> | null = null;
const onboardingDismissed = ref(false);
const showOnboarding = computed(
  () => !onboardingDismissed.value && !hasCsvData.value
);

const inventorySummary = computed(() => {
  if (!csvRows.value.length) {
    return "No collection loaded yet.";
  }
  const count = csvRows.value.length;
  return `${count} card${count === 1 ? "" : "s"} loaded from CSV.`;
});

const activeFilterClass =
  "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]";
const inactiveFilterClass =
  "border-[color:var(--border)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--text)]";

const filterOptions = computed(() => [
  { label: "Owned", value: true, active: showOwned.value === true },
  { label: "Unowned", value: false, active: showOwned.value === false },
  { label: "All", value: null, active: showOwned.value === null },
]);

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
