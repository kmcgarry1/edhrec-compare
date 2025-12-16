import { computed, ref, watch } from "vue";

export type Density = "comfortable" | "cozy" | "compact";

const STORAGE_KEY = "commander-scout:layout-density";

const normalizeDensity = (value: string | null): Density => {
  if (value === "cozy" || value === "compact") {
    return value;
  }
  return "comfortable";
};

const readInitialDensity = (): Density => {
  if (typeof window === "undefined") {
    return "comfortable";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return normalizeDensity(stored);
};

const density = ref<Density>(readInitialDensity());

watch(
  density,
  (value) => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, value);
  },
  { immediate: false }
);

const spacing = computed(() => {
  const scale = {
    comfortable: {
      cardPadding: "p-4 sm:p-5",
      stackSpace: "space-y-5",
      sectionGap: "gap-6",
      contentGap: "gap-3",
      containerPaddingY: "py-5",
      labelText: "text-[0.78rem]",
    },
    cozy: {
      cardPadding: "p-3 sm:p-4",
      stackSpace: "space-y-4",
      sectionGap: "gap-5",
      contentGap: "gap-2.5",
      containerPaddingY: "py-5",
      labelText: "text-[0.74rem]",
    },
    compact: {
      cardPadding: "p-2.5 sm:p-3",
      stackSpace: "space-y-3",
      sectionGap: "gap-4",
      contentGap: "gap-2",
      containerPaddingY: "py-4",
      labelText: "text-[0.7rem]",
    },
  } as const;

  return scale[density.value];
});

const densityOptions: ReadonlyArray<{ value: Density; label: string }> = [
  { value: "comfortable", label: "Comfortable" },
  { value: "cozy", label: "Cozy" },
  { value: "compact", label: "Compact" },
];

const setDensity = (value: Density) => {
  density.value = value;
};

export const useLayoutDensity = () => {
  return {
    density,
    spacing,
    setDensity,
    densityOptions,
  };
};
