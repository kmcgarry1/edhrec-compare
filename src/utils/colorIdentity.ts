export type CommanderColor = "W" | "U" | "B" | "R" | "G" | "C";

type ColorMeta = {
  label: string;
  dot: string;
  pill: string;
};

export const COLOR_IDENTITY_META: Record<CommanderColor, ColorMeta> = {
  W: {
    label: "White",
    dot: "bg-[color:var(--mana-white)]",
    pill: "border border-[color:var(--mana-white)] bg-[color:var(--mana-white-soft)] text-[color:var(--mana-white)]",
  },
  U: {
    label: "Blue",
    dot: "bg-[color:var(--mana-blue)]",
    pill: "border border-[color:var(--mana-blue)] bg-[color:var(--mana-blue-soft)] text-[color:var(--mana-blue)]",
  },
  B: {
    label: "Black",
    dot: "bg-[color:var(--mana-black)]",
    pill: "border border-[color:var(--mana-black)] bg-[color:var(--mana-black-soft)] text-[color:var(--mana-black)]",
  },
  R: {
    label: "Red",
    dot: "bg-[color:var(--mana-red)]",
    pill: "border border-[color:var(--mana-red)] bg-[color:var(--mana-red-soft)] text-[color:var(--mana-red)]",
  },
  G: {
    label: "Green",
    dot: "bg-[color:var(--mana-green)]",
    pill: "border border-[color:var(--mana-green)] bg-[color:var(--mana-green-soft)] text-[color:var(--mana-green)]",
  },
  C: {
    label: "Colorless",
    dot: "bg-[color:var(--mana-colorless)]",
    pill: "border border-[color:var(--mana-colorless)] bg-[color:var(--mana-colorless-soft)] text-[color:var(--mana-colorless)]",
  },
};

export const COLOR_IDENTITY_ORDER: CommanderColor[] = ["W", "U", "B", "R", "G", "C"];

/**
 * Mapping from color identity strings (e.g. "WUB") to their EDHREC slug
 * (e.g. "esper"). Used for constructing EDHREC API URLs.
 */
export const COLOR_COMBO_SLUGS: Record<string, string> = {
  W: "mono-white",
  U: "mono-blue",
  B: "mono-black",
  R: "mono-red",
  G: "mono-green",
  C: "colorless",
  WU: "azorius",
  UB: "dimir",
  BR: "rakdos",
  RG: "gruul",
  WG: "selesnya",
  WB: "orzhov",
  UR: "izzet",
  BG: "golgari",
  WR: "boros",
  UG: "simic",
  WUB: "esper",
  WUR: "jeskai",
  WUG: "bant",
  WBR: "mardu",
  WBG: "abzan",
  WRG: "naya",
  UBR: "grixis",
  UBG: "sultai",
  URG: "temur",
  BRG: "jund",
  WUBR: "yore-tiller",
  UBRG: "glint-eye",
  WBRG: "dune-brood",
  WURG: "ink-treader",
  WUBG: "witch-maw",
  WUBRG: "five-color",
};

export const getColorPillClasses = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.pill ?? "";
