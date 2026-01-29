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
      <header
        class="surface-sheen relative overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)] sm:p-7"
      >
        <div
          class="pointer-events-none absolute -top-24 right-6 h-48 w-48 rounded-full bg-[color:var(--accent-soft)] blur-3xl opacity-70"
          aria-hidden="true"
        ></div>
        <div
          class="pointer-events-none absolute -bottom-24 left-4 h-52 w-64 rounded-full bg-[color:var(--warn-soft)] blur-3xl opacity-60"
          aria-hidden="true"
        ></div>
        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="space-y-3">
            <p
              class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
            >
              Commander Scout
            </p>
            <h1 class="text-3xl font-semibold text-[color:var(--text)] sm:text-4xl">
              Compare EDHREC decklists to your collection
            </h1>
            <p class="max-w-2xl text-sm text-[color:var(--muted)] sm:text-base">
              Choose a commander, upload your collection CSV, and export an owned or
              unowned list in minutes.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105"
              @click="jumpToTab('search')"
            >
              Start with a commander
            </button>
            <RouterLink
              to="/top-commanders"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Top commanders
            </RouterLink>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              @click="jumpToTab('collection')"
            >
              Jump to collection
            </button>
          </div>
        </div>
      </header>

      <CsvUploadModal :open="showUploadModal" @close="showUploadModal = false" />

      <main
        id="main-content"
        ref="mainContentRef"
        class="mt-8 space-y-6"
      >
        <div class="sticky top-4 z-40 isolate">
          <Card
            padding="p-4"
            rounded="rounded-3xl"
            border="border border-[color:var(--border)]"
            background="bg-[color:var(--surface-strong)]"
            shadow="shadow-[var(--shadow)]"
            class="backdrop-blur-sm"
          >
            <div class="grid gap-3 lg:grid-cols-[1fr,auto] lg:items-center">
              <div class="flex flex-wrap items-center gap-3">
                <div class="space-y-1">
                  <p
                    class="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
                  >
                    Next step
                  </p>
                  <p class="text-sm font-semibold text-[color:var(--text)]">
                    {{ nextStepLabel }}
                  </p>
                </div>
                <button
                  v-if="nextStepActionLabel"
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105"
                  @click="handleNextStepAction"
                >
                  {{ nextStepActionLabel }}
                </button>
              </div>
              <div class="flex flex-wrap items-center justify-end gap-3">
                <div class="flex items-center gap-2">
                  <span
                    class="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]"
                  >
                    Filter
                  </span>
                  <div
                    class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
                    role="group"
                    aria-label="Filter decklists by ownership"
                  >
                    <button
                      v-for="option in filterOptions"
                      :key="`sticky-filter-${option.label}`"
                      type="button"
                      class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                      :class="
                        option.active
                          ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                          : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                      "
                      :aria-pressed="option.active"
                      @click="setOwnedFilter(option.value)"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </div>
                <div
                  class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
                  role="tablist"
                  aria-label="Dashboard tabs"
                >
                  <button
                    v-for="tab in tabOptions"
                    :key="tab.id"
                    :id="`tab-${tab.id}`"
                    type="button"
                    role="tab"
                    class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                    :class="
                      activeTab === tab.id
                        ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                        : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                    "
                    :aria-selected="activeTab === tab.id"
                    :aria-controls="`panel-${tab.id}`"
                    @click="setActiveTab(tab.id)"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div class="grid gap-6 lg:grid-cols-[18rem,1fr]">
          <aside class="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <Card padding="p-4" class="space-y-4">
              <div class="space-y-1">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
                >
                  Quick actions
                </p>
                <p class="text-sm text-[color:var(--muted)]">
                  Jump to the most common tasks.
                </p>
              </div>
              <div class="grid gap-2">
                <button
                  type="button"
                  class="w-full rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  @click="jumpToTab('search')"
                >
                  Search commanders
                </button>
                <RouterLink
                  to="/top-commanders"
                  class="w-full rounded-full border border-[color:var(--border)] px-3 py-1.5 text-center text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  Top 50 scan
                </RouterLink>
                <button
                  type="button"
                  class="w-full rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                  @click="openUploadModalFromRail"
                >
                  Upload CSV
                </button>
                <button
                  type="button"
                  class="w-full rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="!exportReady"
                  @click="jumpToTab('export')"
                >
                  Export decklist
                </button>
              </div>
              <div class="space-y-1 text-xs text-[color:var(--muted)]">
                <p>{{ commanderChecklist }}</p>
                <p>{{ collectionChecklist }}</p>
                <p>{{ exportChecklist }}</p>
                <p v-if="commanderSummary" class="truncate">
                  Commander: {{ commanderSummary }}
                </p>
              </div>
            </Card>
          </aside>

          <section class="space-y-4">
            <section
              id="panel-search"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-search'"
              v-show="activeTab === 'search'"
              class="space-y-4"
            >
              <div class="space-y-1">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
                >
                  Search
                </p>
                <h2 class="text-lg font-semibold text-[color:var(--text)]">
                  Search commanders and browse cardlists
                </h2>
                <p class="text-sm text-[color:var(--muted)]">
                  Use EDHREC filters to load cardlists and card previews.
                </p>
              </div>
              <EdhrecReader
                @decklistUpdate="handleDecklistUpdate"
                @selection-change="handleSelectionChange"
              />
            </section>

            <section
              id="panel-collection"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-collection'"
              v-show="activeTab === 'collection'"
              class="space-y-4"
            >
              <CommanderDataPanel
                :primary-commander="commanderSelection.primary"
                :partner-commander="
                  commanderSelection.hasPartner ? commanderSelection.partner : undefined
                "
              />
              <Card
                id="collection-step"
                padding="p-4 sm:p-5"
                class="space-y-4"
                :aria-busy="csvRows.length === 0 ? undefined : 'false'"
              >
                <div class="space-y-1">
                  <p
                    class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
                  >
                    Collection
                  </p>
                  <h2 class="text-lg font-semibold text-[color:var(--text)]">
                    Upload your collection
                  </h2>
                  <p class="text-sm text-[color:var(--muted)]">
                    {{ inventorySummary }}
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)]"
                  @click="showUploadModal = true"
                >
                  {{ csvRows.length ? "Replace CSV" : "Upload CSV" }}
                </button>
                <div class="space-y-2">
                  <p
                    class="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
                  >
                    Filter decklists
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
              <TopCommanderScanPanel />
              <Card padding="p-0" class="overflow-hidden">
                <details class="group">
                  <summary
                    class="cursor-pointer px-4 py-3 text-sm font-semibold text-[color:var(--text)]"
                  >
                    Display settings
                  </summary>
                  <div class="space-y-4 px-4 pb-4">
                    <p class="text-sm text-[color:var(--muted)]">
                      Adjust density, theme, and accessibility preferences.
                    </p>
                    <div class="grid gap-3">
                      <div class="flex flex-wrap items-center gap-2">
                        <span
                          class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]"
                        >
                          Density
                        </span>
                        <div
                          class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
                          role="group"
                          aria-label="Adjust layout density"
                        >
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
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                          :aria-label="`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`"
                          :aria-pressed="theme === 'dark'"
                          @click="toggleTheme"
                        >
                          <span
                            class="uppercase tracking-[0.2em] text-[0.62rem] text-[color:var(--muted)]"
                          >
                            Theme
                          </span>
                          <span>{{ theme === "dark" ? "Dark" : "Light" }}</span>
                        </button>
                        <button
                          type="button"
                          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[0.72rem] font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                          :aria-label="`${backgroundEnabled ? 'Hide' : 'Show'} background texture`"
                          :aria-pressed="backgroundEnabled"
                          @click="toggleBackground"
                        >
                          <span
                            class="uppercase tracking-[0.2em] text-[0.62rem] text-[color:var(--muted)]"
                          >
                            Backdrop
                          </span>
                          <span>{{ backgroundEnabled ? "On" : "Off" }}</span>
                        </button>
                        <AccessibilityControls />
                      </div>
                    </div>
                  </div>
                </details>
              </Card>
              <SiteNotice />
            </section>

            <section
              id="panel-export"
              role="tabpanel"
              tabindex="0"
              :aria-labelledby="'tab-export'"
              v-show="activeTab === 'export'"
              class="space-y-4"
            >
              <div class="space-y-1">
                <p
                  class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
                >
                  Export
                </p>
                <h2 class="text-lg font-semibold text-[color:var(--text)]">
                  Export your decklist
                </h2>
                <p class="text-sm text-[color:var(--muted)]">
                  {{ exportHelperText }}
                </p>
              </div>
              <Card id="export-step" padding="p-4 sm:p-5" class="space-y-3">
                <DecklistExport
                  :disabled="!decklistExport?.text"
                  :copied="decklistCopied"
                  @copy="copyDecklistFromHeader"
                  @download="downloadDecklistFromHeader"
                />
              </Card>
            </section>
            </section>
        </div>
      </main>
    </div>
  </section>
</template>
<script setup lang="ts">
import { ref, onBeforeUnmount, computed, watch, defineAsyncComponent, nextTick } from "vue";
import {
  AccessibilityControls,
  Card,
  CommanderDataPanel,
  EdhrecReader,
  GlobalLoadingBanner,
  SiteNotice,
  TopCommanderScanPanel,
} from "../components";
import { useTheme } from "../composables/useTheme";
import { useOwnedFilter } from "../composables/useOwnedFilter";
import { downloadTextFile } from "../utils/downloadTextFile";
import { handleError } from "../utils/errorHandler";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useBackgroundPreference } from "../composables/useBackgroundPreference";
import { useLayoutDensity } from "../composables/useLayoutDensity";
import { useCsvUploadMode } from "../composables/useCsvUploadMode";

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

type SelectionState = {
  primary: string;
  partner: string;
  hasPartner: boolean;
};

type DashboardTab = "search" | "collection" | "export";

const { theme, toggleTheme } = useTheme();
const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
const { rows: csvRows } = useCsvUpload();
const { mode: csvUploadMode } = useCsvUploadMode();
const hasCsvData = computed(() => csvRows.value.length > 0);
const { showOwned, setOwnedFilter } = useOwnedFilter();
const { density, setDensity, densityOptions } = useLayoutDensity();
const showUploadModal = ref(false);
const decklistExport = ref<DecklistPayload | null>(null);
const decklistCopied = ref(false);
const mainContentRef = ref<HTMLElement | null>(null);
const activeTab = ref<DashboardTab>("search");
const tabOptions = [
  { id: "search", label: "Search" },
  { id: "collection", label: "Collection" },
  { id: "export", label: "Export" },
] as const;
const commanderSelection = ref<SelectionState>({
  primary: "",
  partner: "",
  hasPartner: false,
});
let decklistCopyHandle: ReturnType<typeof setTimeout> | null = null;
const onboardingDismissed = ref(false);
const showOnboarding = computed(
  () => !onboardingDismissed.value && !hasCsvData.value
);

const setActiveTab = (tab: DashboardTab) => {
  activeTab.value = tab;
};

const jumpToTab = (tab: DashboardTab) => {
  activeTab.value = tab;
  nextTick(() => {
    mainContentRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const openUploadModalFromRail = () => {
  jumpToTab("collection");
  showUploadModal.value = true;
};

const inventorySummary = computed(() => {
  if (!csvRows.value.length) {
    return "Upload a CSV to enable owned/unowned filters and collection matching.";
  }
  const count = csvRows.value.length;
  if (csvUploadMode.value === "top-50") {
    return `${count} card${count === 1 ? "" : "s"} loaded. Top commander scan ready.`;
  }
  return `${count} card${count === 1 ? "" : "s"} loaded. Filters now match your collection.`;
});

const hasCommander = computed(() => Boolean(commanderSelection.value.primary));
const exportReady = computed(() => Boolean(decklistExport.value?.text));

const commanderSummary = computed(() => {
  const primary = commanderSelection.value.primary;
  const partner = commanderSelection.value.partner;
  if (!primary) {
    return "";
  }
  if (commanderSelection.value.hasPartner && partner) {
    return `${primary} + ${partner}`;
  }
  return primary;
});

const nextStepAction = computed<
  "search" | "collection" | "upload" | "export" | null
>(() => {
  if (!hasCommander.value) {
    return "search";
  }
  if (!hasCsvData.value) {
    return "upload";
  }
  if (!decklistExport.value) {
    return null;
  }
  if (!decklistExport.value.text) {
    return "collection";
  }
  return "export";
});

const nextStepLabel = computed(() => {
  if (!hasCommander.value) {
    return "Select a commander to load cardlists.";
  }
  if (!hasCsvData.value) {
    return "Upload your collection to enable owned/unowned filters.";
  }
  if (!decklistExport.value) {
    return "Fetching decklists from EDHREC.";
  }
  if (!decklistExport.value.text) {
    return "No cards match this filter.";
  }
  return "Decklist ready to export.";
});

const nextStepActionLabel = computed(() => {
  switch (nextStepAction.value) {
    case "search":
      return "Search commanders";
    case "upload":
      return "Upload CSV";
    case "collection":
      return "Adjust filter";
    case "export":
      return "Go to export";
    default:
      return null;
  }
});

const handleNextStepAction = () => {
  switch (nextStepAction.value) {
    case "search":
      jumpToTab("search");
      break;
    case "collection":
      jumpToTab("collection");
      break;
    case "upload":
      jumpToTab("collection");
      showUploadModal.value = true;
      break;
    case "export":
      jumpToTab("export");
      break;
    default:
      break;
  }
};

const exportHelperText = computed(() => {
  if (!hasCommander.value) {
    return "Select a commander in Search to generate decklists.";
  }
  if (!decklistExport.value) {
    return "Fetching decklists from EDHREC.";
  }
  if (!decklistExport.value.text) {
    return "No cards match the current filter. Try another filter.";
  }
  return "Copy or download the filtered decklist for your deck builder.";
});

const commanderChecklist = computed(() =>
  hasCommander.value ? "[x] Commander selected" : "[ ] Choose a commander"
);

const collectionChecklist = computed(() =>
  hasCsvData.value ? "[x] Collection uploaded" : "[ ] Upload collection"
);

const exportChecklist = computed(() =>
  exportReady.value ? "[x] Decklist ready" : "[ ] Export after decklists load"
);

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

const handleSelectionChange = (payload: SelectionState) => {
  commanderSelection.value = payload;
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
