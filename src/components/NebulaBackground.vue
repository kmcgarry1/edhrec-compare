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
    <div class="nebula__particles nebula__particles--fine" aria-hidden="true"></div>
    <div class="nebula__particles nebula__particles--coarse" aria-hidden="true"></div>
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
const activeIndex = ref(0);

const FADE_DURATION_MS = 1800;
const DISPLAY_DURATION_MS = 12000;

let cycleTimeout: ReturnType<typeof setTimeout> | null = null;
let fadeTimeout: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (cycleTimeout) {
    clearTimeout(cycleTimeout);
    cycleTimeout = null;
  }
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }
};

const buildArtStyle = (url: string | null) =>
  url ? { backgroundImage: `url("${url}")` } : undefined;

const primaryStyle = computed(() => buildArtStyle(currentUrl.value));
const secondaryStyle = computed(() => buildArtStyle(nextUrl.value));

const scheduleNext = () => {
  const urls = artUrls.value;
  if (urls.length < 2) {
    return;
  }

  const upcomingIndex = (activeIndex.value + 1) % urls.length;
  nextUrl.value = urls[upcomingIndex] ?? null;
  showNext.value = true;

  fadeTimeout = setTimeout(() => {
    currentUrl.value = nextUrl.value;
    activeIndex.value = upcomingIndex;
    showNext.value = false;
    nextUrl.value = null;
    cycleTimeout = setTimeout(scheduleNext, DISPLAY_DURATION_MS);
  }, FADE_DURATION_MS);
};

const startCycle = (urls: readonly string[]) => {
  clearTimers();
  if (!urls.length) {
    currentUrl.value = null;
    nextUrl.value = null;
    showNext.value = false;
    activeIndex.value = 0;
    return;
  }
  activeIndex.value = 0;
  currentUrl.value = urls[0] ?? null;
  nextUrl.value = null;
  showNext.value = false;
  if (urls.length > 1) {
    cycleTimeout = setTimeout(scheduleNext, DISPLAY_DURATION_MS);
  }
};

watch(
  artUrls,
  (urls) => {
    startCycle(urls);
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

.nebula__art {
  opacity: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(32px) saturate(1.15);
  transform: scale(1.08);
  transition: opacity 1800ms ease;
  mix-blend-mode: soft-light;
}

.nebula__art.is-visible {
  opacity: 0.28;
}

.nebula__base {
  opacity: 0.65;
  background-image:
    linear-gradient(to right, var(--pattern-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--pattern-line) 1px, transparent 1px),
    radial-gradient(circle at 18% 22%, var(--accent-glow-strong), transparent 45%),
    radial-gradient(circle at 78% 10%, var(--accent-glow), transparent 40%);
  background-size: 140px 140px, 140px 140px, 100% 100%, 100% 100%;
  background-position: center;
}

.nebula__glow {
  opacity: 0.7;
  filter: blur(40px);
  background-image:
    radial-gradient(circle at 20% 80%, var(--warn-soft), transparent 50%),
    radial-gradient(circle at 82% 70%, var(--danger-soft), transparent 50%),
    radial-gradient(circle at 55% 28%, var(--accent-glow-strong), transparent 55%);
  animation: nebula-pulse 32s ease-in-out infinite;
}

.nebula__particles {
  opacity: 0.35;
  will-change: background-position, transform;
}

.nebula__particles--fine {
  background-image:
    radial-gradient(circle, var(--pattern-line) 1px, transparent 1px),
    radial-gradient(circle, var(--accent-glow) 1px, transparent 1px);
  background-size: 90px 90px, 180px 180px;
  background-position: 0 0, 45px 60px;
  animation: nebula-drift 24s linear infinite;
}

.nebula__particles--coarse {
  opacity: 0.25;
  background-image: radial-gradient(circle, var(--accent-glow-strong) 1.5px, transparent 1.5px);
  background-size: 240px 240px;
  background-position: 120px 80px;
  animation: nebula-drift 36s linear infinite reverse;
}

.nebula__noise {
  opacity: 0.18;
  background-image: radial-gradient(circle, var(--pattern-line) 0.5px, transparent 0.5px);
  background-size: 3px 3px;
}

@keyframes nebula-drift {
  0% {
    background-position: 0 0, 45px 60px;
    transform: translate3d(0, 0, 0);
  }
  50% {
    background-position: 70px 45px, 20px 50px;
    transform: translate3d(-3%, 2%, 0);
  }
  100% {
    background-position: 0 0, 45px 60px;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes nebula-pulse {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate3d(-2%, 2%, 0) scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.65;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nebula__art {
    transition: none;
  }

  .nebula__glow,
  .nebula__particles--fine,
  .nebula__particles--coarse {
    animation: none;
  }
}
</style>
