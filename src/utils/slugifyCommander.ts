const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019'??T]/g, "")
    .replace(/&/g, "and")
    .replace(/[\s,]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export const slugifyCommander = (value: string) => {
  if (!value) {
    return "";
  }
  return normalize(value);
};

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
