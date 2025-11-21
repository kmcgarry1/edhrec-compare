export interface CsvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const normalizeHeader = (value: string) => value?.trim().toLowerCase() ?? "";

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
