<template>
  <section class="mx-auto w-full max-w-5xl">
    <CSurface
      as="article"
      variant="content"
      tone="default"
      size="none"
      radius="xl"
      shadow="none"
      class="selection-stage-shell border p-4 sm:p-6 lg:p-7"
      :class="{ 'selection-stage-shell-intro': playIntro }"
    >
      <div class="selection-stage-copy flex flex-col gap-5">
        <div class="space-y-2">
          <CText tag="h1" variant="display" class="selection-stage-title text-balance">
            Find cards for your commander
          </CText>
          <CText tag="p" variant="body" tone="muted" class="selection-stage-description">
            Search a commander, compare recommendations with your collection, then export the cards
            you need.
          </CText>
        </div>

        <CSurface
          variant="command"
          size="none"
          radius="lg"
          class="selection-stage-search-shell w-full"
        >
          <CommanderSearch
            ref="commanderSearchRef"
            mode="minimal"
            class="selection-stage-search w-full"
            :selected-slug="currentCommanderSlug"
            @commander-selected="handleCommanderSelection"
            @selection-change="emit('selection-change', $event)"
          />
        </CSurface>

        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
          <p class="text-sm text-[color:var(--muted)]">
            {{
              hasCsvData
                ? `${csvCount} collection row${csvCount === 1 ? "" : "s"} loaded for this session.`
                : "Upload a CSV to unlock owned and missing views. Refreshing clears the collection."
            }}
          </p>
          <CButton
            type="button"
            :variant="hasCsvData ? 'secondary' : 'primary'"
            size="lg"
            @click="emit('open-upload')"
          >
            {{ hasCsvData ? "Replace collection" : "Upload collection" }}
          </CButton>
          <CButton :as="RouterLink" to="/top-commanders" variant="secondary" size="lg">
            Top Commanders
          </CButton>
        </div>

        <div
          v-if="floatingCards.length"
          class="selection-stage-card-stack"
          aria-label="Quick picks"
        >
          <button
            v-for="(card, index) in floatingCards"
            :key="`${card.name}-${index}`"
            type="button"
            class="selection-stage-random-card"
            :style="buildCardStyles(card.imageUrl)"
            :aria-label="`Open commander ${card.name}`"
            @click="handleFloatingCardSelection(card.name)"
          >
            <span class="selection-stage-random-card-art"></span>
            <span class="selection-stage-random-card-meta">
              <span class="selection-stage-random-card-label">Quick pick</span>
              <span class="selection-stage-random-card-name">{{ card.name }}</span>
            </span>
          </button>
        </div>
      </div>
    </CSurface>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue";
import { RouterLink } from "vue-router";
import { getRandomCardArt, type RandomCardArt } from "../../api/scryfallApi";
import { useBackgroundArt } from "../../composables/useBackgroundArt";
import { useEdhrecRouteState } from "../../composables/useEdhrecRouteState";
import type { CommanderSelection } from "../../types/edhrec";
import { scheduleWhenPageIdle } from "../../utils/idle";
import { prefersReducedMotion } from "../../utils/animations";
import { buildCommanderSlug } from "../../utils/slugifyCommander";
import CommanderSearch from "../CommanderSearch.vue";
import { CButton, CSurface, CText } from "../core";

const RANDOM_ART_TARGET = 3;
const RANDOM_ART_MAX_ATTEMPTS = 8;
const DESKTOP_RANDOM_ART_BREAKPOINT = 1024;

let cachedRandomCommanderArt: RandomCardArt[] | null = null;
let randomCommanderArtPromise: Promise<RandomCardArt[]> | null = null;

defineProps<{
  hasCsvData: boolean;
  csvCount: number;
}>();

const emit = defineEmits<{
  "selection-change": [payload: CommanderSelection];
  "open-upload": [];
  "open-utilities": [];
}>();

const commanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);
const spotlightArtUrl = ref("");
const floatingCards = ref<RandomCardArt[]>([]);
const playIntro = ref(false);

const { currentCommanderSlug, setCommanderSlug } = useEdhrecRouteState();
const { setBackgroundArtUrls } = useBackgroundArt();

const buildCardStyles = (imageUrl: string) =>
  ({
    "--selection-stage-card-art": `url("${imageUrl}")`,
  }) as CSSProperties;

const buildRandomCommanderArtSet = async () => {
  const seen = new Set<string>();
  const cards: RandomCardArt[] = [];

  for (
    let attempt = 0;
    attempt < RANDOM_ART_MAX_ATTEMPTS && cards.length < RANDOM_ART_TARGET;
    attempt += 1
  ) {
    const card = await getRandomCardArt();
    if (!card || seen.has(card.name)) {
      continue;
    }

    seen.add(card.name);
    cards.push(card);
  }

  return cards;
};

const getRandomCommanderArtSet = async () => {
  if (cachedRandomCommanderArt?.length) {
    return cachedRandomCommanderArt;
  }

  if (!randomCommanderArtPromise) {
    randomCommanderArtPromise = buildRandomCommanderArtSet()
      .then((cards) => {
        if (cards.length) {
          cachedRandomCommanderArt = cards;
        }
        return cards;
      })
      .finally(() => {
        randomCommanderArtPromise = null;
      });
  }

  return randomCommanderArtPromise;
};

const loadRandomCommanders = async () => {
  const cards = await getRandomCommanderArtSet();

  const [spotlight] = cards;
  spotlightArtUrl.value = spotlight?.imageUrl ?? "";
  floatingCards.value = cards.slice(0, RANDOM_ART_TARGET);
};

const handleCommanderSelection = (slug: string) => {
  setCommanderSlug(slug);
};

const handleFloatingCardSelection = (commanderName: string) => {
  const trimmed = commanderName.trim();
  if (!trimmed) {
    return;
  }

  if (commanderSearchRef.value) {
    commanderSearchRef.value.selectPrimaryCommander(trimmed);
    return;
  }

  emit("selection-change", {
    primary: trimmed,
    partner: "",
    hasPartner: false,
  });
  setCommanderSlug(buildCommanderSlug(trimmed));
};

watch(
  spotlightArtUrl,
  (url) => {
    setBackgroundArtUrls(url ? [url] : []);
  },
  { immediate: true }
);

let cancelRandomCommanderSchedule: () => void = () => undefined;

onMounted(() => {
  playIntro.value = !prefersReducedMotion();

  if (typeof window !== "undefined" && window.innerWidth < DESKTOP_RANDOM_ART_BREAKPOINT) {
    return;
  }

  cancelRandomCommanderSchedule = scheduleWhenPageIdle(() => {
    void loadRandomCommanders();
  });
});

onBeforeUnmount(() => {
  cancelRandomCommanderSchedule();
  setBackgroundArtUrls([]);
});

defineExpose({
  selectPrimaryCommander: (name: string) => commanderSearchRef.value?.selectPrimaryCommander(name),
});
</script>

<style scoped>
.selection-stage-shell {
  background: var(--surface-strong);
}

.selection-stage-copy {
  position: relative;
  z-index: 1;
}

.selection-stage-title {
  max-width: 18ch;
}

.selection-stage-description {
  max-width: 42rem;
}

.selection-stage-search-shell {
  position: relative;
  padding: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  background: var(--surface);
}

.selection-stage-search {
  position: relative;
  z-index: 1;
}

.selection-stage-search :deep(.commander-search-minimal-field) {
  gap: 0.5rem;
}

.selection-stage-search :deep(.commander-search-minimal-field > .flex > div) {
  min-height: 4rem;
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 3px;
  background: var(--surface-strong);
}

.selection-stage-search :deep(.commander-search-minimal-field > .flex > div:focus-within) {
  border-color: color-mix(in srgb, var(--accent) 84%, white 16%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-soft) 68%, transparent);
}

.selection-stage-search :deep(.commander-search-minimal-field input) {
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.selection-stage-search :deep(.commander-search-minimal-field input::placeholder) {
  color: color-mix(in srgb, var(--muted) 82%, white 18%);
}

.selection-stage-search :deep(.commander-search-minimal-field svg) {
  color: color-mix(in srgb, var(--warn) 82%, white 18%);
}

.selection-stage-search :deep([aria-live="polite"]) {
  border-radius: 3px;
  border-color: color-mix(in srgb, var(--border) 68%, transparent);
  background: var(--surface-strong) !important;
  box-shadow: none;
}

.selection-stage-card-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.75rem;
}

.selection-stage-random-card {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
  border-radius: 4px;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  text-align: left;
}

.selection-stage-random-card-art {
  position: absolute;
  inset: 0;
  background-image: var(--selection-stage-card-art);
  background-position: center top;
  background-size: cover;
}

.selection-stage-random-card-meta {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.65rem 0.7rem;
  border-radius: 3px;
  background: rgba(11, 17, 18, 0.82);
}

.selection-stage-random-card-label {
  color: color-mix(in srgb, var(--muted) 72%, white 28%);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.selection-stage-random-card-name {
  color: color-mix(in srgb, white 92%, var(--accent-soft) 8%);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.selection-stage-random-card:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 88%, white 12%);
  outline-offset: 4px;
}

.selection-stage-random-card-placeholder {
  border-color: color-mix(in srgb, var(--border) 44%, transparent);
  background: var(--surface-strong);
  box-shadow: var(--shadow-soft);
}

@media (max-width: 639px) {
  .selection-stage-search-shell {
    padding: 0.5rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .selection-stage-shell-intro .selection-stage-title,
  .selection-stage-shell-intro .selection-stage-description,
  .selection-stage-shell-intro .selection-stage-search-shell,
  .selection-stage-shell-intro .selection-stage-card-stack {
    opacity: 0;
    animation: selection-stage-rise 760ms var(--ease-decelerate) forwards;
  }

  .selection-stage-shell-intro .selection-stage-title {
    animation-delay: 40ms;
  }

  .selection-stage-shell-intro .selection-stage-description {
    animation-delay: 100ms;
  }

  .selection-stage-shell-intro .selection-stage-search-shell {
    animation-delay: 160ms;
  }

  .selection-stage-shell-intro .selection-stage-card-stack {
    animation-delay: 240ms;
  }
}

@keyframes selection-stage-rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
