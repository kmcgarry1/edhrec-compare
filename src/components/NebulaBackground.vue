<template>
  <div class="fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute inset-0" :style="baseLayerStyle"></div>
    <div
      class="absolute inset-0 opacity-80"
      :style="glowLayerStyle"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useCommanderColors } from "../composables/useCommanderColors";

type ColorKey = "W" | "U" | "B" | "R" | "G" | "C";
const DEFAULT_ORDER: ColorKey[] = ["U", "B", "R", "G", "W"];

const COLOR_MAP: Record<
  ColorKey,
  { dark: string; light: string; glow: string }
> = {
  W: { dark: "#fef3c7", light: "#fbbf24", glow: "#fde68a" },
  U: { dark: "#bae6fd", light: "#60a5fa", glow: "#bfdbfe" },
  B: { dark: "#ddd6fe", light: "#a78bfa", glow: "#c4b5fd" },
  R: { dark: "#fecaca", light: "#f87171", glow: "#fca5a5" },
  G: { dark: "#bbf7d0", light: "#34d399", glow: "#86efac" },
  C: { dark: "#e9d5ff", light: "#a855f7", glow: "#d8b4fe" },
};

const POSITIONS = [
  "20% 15%",
  "80% 20%",
  "30% 70%",
  "70% 80%",
  "50% 40%",
];

const isClient = typeof window !== "undefined";
const isDark = ref(true);
let prefersDark: MediaQueryList | null = null;
let observer: MutationObserver | null = null;

const { commanderColors } = useCommanderColors();
const COLOR_KEYS: readonly ColorKey[] = ["W", "U", "B", "R", "G", "C"];

const normalizeColorKey = (value?: string): ColorKey => {
  const upper = (value ?? "C").toUpperCase();
  return COLOR_KEYS.includes(upper as ColorKey)
    ? (upper as ColorKey)
    : "C";
};

const updateThemeState = () => {
  if (!isClient) {
    return;
  }
  const rootHasDark = document.documentElement.classList.contains("dark");
  isDark.value = rootHasDark || Boolean(prefersDark?.matches);
};

onMounted(() => {
  if (!isClient) {
    return;
  }
  prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  prefersDark.addEventListener("change", updateThemeState);
  observer = new MutationObserver(updateThemeState);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  updateThemeState();
});

onBeforeUnmount(() => {
  prefersDark?.removeEventListener("change", updateThemeState);
  observer?.disconnect();
});

const palette = computed(() => {
  const codes =
    commanderColors.value.length > 0
      ? commanderColors.value
      : DEFAULT_ORDER;
  return codes
    .map((code) => {
      const normalized = normalizeColorKey(code);
      return COLOR_MAP[normalized];
    })
    .slice(0, POSITIONS.length);
});

const baseLayerStyle = computed(() => ({
  background: isDark.value
    ? "radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(2,6,23,0.95)), #020617"
    : "radial-gradient(circle at top, rgba(248,250,252,0.95), rgba(226,232,240,0.9)), #f8fafc",
  transition: "background 400ms ease",
}));

const glowLayerStyle = computed(() => {
  const gradients = palette.value.map((entry, index) => {
    const position = POSITIONS[index % POSITIONS.length];
    const color = isDark.value ? entry.dark : entry.light;
    const glow = entry.glow;
    return `radial-gradient(circle at ${position}, ${color} 0%, ${glow} 30%, transparent 60%)`;
  });

  return {
    backgroundImage: gradients.join(","),
    filter: "blur(120px)",
    transition: "background-image 600ms ease",
  };
});
</script>
