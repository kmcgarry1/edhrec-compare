import { ref } from "vue";

const commanderColors = ref<string[]>([]);
const colorSources = new Map<string, string[]>();

const recomputeColors = () => {
  const merged = new Set<string>();
  colorSources.forEach((colors) => {
    colors.forEach((color) => {
      if (color) {
        merged.add(color.toUpperCase());
      }
    });
  });
  commanderColors.value = Array.from(merged);
};

export const useCommanderColors = () => {
  const setCommanderColors = (key: string, colors: string[]) => {
    colorSources.set(key, colors);
    recomputeColors();
  };

  const clearCommanderColors = (key: string) => {
    colorSources.delete(key);
    recomputeColors();
  };

  return {
    commanderColors,
    setCommanderColors,
    clearCommanderColors,
  };
};
