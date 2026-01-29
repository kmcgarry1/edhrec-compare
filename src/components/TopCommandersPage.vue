<template>
  <section
    class="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10"
  >
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <GlobalLoadingBanner />
    <CsvUploadModal :open="showUploadModal" @close="showUploadModal = false" />

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
            Collection Insights
          </p>
          <h1 class="text-3xl font-semibold text-[color:var(--text)] sm:text-4xl">
            Top commanders scan
          </h1>
          <p class="max-w-2xl text-sm text-[color:var(--muted)] sm:text-base">
            Browse EDHREC's top commanders and see what percentage of each average deck
            you already own.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            Back to dashboard
          </RouterLink>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105"
            @click="showUploadModal = true"
          >
            Upload CSV
          </button>
        </div>
      </div>
    </header>

    <main id="main-content" class="mt-8 space-y-6">
      <Card padding="p-4 sm:p-5" class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <p
              class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
            >
              CSV Status
            </p>
            <p class="text-sm text-[color:var(--muted)]">
              {{
                hasCsvData
                  ? `${csvCount} card${csvCount === 1 ? "" : "s"} loaded.`
                  : "Upload a CSV to calculate owned percentages."
              }}
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
            <span v-if="lastUpdated">
              Last updated {{ formattedLastUpdated }}
            </span>
            <span v-if="failedCount" class="text-[color:var(--warn)]">
              {{ failedCount }} commanders failed to load.
            </span>
          </div>
        </div>
        <GlobalLoadingBanner
          :scope="scanScope"
          inline
          placement-class="w-full"
        >
          Scanning commander averages...
        </GlobalLoadingBanner>
        <div
          v-if="scanError"
          class="rounded-2xl border border-[color:var(--danger)] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]"
          role="status"
        >
          {{ scanError }}
        </div>
      </Card>

      <Card padding="p-4 sm:p-5" class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1">
            <p
              class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
            >
              {{ topHeader }}
            </p>
            <h2 class="text-lg font-semibold text-[color:var(--text)]">
              Top {{ topLimit }} commanders
            </h2>
            <p class="text-sm text-[color:var(--muted)]">
              Percentages use EDHREC average decks without extra filters.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div
              class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
              role="group"
              aria-label="Choose top commanders range"
            >
              <button
                v-for="option in limitOptions"
                :key="option"
                type="button"
                class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                :class="
                  topLimit === option
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                    : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                "
                :aria-pressed="topLimit === option"
                @click="setTopLimit(option)"
              >
                Top {{ option }}
              </button>
            </div>
            <div
              class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-1 text-[0.7rem] font-semibold text-[color:var(--muted)] shadow-[var(--shadow-soft)]"
              role="group"
              aria-label="Sort commanders"
            >
              <button
                v-for="option in sortOptions"
                :key="option.value"
                type="button"
                class="rounded-full px-2.5 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                :class="
                  sortMode === option.value
                    ? 'bg-[color:var(--accent-soft)] text-[color:var(--text)]'
                    : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
                "
                :aria-pressed="sortMode === option.value"
                @click="setSortMode(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <button
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="topLoading"
              @click="refreshTopCommanders"
            >
              Refresh list
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
          <span class="font-semibold uppercase tracking-[0.24em]">Color filter</span>
          <div
            class="inline-flex flex-wrap items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 shadow-[var(--shadow-soft)]"
            role="group"
            aria-label="Filter by color identity"
          >
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              :class="selectedColors.includes(color) ? colorPillClass(color) : 'border-[color:var(--border)] text-[color:var(--muted)] hover:text-[color:var(--text)]'"
              :aria-pressed="selectedColors.includes(color)"
              @click="toggleColor(color)"
            >
              <img
                v-if="manaSymbol(color)"
                :src="manaSymbol(color)"
                :alt="colorLabel(color)"
                class="h-4 w-4"
              />
              <span
                v-else
                class="h-2.5 w-2.5 rounded-full"
                :class="colorDotClass(color)"
                aria-hidden="true"
              ></span>
              <span class="sr-only">{{ colorLabel(color) }}</span>
            </button>
            <button
              v-if="selectedColors.length"
              type="button"
              class="rounded-full border border-[color:var(--border)] px-3 py-1 text-[0.7rem] font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--text)]"
              @click="clearColors"
            >
              Clear
            </button>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
          <span class="font-semibold uppercase tracking-[0.24em]">Owned range</span>
          <div class="flex items-center gap-2">
            <div
              class="h-2 w-40 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 shadow-[var(--shadow-soft)]"
              aria-hidden="true"
            ></div>
            <div class="flex items-center gap-2 text-[0.7rem]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div
          v-if="topLoading"
          class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--muted)]"
        >
          Loading top commanders...
        </div>
        <div
          v-else-if="topError"
          class="rounded-2xl border border-[color:var(--danger)] bg-[color:var(--danger-soft)] px-4 py-3 text-sm text-[color:var(--danger)]"
          role="status"
        >
          {{ topError }}
        </div>

        <div
          v-else
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <RouterLink
            v-for="commander in sortedCommanders"
            :key="commander.slug"
            :to="commanderLink(commander)"
            class="group block h-full"
          >
            <Card
              padding="p-4"
              :background="highOwnedBackground(commander)"
              :border="highOwnedBorder(commander)"
              class="flex h-full flex-col items-center gap-3 text-center transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
              :class="highOwnedHighlightClass(commander)"
            >
            <div class="space-y-1">
              <p class="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                Rank #{{ commander.rank }}
              </p>
              <p class="text-sm font-semibold text-[color:var(--text)]">
                {{ commander.name }}
              </p>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div
                class="flex h-52 w-36 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] shadow-[var(--shadow-soft)]"
              >
                <div
                  v-if="getImageStack(commander.name).length"
                  class="relative h-full w-full"
                >
                  <img
                    :src="getImageStack(commander.name)[0]"
                    :alt="commander.name"
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                  <img
                    v-if="getImageStack(commander.name).length > 1"
                    :src="getImageStack(commander.name)[1]"
                    :alt="commander.name"
                    class="absolute left-5 top-5 h-[85%] w-[85%] rounded-xl object-cover shadow-[var(--shadow)]"
                  />
                </div>
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-xs text-[color:var(--muted)]"
                >
                  {{ imageLoading ? "Loading..." : "No image" }}
                </div>
              </div>
              <div class="w-full space-y-2">
                <p
                  class="text-sm font-semibold"
                  :class="percentToneClass(commander)"
                >
                  {{ percentLabel(commander) }}
                </p>
                <div class="relative h-2 w-full rounded-full bg-[color:var(--surface-muted)]">
                  <div
                    class="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-80"
                    aria-hidden="true"
                  ></div>
                  <span
                    v-if="percentValue(commander) !== null"
                    class="absolute -top-1.5 h-5 w-1.5 rounded-full bg-[color:var(--surface)] shadow-[var(--shadow-soft)] ring-1 ring-[color:var(--border)]"
                    :style="{ left: `${percentValue(commander)}%` }"
                    aria-hidden="true"
                  ></span>
                </div>
              </div>
            </div>
            <p class="text-xs text-[color:var(--muted)]">
              {{ detailLabel(commander) }}
            </p>
          </Card>
          </RouterLink>
        </div>
      </Card>

      <SiteNotice />
    </main>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import { getTopCommanders, type TopCommander } from "../api/edhrecApi";
import { getCardsByNames, type ScryfallCard } from "../api/scryfallApi";
import { handleError } from "../utils/errorHandler";
import { normalizeCardName } from "../utils/cardName";
import { COLOR_IDENTITY_META, COLOR_IDENTITY_ORDER, type CommanderColor } from "../utils/colorIdentity";
import { Card, GlobalLoadingBanner, SiteNotice } from ".";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useTopCommanderScan } from "../composables/useTopCommanderScan";
import { useScryfallSymbols } from "../composables/useScryfallSymbols";

const CsvUploadModal = defineAsyncComponent(() => import("./CsvUploadModal.vue"));

const showUploadModal = ref(false);

const topCommanders = ref<TopCommander[]>([]);
const topHeader = ref("Top Commanders");
const topLoading = ref(false);
const topError = ref<string | null>(null);
const topLimit = ref(50);
const sortMode = ref("rank");
const sortOptions = [
  { value: "rank", label: "Ranked" },
  { value: "owned", label: "Highest owned" },
] as const;

const limitOptions = [50, 100, 250, 500] as const;
const selectedColors = ref<CommanderColor[]>([]);
const colorOptions = COLOR_IDENTITY_ORDER;

const imageLoading = ref(false);
const imageLookup = ref<Record<string, string>>({});
const colorIdentityLookup = ref<Record<string, CommanderColor[]>>({});
const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();

const { rows, headers } = useCsvUpload();
const {
  results,
  lastUpdated,
  error: scanError,
  failedCount,
  scope: scanScope,
  runScan,
  clearResults,
} = useTopCommanderScan();

const hasCsvData = computed(() => rows.value.length > 0);
const csvCount = computed(() => rows.value.length);

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) {
    return "";
  }
  return lastUpdated.value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const scanLookup = computed(() => {
  const map = new Map<string, (typeof results.value)[number]>();
  results.value.forEach((entry) => map.set(entry.slug, entry));
  return map;
});

const filteredCommanders = computed(() =>
  topCommanders.value.filter((commander) => matchesColorFilter(commander))
);

const sortedCommanders = computed(() => {
  const base = filteredCommanders.value;
  if (sortMode.value != "owned") {
    return base;
  }
  const entries = [...base];
  entries.sort((a, b) => {
    const aResult = scanLookup.value.get(a.slug);
    const bResult = scanLookup.value.get(b.slug);
    const aPercent = aResult?.ownedPercent ?? -1;
    const bPercent = bResult?.ownedPercent ?? -1;
    if (bPercent != aPercent) {
      return bPercent - aPercent;
    }
    return (a.rank ?? 0) - (b.rank ?? 0);
  });
  return entries;
});

const setSortMode = (value: typeof sortOptions[number]["value"]) => {
  sortMode.value = value;
};

const toggleColor = (color: CommanderColor) => {
  if (color === "C") {
    if (selectedColors.value.length === 1 && selectedColors.value[0] === "C") {
      selectedColors.value = [];
      return;
    }
    selectedColors.value = ["C"];
    return;
  }
  if (selectedColors.value.includes("C")) {
    selectedColors.value = selectedColors.value.filter((c) => c !== "C");
  }
  if (selectedColors.value.includes(color)) {
    selectedColors.value = selectedColors.value.filter((c) => c !== color);
  } else {
    selectedColors.value = [...selectedColors.value, color];
  }
};

const clearColors = () => {
  selectedColors.value = [];
};

const COLOR_ORDER: CommanderColor[] = ["W", "U", "B", "R", "G"];
const COLOR_COMBO_SLUGS: Record<string, string> = {
  W: "mono-white",
  U: "mono-blue",
  B: "mono-black",
  R: "mono-red",
  G: "mono-green",
  C: "colorless",
  WU: "azorius",
  UB: "dimir",
  BR: "rakdos",
  RG: "gruul",
  WG: "selesnya",
  WB: "orzhov",
  UR: "izzet",
  BG: "golgari",
  WR: "boros",
  UG: "simic",
  WUB: "esper",
  WUR: "jeskai",
  WUG: "bant",
  WBR: "mardu",
  WBG: "abzan",
  WRG: "naya",
  UBR: "grixis",
  UBG: "sultai",
  URG: "temur",
  BRG: "jund",
  WUBR: "yore-tiller",
  UBRG: "glint-eye",
  WBRG: "dune-brood",
  WURG: "ink-treader",
  WUBG: "witch-maw",
  WUBRG: "five-color",
};

const manaTokenMap: Record<CommanderColor, string> = {
  W: "{W}",
  U: "{U}",
  B: "{B}",
  R: "{R}",
  G: "{G}",
  C: "{C}",
};

const manaSymbol = (color: CommanderColor) =>
  getSvgForSymbol(manaTokenMap[color]) ?? undefined;

const colorDotClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.dot ?? "";
const colorPillClass = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.pill ?? "";
const colorLabel = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.label ?? color;

const formatPercent = (value: number) => {
  const fixed = value.toFixed(1);
  const trimmed = fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
  return `${trimmed}%`;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const percentLabel = (commander: TopCommander) => {
  if (!hasCsvData.value) {
    return "Upload CSV";
  }
  const result = scanLookup.value.get(commander.slug);
  if (!result) {
    return "--";
  }
  return `${formatPercent(result.ownedPercent)} owned`;
};

const percentValue = (commander: TopCommander) => {
  const result = scanLookup.value.get(commander.slug);
  if (!result || !hasCsvData.value) {
    return null;
  }
  return Math.min(Math.max(result.ownedPercent, 0), 100);
};

const percentToneClass = (commander: TopCommander) => {
  const value = percentValue(commander);
  if (value === null) {
    return "text-[color:var(--muted)]";
  }
  if (value < 34) {
    return "text-rose-500";
  }
  if (value < 67) {
    return "text-amber-500";
  }
  return "text-emerald-500";
};

const detailLabel = (commander: TopCommander) => {
  const result = scanLookup.value.get(commander.slug);
  if (result) {
    return `${result.ownedCards} / ${result.totalCards} cards | ${numberFormatter.format(
      commander.deckCount
    )} decks`;
  }
  return `${numberFormatter.format(commander.deckCount)} decks`;
};

const splitPartnerNames = (name: string) => {
  if (!name) {
    return [] as string[];
  }
  if (name.includes("//")) {
    return name
      .split(/\s*\/\/\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  const separators = [" & ", " + ", " / "];
  for (const sep of separators) {
    if (name.includes(sep)) {
      return name.split(sep).map((part) => part.trim()).filter(Boolean);
    }
  }
  return [name];
};

const getImageStack = (name: string) => {
  const parts = splitPartnerNames(name);
  const images = parts
    .map((part) => resolveImage(part))
    .filter((url) => url && url.length > 0);
  if (images.length >= 2) {
    return images.slice(0, 2);
  }
  const fullImage = resolveImage(name);
  if (fullImage && images.length === 0) {
    return [fullImage];
  }
  return images;
};

const highOwnedBackground = (commander: TopCommander) => {
  const value = percentValue(commander);
  if (value === null) {
    return "bg-[color:var(--surface)]";
  }
  if (value >= 90) {
    return "bg-[color:var(--accent)]";
  }
  if (value >= 70) {
    return "bg-[color:var(--accent-soft)]";
  }
  if (value >= 50) {
    return "bg-[color:var(--warn-soft)]";
  }
  if (value >= 30) {
    return "bg-[color:var(--surface-muted)]";
  }
  if (value >= 10) {
    return "bg-[color:var(--danger-soft)]";
  }
  return "bg-[color:var(--surface-muted)]";
};

const highOwnedBorder = (commander: TopCommander) => {
  const value = percentValue(commander);
  if (value === null) {
    return "border border-[color:var(--border)]";
  }
  if (value >= 90) {
    return "border border-[color:var(--accent-strong)]";
  }
  if (value >= 70) {
    return "border border-[color:var(--accent)]";
  }
  if (value >= 50) {
    return "border border-[color:var(--warn)]";
  }
  if (value >= 30) {
    return "border border-[color:var(--border-strong)]";
  }
  if (value >= 10) {
    return "border border-[color:var(--danger)]";
  }
  return "border border-[color:var(--border)]";
};

const highOwnedHighlightClass = (commander: TopCommander) => {
  const value = percentValue(commander);
  if (value !== null && value >= 70) {
    return "shadow-[0_0_0_1px_var(--accent),0_10px_25px_rgba(0,0,0,0.18)]";
  }
  return "";
};

const commanderLink = (commander: TopCommander) => ({
  name: "commander",
  params: { slug: commander.slug },
  query: { pageType: "average-decks" },
});

const commanderColorIdentity = (name: string) =>
  colorIdentityLookup.value[normalizeCardName(name)] ?? [];

const combinedColorIdentity = (name: string) => {
  const parts = splitPartnerNames(name);
  const combined = new Set<CommanderColor>();
  parts.forEach((part) => {
    commanderColorIdentity(part).forEach((color) => combined.add(color));
  });
  if (parts.length === 1) {
    commanderColorIdentity(name).forEach((color) => combined.add(color));
  }
  return Array.from(combined);
};

const matchesColorFilter = (commander: TopCommander) => {
  if (!selectedColors.value.length) {
    return true;
  }
  const colors = combinedColorIdentity(commander.name);
  if (!colors.length) {
    return true;
  }
  return selectedColors.value.every((color) => colors.includes(color));
};

const colorKeyFromSelection = (colors: CommanderColor[]) => {
  if (!colors.length) {
    return "";
  }
  const withoutColorless = colors.filter((color) => color !== "C");
  const base = withoutColorless.length ? withoutColorless : colors;
  if (base.length === 1 && base[0] === "C") {
    return "C";
  }
  return COLOR_ORDER.filter((color) => base.includes(color)).join("");
};

const selectedColorPath = computed(() => {
  const key = colorKeyFromSelection(selectedColors.value);
  if (!key) {
    return "commanders/year";
  }
  const slug = COLOR_COMBO_SLUGS[key];
  if (!slug) {
    return "commanders/year";
  }
  return `commanders/${slug}`;
});

const resolveImage = (name: string) =>
  imageLookup.value[normalizeCardName(name)] ?? "";

const resolveCardImage = (card: ScryfallCard) => {
  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }
  const faceWithImage = card.card_faces?.find((face) => face.image_uris?.normal);
  return faceWithImage?.image_uris?.normal ?? "";
};

const loadCommanderImages = async (names: string[]) => {
  if (!names.length) {
    imageLookup.value = {};
    colorIdentityLookup.value = {};
    return;
  }
  imageLoading.value = true;
  try {
    const commanderNames = names
      .flatMap((name) => [name, ...splitPartnerNames(name)])
      .filter((value, index, arr) => arr.indexOf(value) === index);
    const cards = await getCardsByNames(commanderNames.map((name) => ({ name })));
    const nextLookup: Record<string, string> = {};
    const nextColors: Record<string, CommanderColor[]> = {};
    cards.forEach((card) => {
      const image = resolveCardImage(card);
      if (image) {
        nextLookup[normalizeCardName(card.name)] = image;
      }
      const rawIdentity = (card.color_identity ?? card.colors ?? []) as CommanderColor[];
      const identity = rawIdentity.length ? rawIdentity : (["C"] as CommanderColor[]);
      nextColors[normalizeCardName(card.name)] = identity;
      card.card_faces?.forEach((face) => {
        const faceImage = face.image_uris?.normal;
        if (faceImage) {
          nextLookup[normalizeCardName(face.name)] = faceImage;
        }
        const faceIdentity = (face.color_identity ?? face.colors ?? []) as CommanderColor[];
        if (faceIdentity.length) {
          nextColors[normalizeCardName(face.name)] = faceIdentity;
        }
      });
    });
    imageLookup.value = nextLookup;
    colorIdentityLookup.value = nextColors;
  } catch (error) {
    handleError(error, {
      notify: true,
      fallbackMessage: "Unable to load commander images.",
      context: "TopCommandersImages",
    });
  } finally {
    imageLoading.value = false;
  }
};

const loadTopCommanders = async () => {
  topLoading.value = true;
  topError.value = null;
  try {
    const { header, commanders } = await getTopCommanders(topLimit.value, {
      path: selectedColorPath.value,
    });
    topHeader.value = header || topHeader.value;
    topCommanders.value = commanders;
    await loadCommanderImages(commanders.map((entry) => entry.name));
  } catch (error) {
    const handled = handleError(error, {
      notify: true,
      fallbackMessage: "Unable to load top commanders.",
      context: "TopCommandersPage",
    });
    topError.value = handled.userMessage;
  } finally {
    topLoading.value = false;
  }
};

const refreshTopCommanders = () => {
  void loadTopCommanders();
};

const setTopLimit = (value: typeof limitOptions[number]) => {
  if (topLimit.value === value) {
    return;
  }
  topLimit.value = value;
  void loadTopCommanders();
  if (hasCsvData.value) {
    void runScan(rows.value, headers.value, {
      limit: topLimit.value,
      force: true,
      path: selectedColorPath.value,
    });
  }
};

watch(
  [rows, headers],
  ([nextRows, nextHeaders]) => {
    if (!nextRows.length) {
      clearResults();
      return;
    }
    if (!nextHeaders.length) {
      return;
    }
    void runScan(nextRows, nextHeaders, {
      limit: topLimit.value,
      path: selectedColorPath.value,
    });
  },
  { immediate: true }
);

watch(
  selectedColorPath,
  () => {
    void loadTopCommanders();
    if (hasCsvData.value) {
      void runScan(rows.value, headers.value, {
        limit: topLimit.value,
        force: true,
        path: selectedColorPath.value,
      });
    }
  }
);

onMounted(() => {
  void ensureSymbolsLoaded();
  void loadTopCommanders();
});
</script>
