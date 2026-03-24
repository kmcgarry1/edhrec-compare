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
  filter: blur(16px) saturate(1.02);
  transform: scale(1.03);
  transition: opacity 1800ms ease;
}

.nebula__art.is-visible {
  opacity: 0.18;
}

.nebula__base {
  opacity: 0.48;
  background-image:
    linear-gradient(180deg, color-mix(in srgb, var(--bg-strong) 76%, transparent), transparent),
    radial-gradient(circle at 18% 22%, var(--accent-glow-strong), transparent 45%),
    radial-gradient(circle at 78% 10%, var(--accent-glow), transparent 40%);
  background-size: 100% 100%, 100% 100%, 100% 100%;
  background-position: center;
}

.nebula__glow {
  opacity: 0.32;
  filter: blur(28px);
  background-image:
    radial-gradient(circle at 18% 78%, var(--warn-soft), transparent 50%),
    radial-gradient(circle at 82% 70%, var(--danger-soft), transparent 45%),
    radial-gradient(circle at 55% 20%, var(--accent-glow-strong), transparent 55%);
}

.nebula__noise {
  opacity: 0.08;
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
