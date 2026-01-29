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

export const getColorPillClasses = (color: CommanderColor) => COLOR_IDENTITY_META[color]?.pill ?? "";
