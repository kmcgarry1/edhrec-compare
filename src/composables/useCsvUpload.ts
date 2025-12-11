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
 * // Access parsed data
 * console.log(headers.value); // ['Name', 'Quantity']
 * console.log(rows.value);    // [['Sol Ring', '1'], ['Mana Crypt', '1']]
 *
 * // Clear data
 * clearCsvData();
 * ```
 */

import { ref } from "vue";

const rows = ref<string[][]>([]);
const headers = ref<string[]>([]);

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
   *
   * @example
   * ```typescript
   * setCsvData(
   *   [['Lightning Bolt', '0.50'], ['Sol Ring', '2.00']],
   *   ['Card Name', 'Price']
   * );
   * ```
   */
  const setCsvData = (nextRows: string[][], nextHeaders: string[]) => {
    rows.value = nextRows;
    headers.value = nextHeaders;
  };

  /**
   * Clear all CSV data
   *
   * Resets both rows and headers to empty arrays.
   */
  const clearCsvData = () => {
    rows.value = [];
    headers.value = [];
  };

  return {
    /** Parsed CSV row data */
    rows,
    /** CSV column headers */
    headers,
    /** Set parsed CSV data */
    setCsvData,
    /** Clear all CSV data */
    clearCsvData,
  };
};
