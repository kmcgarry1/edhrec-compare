/**
 * Commander name normalization utilities
 *
 * Converts commander names to URL-safe slugs for use with the EDHREC API.
 * Handles special characters, punctuation, and partner commanders.
 *
 * @module utils/slugifyCommander
 *
 * @example
 * ```typescript
 * import { slugifyCommander, buildCommanderSlug } from '@/utils/slugifyCommander';
 *
 * // Single commander
 * slugifyCommander('Atraxa, Praetors\' Voice'); // "atraxa-praetors-voice"
 *
 * // Partner commanders
 * buildCommanderSlug('Thrasios', 'Tymna'); // "thrasios-tymna"
 * ```
 */

/**
 * Normalize a commander name to URL-safe slug format
 *
 * @param value - Commander name to normalize
 * @returns URL-safe slug (lowercase, hyphens, no special chars)
 */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019'??T]/g, "")
    .replace(/&/g, "and")
    .replace(/[\s,]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Convert commander name to EDHREC-compatible slug
 *
 * @param value - Commander name
 * @returns Normalized slug string
 *
 * @example
 * ```typescript
 * slugifyCommander('Atraxa, Praetors\' Voice');
 * // Returns: "atraxa-praetors-voice"
 *
 * slugifyCommander('Lathril, Blade of the Elves');
 * // Returns: "lathril-blade-of-the-elves"
 * ```
 */
export const slugifyCommander = (value: string) => {
  if (!value) {
    return "";
  }
  return normalize(value);
};

/**
 * Build EDHREC URL slug for single or partner commanders
 *
 * For partner commanders, slugs are sorted alphabetically and joined
 * with a hyphen to match EDHREC's URL structure.
 *
 * @param primaryName - Primary commander name
 * @param partnerName - Optional partner commander name
 * @returns Combined slug for EDHREC URL
 *
 * @example
 * ```typescript
 * // Single commander
 * buildCommanderSlug('Atraxa, Praetors\' Voice');
 * // Returns: "atraxa-praetors-voice"
 *
 * // Partner commanders (automatically sorted)
 * buildCommanderSlug('Thrasios, Triton Hero', 'Tymna the Weaver');
 * // Returns: "thrasios-triton-hero-tymna-the-weaver"
 *
 * // Order doesn't matter - always sorted
 * buildCommanderSlug('Tymna the Weaver', 'Thrasios, Triton Hero');
 * // Returns: "thrasios-triton-hero-tymna-the-weaver" (same result)
 * ```
 */
export const buildCommanderSlug = (
  primaryName: string,
  partnerName?: string | null
) => {
  const primary = slugifyCommander(primaryName);
  if (!primary) {
    return "";
  }

  if (!partnerName) {
    return primary;
  }

  const partner = slugifyCommander(partnerName);
  if (!partner) {
    return primary;
  }

  return [primary, partner].sort((a, b) => a.localeCompare(b)).join("-");
};
