import { computed, ref } from "vue";
import {
  COLOR_IDENTITY_META,
  COLOR_IDENTITY_ORDER,
  COLOR_COMBO_SLUGS,
  type CommanderColor,
} from "../utils/colorIdentity";

type FilterOptions = {
  getCommanderColors: (name: string) => CommanderColor[];
};

const COLOR_ORDER: CommanderColor[] = ["W", "U", "B", "R", "G"];

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

export const useTopCommanderFilters = (options: FilterOptions) => {
  const selectedColors = ref<CommanderColor[]>([]);
  const colorOptions = COLOR_IDENTITY_ORDER;

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

  const colorDotClass = (color: CommanderColor) =>
    COLOR_IDENTITY_META[color]?.dot ?? "";
  const colorPillClass = (color: CommanderColor) =>
    COLOR_IDENTITY_META[color]?.pill ?? "";
  const colorLabel = (color: CommanderColor) =>
    COLOR_IDENTITY_META[color]?.label ?? color;

  const matchesColorFilter = (name: string) => {
    if (!selectedColors.value.length) {
      return true;
    }
    const colors = options.getCommanderColors(name);
    if (!colors.length) {
      return true;
    }
    return selectedColors.value.every((color) => colors.includes(color));
  };

  return {
    selectedColors,
    colorOptions,
    toggleColor,
    clearColors,
    selectedColorPath,
    colorDotClass,
    colorPillClass,
    colorLabel,
    matchesColorFilter,
  };
};
