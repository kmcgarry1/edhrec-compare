import { ref } from "vue";

const rows = ref<string[][]>([]);
const headers = ref<string[]>([]);

export const useCsvUpload = () => {
  const setCsvData = (nextRows: string[][], nextHeaders: string[]) => {
    rows.value = nextRows;
    headers.value = nextHeaders;
  };

  const clearCsvData = () => {
    rows.value = [];
    headers.value = [];
  };

  return {
    rows,
    headers,
    setCsvData,
    clearCsvData,
  };
};
