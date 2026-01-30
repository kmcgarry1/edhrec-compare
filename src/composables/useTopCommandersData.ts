import { ref } from "vue";
import { getTopCommanders, type TopCommander } from "../api/edhrecApi";
import { handleError } from "../utils/errorHandler";

export type TopCommandersSortMode = "rank" | "owned";

type SortOption = { value: TopCommandersSortMode; label: string };

const sortOptions: ReadonlyArray<SortOption> = [
  { value: "rank", label: "Ranked" },
  { value: "owned", label: "Highest owned" },
];

const limitOptions = [50, 100, 250, 500] as const;

export const useTopCommandersData = () => {
  const topCommanders = ref<TopCommander[]>([]);
  const topHeader = ref("Top Commanders");
  const topLoading = ref(false);
  const topError = ref<string | null>(null);
  const topLimit = ref<(typeof limitOptions)[number]>(50);
  const sortMode = ref<TopCommandersSortMode>("rank");

  const fetchTopCommanders = async (path: string) => {
    topLoading.value = true;
    topError.value = null;
    try {
      const { header, commanders } = await getTopCommanders(topLimit.value, {
        path,
      });
      topHeader.value = header || topHeader.value;
      topCommanders.value = commanders;
      return commanders;
    } catch (error) {
      const handled = handleError(error, {
        notify: true,
        fallbackMessage: "Unable to load top commanders.",
        context: "TopCommandersPage",
      });
      topError.value = handled.userMessage;
      return null;
    } finally {
      topLoading.value = false;
    }
  };

  const setSortMode = (value: TopCommandersSortMode) => {
    sortMode.value = value;
  };

  const setTopLimit = (value: (typeof limitOptions)[number]) => {
    if (topLimit.value === value) {
      return false;
    }
    topLimit.value = value;
    return true;
  };

  return {
    topCommanders,
    topHeader,
    topLoading,
    topError,
    topLimit,
    sortMode,
    sortOptions,
    limitOptions,
    fetchTopCommanders,
    setSortMode,
    setTopLimit,
  };
};

export type TopCommandersSortOption = (typeof sortOptions)[number];
export type TopCommandersLimitOption = (typeof limitOptions)[number];
