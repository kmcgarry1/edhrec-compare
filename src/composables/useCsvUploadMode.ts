/**
 * CSV upload mode selection
 *
 * Tracks whether the uploaded CSV should be used for standard deck comparison
 * or for the top commander scan workflow.
 */

import { ref } from "vue";

export type CsvUploadMode = "compare" | "top-50";

const mode = ref<CsvUploadMode>("compare");

export const useCsvUploadMode = () => {
  const setMode = (next: CsvUploadMode) => {
    mode.value = next;
  };

  return {
    mode,
    setMode,
  };
};
