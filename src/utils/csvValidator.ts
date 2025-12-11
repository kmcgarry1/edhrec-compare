/**
 * CSV file validation utilities
 *
 * Validates CSV structure and content for card inventory uploads.
 * Checks for required headers, empty rows, and column consistency.
 *
 * @module utils/csvValidator
 *
 * @example
 * ```typescript
 * import { validateCsv } from '@/utils/csvValidator';
 *
 * const result = validateCsv(['Name', 'Quantity'], [['Sol Ring', '1']]);
 * if (result.valid) {
 *   console.log('CSV is valid');
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */

/**
 * Result of CSV validation
 */
export interface CsvValidationResult {
  /** Whether the CSV is valid (no errors) */
  valid: boolean;
  /** Critical errors that prevent processing */
  errors: string[];
  /** Non-critical warnings */
  warnings: string[];
}

/**
 * Normalize header string for comparison
 *
 * @param value - Header value to normalize
 * @returns Lowercase trimmed string
 */
const normalizeHeader = (value: string) => value?.trim().toLowerCase() ?? "";

/**
 * Validate CSV file structure and content
 *
 * Performs validation checks on parsed CSV data including:
 * - Header presence
 * - "Name" column detection
 * - Empty row detection
 * - Column count consistency
 *
 * @param headers - Array of column headers
 * @param rows - 2D array of row data
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const result = validateCsv(
 *   ['Name', 'Quantity'],
 *   [
 *     ['Lightning Bolt', '4'],
 *     ['Sol Ring', '1']
 *   ]
 * );
 *
 * if (!result.valid) {
 *   result.errors.forEach(err => console.error(err));
 * }
 *
 * result.warnings.forEach(warn => console.warn(warn));
 * ```
 */
export function validateCsv(headers: string[], rows: string[][]): CsvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!headers?.length) {
    errors.push("No headers were detected in this CSV.");
  }

  const hasNameColumn = headers.some((header) => normalizeHeader(header).includes("name"));
  if (!hasNameColumn) {
    warnings.push('No "Name" column found. Using first column.');
  }

  const emptyRows = rows.filter((row) => row.every((cell) => (cell ?? "").trim().length === 0));
  if (emptyRows.length > 0) {
    const plural = emptyRows.length === 1 ? "row" : "rows";
    warnings.push(`Found ${emptyRows.length} empty ${plural}`);
  }

  const expectedLength = headers.length;
  if (expectedLength > 0) {
    const mismatchedRows = rows
      .map((row, index) => (row.length !== expectedLength ? index + 2 : null))
      .filter((rowNumber): rowNumber is number => rowNumber !== null);

    if (mismatchedRows.length > 0) {
      const shown = mismatchedRows.slice(0, 4).join(", ");
      const suffix = mismatchedRows.length > 4 ? "…" : "";
      errors.push(`Rows ${shown}${suffix} have a different number of columns than the header.`);
    }
  }

  if (rows.length === 0) {
    errors.push("No card rows detected after the header row.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
