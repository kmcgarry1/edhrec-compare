<template>
  <div class="nebula fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div
      class="nebula__art nebula__art--primary"
      :class="{ 'is-visible': Boolean(currentUrl) }"
      :style="primaryStyle"
      aria-hidden="true"
    ></div>
    <div
      class="nebula__art nebula__art--secondary"
      :class="{ 'is-visible': showNext }"
      :style="secondaryStyle"
      aria-hidden="true"
    ></div>
    <div class="nebula__base" aria-hidden="true"></div>
    <div class="nebula__glow" aria-hidden="true"></div>
    <div class="nebula__noise" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useBackgroundArt } from "../composables/useBackgroundArt";

const { artUrls } = useBackgroundArt();

const currentUrl = ref<string | null>(null);
const nextUrl = ref<string | null>(null);
const showNext = ref(false);

const FADE_DURATION_MS = 1800;

let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }
};

const buildArtStyle = (url: string | null) =>
  url ? { backgroundImage: `url("${url}")` } : undefined;

const primaryStyle = computed(() => buildArtStyle(currentUrl.value));
const secondaryStyle = computed(() => buildArtStyle(nextUrl.value));

const updateArt = (urls: readonly string[]) => {
  clearTimers();

  const nextPrimaryUrl = urls[0] ?? null;
  if (!nextPrimaryUrl) {
    currentUrl.value = null;
    nextUrl.value = null;
    showNext.value = false;
    return;
  }

  if (!currentUrl.value) {
    currentUrl.value = nextPrimaryUrl;
    nextUrl.value = null;
    showNext.value = false;
    return;
  }

  if (currentUrl.value === nextPrimaryUrl) {
    nextUrl.value = null;
    showNext.value = false;
    return;
  }

  nextUrl.value = nextPrimaryUrl;
  showNext.value = true;

  fadeTimeout = setTimeout(() => {
    currentUrl.value = nextPrimaryUrl;
    nextUrl.value = null;
    showNext.value = false;
    fadeTimeout = null;
  }, FADE_DURATION_MS);
};

watch(
  artUrls,
  (urls) => {
    updateArt(urls);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped>
.nebula > div {
  position: absolute;
  inset: 0;
}

.nebula {
  contain: strict;
}

.nebula__art {
  opacity: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(20px) saturate(0.72) contrast(0.82);
  transform: scale(1.04);
  transition: opacity 1800ms ease;
}

.nebula__art.is-visible {
  opacity: 0.07;
}

.nebula__base {
  opacity: 0.42;
  background-image:
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 88%, transparent), color-mix(in srgb, var(--bg-strong) 86%, transparent)),
    radial-gradient(circle, var(--pattern-line) 0.45px, transparent 0.45px);
  background-size: 100% 100%, 6px 6px;
  background-position: center;
}

.nebula__glow {
  opacity: 0.16;
  filter: blur(12px);
  background-image: linear-gradient(90deg, transparent, var(--accent-glow), transparent);
}

.nebula__noise {
  opacity: 0.1;
  background-image: radial-gradient(circle, var(--pattern-line) 0.5px, transparent 0.5px);
  background-size: 4px 4px;
}

@media (prefers-reduced-motion: reduce) {
  .nebula__art {
    transition: none;
  }
}

:global(.a11y-reduce-motion) .nebula__art {
  transition: none !important;
}
</style>
