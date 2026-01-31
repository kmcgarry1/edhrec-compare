import { computed, ref, watch, type Ref } from "vue";
import { requestCache } from "../api/requestCache";
import { useGlobalLoading } from "./useGlobalLoading";
import { handleError } from "../utils/errorHandler";
import type { EdhrecCardlist, EdhrecData } from "../types/edhrec";

export const useEdhrecData = (url: Ref<string | null>) => {
  const data = ref<EdhrecData | null>(null);
  const error = ref<string | null>(null);
  const { withLoading, getScopeLoading } = useGlobalLoading();
  const readerScope = "edhrec-reader";
  const readerLoading = getScopeLoading(readerScope);

  const fetchJsonData = async (targetUrl: string) => {
    error.value = null;

    await withLoading(
      async () => {
        await requestCache.dedupe(`edhrec:${targetUrl}`, async () => {
          try {
            const response = await fetch(targetUrl);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            data.value = await response.json();
          } catch (err) {
            const handled = handleError(err, {
              notify: true,
              fallbackMessage: "Unable to fetch commander data from EDHREC.",
              context: "EDHREC request failed",
            });
            error.value = handled.userMessage;
          }
        });
      },
      "Fetching commander data...",
      readerScope
    );
  };

  const refresh = () => {
    if (!url.value) {
      data.value = null;
      error.value = null;
      return;
    }
    void fetchJsonData(url.value);
  };

  watch(
    url,
    () => {
      refresh();
    },
    { immediate: true }
  );

  const cardlists = computed<EdhrecCardlist[]>(
    () => data.value?.container?.json_dict?.cardlists || []
  );

  const totalCardCount = computed(() =>
    cardlists.value.reduce((total, cardlist) => total + cardlist.cardviews.length, 0)
  );

  return {
    data,
    error,
    cardlists,
    totalCardCount,
    readerLoading,
    refresh,
  };
};
