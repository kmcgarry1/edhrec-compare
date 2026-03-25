<template>
  <section>
    <Card
      variant="masthead"
      padding="p-6 sm:p-8 lg:p-10"
      rounded="rounded-[34px]"
      shadow="shadow-[var(--shadow)]"
      class="selection-stage-shell relative overflow-hidden"
      :class="{ 'selection-stage-shell-intro': playIntro }"
    >
      <div class="selection-stage-backdrop pointer-events-none absolute inset-0" aria-hidden="true">
        <div class="selection-stage-grid"></div>
        <div class="selection-stage-halo selection-stage-halo-cyan"></div>
        <div class="selection-stage-halo selection-stage-halo-amber"></div>
        <div class="selection-stage-beam"></div>
      </div>

      <div
        class="selection-stage-layout relative grid gap-12 lg:grid-cols-[minmax(0,1.04fr)_minmax(19rem,0.96fr)] lg:items-center"
      >
        <div
          class="selection-stage-copy flex flex-col items-center justify-center gap-8 text-center lg:items-start lg:text-left"
        >
          <div class="selection-stage-mark" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div class="space-y-5">
            <CText tag="h1" variant="display" class="selection-stage-title text-balance">
              Search commanders
            </CText>
            <CText
              tag="p"
              variant="body"
              tone="muted"
              class="selection-stage-description mx-auto max-w-2xl sm:text-base lg:mx-0"
            >
              Find a commander first, then turn on collection overlays when you want owned and
              unowned comparisons.
            </CText>
          </div>

          <div class="selection-stage-search-shell w-full max-w-[45rem]">
            <CommanderSearch
              ref="commanderSearchRef"
              mode="minimal"
              class="selection-stage-search w-full"
              :selected-slug="currentCommanderSlug"
              @commander-selected="handleCommanderSelection"
              @selection-change="emit('selection-change', $event)"
            />
          </div>

          <div class="selection-stage-upload-panel w-full max-w-[45rem]">
            <div class="selection-stage-upload-copy">
              <CText tag="p" variant="eyebrow" tone="muted"> Collection overlay </CText>
              <CText tag="p" variant="title" class="selection-stage-upload-title">
                {{ hasCsvData ? "Collection loaded and ready" : "Upload CSV to match what you own" }}
              </CText>
              <CText tag="p" variant="helper" tone="muted" class="selection-stage-upload-helper">
                {{
                  hasCsvData
                    ? `${csvCount} cards loaded. Ownership overlays are ready as soon as you pick a commander.`
                    : "Bring in your collection to highlight owned and unowned cards across every EDHREC list."
                }}
              </CText>
            </div>

            <CButton
              type="button"
              variant="primary"
              size="lg"
              class="selection-stage-upload-button"
              @click="emit('open-upload')"
            >
              {{ hasCsvData ? "Replace CSV" : "Upload CSV" }}
            </CButton>
          </div>
        </div>

        <div class="selection-stage-art relative hidden min-h-[26rem] lg:block">
          <div class="selection-stage-orbit" aria-hidden="true">
            <span class="selection-stage-orbit-ring selection-stage-orbit-ring-lg"></span>
            <span class="selection-stage-orbit-ring selection-stage-orbit-ring-md"></span>
            <span class="selection-stage-orbit-ring selection-stage-orbit-ring-sm"></span>
            <span class="selection-stage-orbit-dot selection-stage-orbit-dot-cyan"></span>
            <span class="selection-stage-orbit-dot selection-stage-orbit-dot-amber"></span>
          </div>

          <div class="selection-stage-card-stack">
            <button
              v-for="(card, index) in floatingCards"
              :key="`${card.name}-${index}`"
              type="button"
              class="selection-stage-random-card"
              :class="index === 0 ? 'selection-stage-random-card-front' : 'selection-stage-random-card-back'"
              :style="buildCardStyles(card.imageUrl)"
              :aria-label="`Open commander ${card.name}`"
              @click="handleFloatingCardSelection(card.name)"
            >
              <div class="selection-stage-random-card-art"></div>
              <div class="selection-stage-random-card-sheen"></div>
              <div class="selection-stage-random-card-meta">
                <span class="selection-stage-random-card-label">Random commander</span>
                <span class="selection-stage-random-card-name">{{ card.name }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Card>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue";
import { getRandomCardArt, type RandomCardArt } from "../../api/scryfallApi";
import { useBackgroundArt } from "../../composables/useBackgroundArt";
import { useEdhrecRouteState } from "../../composables/useEdhrecRouteState";
import type { CommanderSelection } from "../../types/edhrec";
import { prefersReducedMotion } from "../../utils/animations";
import { buildCommanderSlug } from "../../utils/slugifyCommander";
import CommanderSearch from "../CommanderSearch.vue";
import Card from "../Card.vue";
import { CButton, CText } from "../core";

const RANDOM_ART_TARGET = 3;
const RANDOM_ART_MAX_ATTEMPTS = 8;

defineProps<{
  hasCsvData: boolean;
  csvCount: number;
}>();

const emit = defineEmits<{
  "selection-change": [payload: CommanderSelection];
  "open-upload": [];
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

const loadRandomCommanders = async () => {
  const seen = new Set<string>();
  const cards: RandomCardArt[] = [];

  for (let attempt = 0; attempt < RANDOM_ART_MAX_ATTEMPTS && cards.length < RANDOM_ART_TARGET; attempt += 1) {
    const card = await getRandomCardArt();
    if (!card || seen.has(card.name)) {
      continue;
    }

    seen.add(card.name);
    cards.push(card);
  }

  const [spotlight, ...others] = cards;
  spotlightArtUrl.value = spotlight?.imageUrl ?? "";
  floatingCards.value = others.slice(0, 2);
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

onMounted(() => {
  playIntro.value = !prefersReducedMotion();
  void loadRandomCommanders();
});

onBeforeUnmount(() => {
  setBackgroundArtUrls([]);
});

defineExpose({
  selectPrimaryCommander: (name: string) => commanderSearchRef.value?.selectPrimaryCommander(name),
});
</script>

<style scoped>
.selection-stage-shell {
  min-height: clamp(36rem, 78vh, 52rem);
  background:
    linear-gradient(
      135deg,
      rgba(5, 13, 20, 0.92),
      rgba(6, 16, 24, 0.84) 38%,
      rgba(16, 26, 31, 0.8)
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 56%);
}

.selection-stage-shell::before {
  content: "";
  position: absolute;
  inset: 1rem;
  border: 1px solid rgba(150, 180, 188, 0.12);
  border-radius: 1.8rem;
  opacity: 0.9;
  pointer-events: none;
}

.selection-stage-shell::after {
  content: "";
  position: absolute;
  inset: auto 10% -4rem 10%;
  height: 8rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(56, 211, 205, 0.14),
    rgba(56, 211, 205, 0.04) 38%,
    rgba(255, 179, 102, 0.16)
  );
  filter: blur(44px);
  pointer-events: none;
}

.selection-stage-backdrop {
  overflow: hidden;
}

.selection-stage-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 6.5rem 6.5rem;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.75), transparent 84%);
  opacity: 0.18;
}

.selection-stage-halo {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
}

.selection-stage-halo-cyan {
  top: -4rem;
  left: 36%;
  width: 24rem;
  height: 24rem;
  background: radial-gradient(circle, rgba(26, 181, 185, 0.24), transparent 68%);
}

.selection-stage-halo-amber {
  right: -4rem;
  bottom: -6rem;
  width: 20rem;
  height: 20rem;
  background: radial-gradient(circle, rgba(255, 179, 102, 0.16), transparent 68%);
}

.selection-stage-beam {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, transparent 0%, rgba(56, 211, 205, 0.08) 46%, transparent 62%),
    radial-gradient(circle at 74% 26%, rgba(56, 211, 205, 0.14), transparent 16%);
  opacity: 0.8;
}

.selection-stage-layout {
  min-height: clamp(32rem, 70vh, 44rem);
}

.selection-stage-copy {
  position: relative;
  z-index: 1;
}

.selection-stage-mark {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.selection-stage-mark span {
  display: block;
  height: 0.4rem;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(56, 211, 205, 0.95), rgba(255, 179, 102, 0.68));
  box-shadow: 0 0 16px rgba(56, 211, 205, 0.28);
}

.selection-stage-mark span:nth-child(1) {
  width: 3.6rem;
}

.selection-stage-mark span:nth-child(2) {
  width: 1.15rem;
  opacity: 0.82;
}

.selection-stage-mark span:nth-child(3) {
  width: 0.4rem;
  opacity: 0.72;
}

.selection-stage-title {
  max-width: 9.5ch;
  letter-spacing: -0.05em;
  text-shadow: 0 0 32px rgba(56, 211, 205, 0.12);
}

.selection-stage-description {
  max-width: 34rem;
}

.selection-stage-search-shell {
  position: relative;
  padding: 0.9rem;
  border: 1px solid rgba(138, 164, 172, 0.18);
  border-radius: 1.9rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01)),
    linear-gradient(135deg, rgba(10, 24, 33, 0.86), rgba(18, 35, 42, 0.74));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 24px 52px rgba(3, 10, 15, 0.22);
}

.selection-stage-search-shell::before {
  content: "";
  position: absolute;
  left: 1.25rem;
  right: 28%;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(56, 211, 205, 0.85), transparent 72%);
}

.selection-stage-search-shell::after {
  content: "";
  position: absolute;
  right: 1rem;
  bottom: 0.85rem;
  width: 7rem;
  height: 4rem;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(56, 211, 205, 0.12), transparent 72%);
  filter: blur(18px);
}

.selection-stage-search {
  position: relative;
  z-index: 1;
}

.selection-stage-search :deep(.commander-search-minimal-field) {
  gap: 0.5rem;
}

.selection-stage-search :deep(.commander-search-minimal-field > .flex > div) {
  min-height: 4.35rem;
  border: 1px solid rgba(124, 150, 160, 0.34);
  border-radius: 1.3rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.015)),
    linear-gradient(135deg, rgba(34, 50, 58, 0.64), rgba(30, 45, 52, 0.78));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 12px 28px rgba(3, 10, 15, 0.16);
}

.selection-stage-search :deep(.commander-search-minimal-field > .flex > div:focus-within) {
  border-color: rgba(56, 211, 205, 0.84);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(56, 211, 205, 0.18),
    0 16px 36px rgba(18, 57, 61, 0.24);
}

.selection-stage-search :deep(.commander-search-minimal-field input) {
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.selection-stage-search :deep(.commander-search-minimal-field input::placeholder) {
  color: rgba(208, 217, 220, 0.76);
}

.selection-stage-search :deep(.commander-search-minimal-field svg) {
  color: rgba(255, 179, 102, 0.86);
}

.selection-stage-search :deep([aria-live="polite"]) {
  border-radius: 1.2rem;
  border-color: rgba(124, 150, 160, 0.22);
  background:
    linear-gradient(180deg, rgba(20, 32, 39, 0.96), rgba(17, 27, 34, 0.96)) !important;
  box-shadow: 0 20px 32px rgba(3, 10, 15, 0.2);
}

.selection-stage-upload-panel {
  display: grid;
  gap: 1.2rem;
  padding: 1.2rem 1.35rem;
  border: 1px solid rgba(56, 211, 205, 0.22);
  border-radius: 1.6rem;
  background:
    linear-gradient(180deg, rgba(56, 211, 205, 0.13), rgba(56, 211, 205, 0.05)),
    linear-gradient(135deg, rgba(11, 24, 31, 0.9), rgba(17, 33, 39, 0.86));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 18px 34px rgba(3, 10, 15, 0.18);
}

.selection-stage-upload-copy {
  display: grid;
  gap: 0.35rem;
}

.selection-stage-upload-title {
  max-width: 24rem;
  font-size: 1.2rem;
}

.selection-stage-upload-helper {
  max-width: 34rem;
}

.selection-stage-upload-button {
  justify-self: start;
  min-width: 11rem;
  padding-inline: 1.4rem;
  box-shadow: 0 18px 36px rgba(26, 181, 185, 0.18);
}

.selection-stage-art {
  position: relative;
}

.selection-stage-orbit {
  position: absolute;
  inset: 1rem 0 1rem 3rem;
}

.selection-stage-orbit-ring {
  position: absolute;
  border: 1px solid rgba(137, 164, 172, 0.12);
  border-radius: 999px;
}

.selection-stage-orbit-ring-lg {
  inset: 0.5rem 0 0 1rem;
}

.selection-stage-orbit-ring-md {
  inset: 4rem 3rem 3rem 4rem;
}

.selection-stage-orbit-ring-sm {
  inset: 7rem 6rem 6rem 7rem;
}

.selection-stage-orbit-dot {
  position: absolute;
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 999px;
  box-shadow: 0 0 18px currentColor;
}

.selection-stage-orbit-dot-cyan {
  top: 2.8rem;
  right: 3.4rem;
  color: rgba(56, 211, 205, 0.95);
  background: currentColor;
}

.selection-stage-orbit-dot-amber {
  bottom: 3.8rem;
  left: 4.2rem;
  color: rgba(255, 179, 102, 0.86);
  background: currentColor;
}

.selection-stage-card-stack {
  position: absolute;
  inset: 1.5rem 0.6rem 1.5rem 4.5rem;
}

.selection-stage-random-card {
  position: absolute;
  display: block;
  width: min(18rem, 100%);
  aspect-ratio: 63 / 88;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(155, 182, 188, 0.18);
  border-radius: 1.8rem;
  background: transparent;
  box-shadow: 0 28px 54px rgba(3, 10, 15, 0.26);
  cursor: pointer;
  text-align: left;
}

.selection-stage-random-card-front {
  top: 1.2rem;
  left: 1.4rem;
  transform: rotate(-7deg);
}

.selection-stage-random-card-back {
  right: 0.6rem;
  bottom: 1rem;
  transform: rotate(11deg);
}

.selection-stage-random-card-art,
.selection-stage-random-card-sheen {
  position: absolute;
  inset: 0;
}

.selection-stage-random-card-art {
  background-image:
    linear-gradient(180deg, rgba(7, 16, 22, 0.04), rgba(7, 16, 22, 0.74)),
    var(--selection-stage-card-art);
  background-position: center center;
  background-size: cover;
}

.selection-stage-random-card-sheen {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.18), transparent 24%),
    radial-gradient(circle at top right, rgba(56, 211, 205, 0.16), transparent 34%);
}

.selection-stage-random-card-meta {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(7, 16, 22, 0.7);
  backdrop-filter: blur(16px);
}

.selection-stage-random-card-label {
  color: rgba(190, 202, 206, 0.68);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.selection-stage-random-card-name {
  color: rgba(247, 248, 249, 0.94);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.selection-stage-random-card:focus-visible {
  outline: 2px solid rgba(56, 211, 205, 0.9);
  outline-offset: 4px;
}

.selection-stage-random-card:hover .selection-stage-random-card-sheen,
.selection-stage-random-card:focus-visible .selection-stage-random-card-sheen {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.26), transparent 26%),
    radial-gradient(circle at top right, rgba(56, 211, 205, 0.22), transparent 38%);
}

@media (max-width: 1023px) {
  .selection-stage-shell {
    min-height: clamp(32rem, 74vh, 42rem);
  }

  .selection-stage-shell::before {
    inset: 0.8rem;
  }

  .selection-stage-title {
    max-width: 10.5ch;
  }

  .selection-stage-search-shell,
  .selection-stage-upload-panel {
    max-width: 100%;
  }
}

@media (max-width: 639px) {
  .selection-stage-shell {
    min-height: 30rem;
  }

  .selection-stage-search-shell {
    padding: 0.75rem;
  }

  .selection-stage-upload-panel {
    justify-items: center;
    text-align: center;
  }

  .selection-stage-upload-button {
    justify-self: center;
    width: 100%;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .selection-stage-halo-cyan {
    animation: selection-stage-drift 18s ease-in-out infinite alternate;
  }

  .selection-stage-halo-amber {
    animation: selection-stage-drift 22s ease-in-out infinite alternate-reverse;
  }

  .selection-stage-random-card-front {
    animation: selection-stage-float-front 8s ease-in-out infinite;
  }

  .selection-stage-random-card-back {
    animation: selection-stage-float-back 9s ease-in-out infinite;
  }

  .selection-stage-beam {
    animation: selection-stage-pulse 12s ease-in-out infinite;
  }

  .selection-stage-shell-intro .selection-stage-mark,
  .selection-stage-shell-intro .selection-stage-title,
  .selection-stage-shell-intro .selection-stage-description,
  .selection-stage-shell-intro .selection-stage-search-shell,
  .selection-stage-shell-intro .selection-stage-upload-panel,
  .selection-stage-shell-intro .selection-stage-art {
    opacity: 0;
    animation: selection-stage-rise 760ms var(--ease-decelerate) forwards;
  }

  .selection-stage-shell-intro .selection-stage-mark {
    animation-delay: 50ms;
  }

  .selection-stage-shell-intro .selection-stage-title {
    animation-delay: 140ms;
  }

  .selection-stage-shell-intro .selection-stage-description {
    animation-delay: 220ms;
  }

  .selection-stage-shell-intro .selection-stage-search-shell {
    animation-delay: 320ms;
  }

  .selection-stage-shell-intro .selection-stage-upload-panel {
    animation-delay: 430ms;
  }

  .selection-stage-shell-intro .selection-stage-art {
    animation-delay: 260ms;
  }
}

@keyframes selection-stage-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  100% {
    transform: translate3d(10px, -12px, 0) scale(1.05);
  }
}

@keyframes selection-stage-pulse {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 0.88;
  }
}

@keyframes selection-stage-rise {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
    filter: blur(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes selection-stage-float-front {
  0%,
  100% {
    transform: rotate(-7deg) translateY(0);
  }

  50% {
    transform: rotate(-5deg) translateY(-12px);
  }
}

@keyframes selection-stage-float-back {
  0%,
  100% {
    transform: rotate(11deg) translateY(0);
  }

  50% {
    transform: rotate(9deg) translateY(-10px);
  }
}
</style>
