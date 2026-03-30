/**
 * CSV file upload and parsing state management
 *
 * Manages parsed CSV data including headers and row data. The parser
 * auto-detects the "Name" column (case-insensitive) or defaults to the
 * first column. Normalizes card names for double-faced cards.
 *
 * @module composables/useCsvUpload
 *
 * @example
 * ```typescript
 * const { rows, headers, setCsvData, clearCsvData } = useCsvUpload();
 *
 * // Set parsed CSV data
 * setCsvData([['Sol Ring', '1'], ['Mana Crypt', '1']], ['Name', 'Quantity']);
 *
 * // Access parsed CSV data
 * console.log(headers.value); // ['Name', 'Quantity']
 * console.log(rows.value);    // [['Sol Ring', '1'], ['Mana Crypt', '1']]
 *
 * // Clear data
 * clearCsvData();
 * ```
 */

import { ref } from "vue";

type CsvUploadMetadata = {
  sourceName?: string | null;
  importedAt?: Date | null;
};

const rows = ref<string[][]>([]);
const headers = ref<string[]>([]);
const sourceName = ref<string | null>(null);
const importedAt = ref<Date | null>(null);

/**
 * Composable for managing CSV upload state
 *
 * Stores parsed CSV data in memory without persistence.
 *
 * @returns Object containing CSV data and control methods
 */
export const useCsvUpload = () => {
  /**
   * Set parsed CSV data
   *
   * @param nextRows - Array of row data (each row is an array of cell values)
   * @param nextHeaders - Array of column header names
   * @param metadata - Optional upload metadata for status surfaces
   *
   * @example
   * ```typescript
   * setCsvData(
   *   [['Lightning Bolt', '0.50'], ['Sol Ring', '2.00']],
   *   ['Card Name', 'Price'],
   *   { sourceName: 'collection.csv', importedAt: new Date() }
   * );
   * ```
   */
  const setCsvData = (
    nextRows: string[][],
    nextHeaders: string[],
    metadata: CsvUploadMetadata = {}
  ) => {
    rows.value = nextRows;
    headers.value = nextHeaders;
    sourceName.value = metadata.sourceName ?? null;
    importedAt.value = metadata.importedAt ?? new Date();
  };

  /**
   * Clear all CSV data
   *
   * Resets rows, headers, and upload metadata.
   */
  const clearCsvData = () => {
    rows.value = [];
    headers.value = [];
    sourceName.value = null;
    importedAt.value = null;
  };

  return {
    /** Parsed CSV row data */
    rows,
    /** CSV column headers */
    headers,
    /** Uploaded CSV file name when available */
    sourceName,
    /** Timestamp for the last successful import */
    importedAt,
    /** Set parsed CSV data */
    setCsvData,
    /** Clear all CSV data */
    clearCsvData,
  };
};
