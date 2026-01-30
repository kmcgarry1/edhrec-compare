/**
 * Card name normalization helpers
 *
 * Shared utilities for matching card names across CSV uploads and EDHREC data.
 */

/**
 * Normalize card names for comparison
 *
 * - trims whitespace
 * - collapses repeated spaces
 * - lowercases for case-insensitive matching
 */
export const normalizeCardName = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Generate name variants for split/double-faced cards.
 *
 * Example: "Delver of Secrets // Insectile Aberration"
 * returns ["delver of secrets // insectile aberration", "delver of secrets", "insectile aberration"]
 */
export const cardNameVariants = (value: string) => {
  if (!value) {
    return [] as string[];
  }
  const variants = new Set<string>();
  const normalizedFull = normalizeCardName(value);
  if (normalizedFull) {
    variants.add(normalizedFull);
  }

  value
    .split("//")
    .map((part) => normalizeCardName(part))
    .filter((part) => part.length > 0)
    .forEach((part) => variants.add(part));

  return Array.from(variants);
};

/**
 * Find the most likely "Name" column index from CSV headers.
 */
export const getNameColumnIndex = (headers: string[]) => {
  if (!headers?.length) {
    return 0;
  }
  const normalized = headers.map((header) => header.trim().toLowerCase());
  const exactMatch = normalized.findIndex((header) => header === "name");
  if (exactMatch >= 0) {
    return exactMatch;
  }
  const containsMatch = normalized.findIndex((header) => header.includes("name"));
  return containsMatch >= 0 ? containsMatch : 0;
};

/**
 * Build a set of normalized card name variants from CSV rows.
 */
export const buildCardNameSet = (rows: string[][], nameIndex: number) => {
  const set = new Set<string>();
  rows.forEach((row) => {
    const raw = row[nameIndex] ?? row[0] ?? "";
    cardNameVariants(raw).forEach((variant) => {
      if (variant.length > 0) {
        set.add(variant);
      }
    });
  });
  return set;
};
