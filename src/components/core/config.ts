export type Gap = "none" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type Align = "start" | "center" | "end" | "stretch" | "baseline";
export type Justify = "start" | "center" | "end" | "between";
export type Wrap = "wrap" | "nowrap";

export type TextVariant =
  | "body"
  | "label"
  | "helper"
  | "caption"
  | "title"
  | "overline"
  | "eyebrow"
  | "display";

export type TextTone =
  | "default"
  | "muted"
  | "subtle"
  | "inverse"
  | "danger"
  | "success"
  | "warn"
  | "inherit";

export type SurfaceVariant =
  | "panel"
  | "strong"
  | "muted"
  | "accent"
  | "ghost"
  | "dashed";

export type SurfaceTone =
  | "default"
  | "accent"
  | "success"
  | "warn"
  | "danger";

export type SurfaceSize = "none" | "sm" | "md" | "lg" | "adaptive";
export type SurfaceRadius = "lg" | "xl" | "2xl" | "3xl" | "pill";
export type SurfaceShadow = "none" | "soft" | "base";

export type BadgeVariant = "soft" | "solid" | "outline";
export type BadgeTone =
  | "default"
  | "accent"
  | "success"
  | "warn"
  | "danger"
  | "muted";
export type BadgeSize = "sm" | "md";

export type ProgressTone = "accent" | "success" | "warn" | "danger" | "muted";
export type ProgressSize = "sm" | "md";

export const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export const gapClasses: Record<Gap, string> = {
  none: "gap-0",
  "2xs": "gap-1",
  xs: "gap-1.5",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-5",
  "2xl": "gap-6",
};

export const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export const wrapClasses: Record<Wrap, string> = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
};

export const textVariantClasses: Record<TextVariant, string> = {
  body: "text-sm",
  helper: "text-xs",
  label: "text-xs font-semibold uppercase tracking-wide",
  caption: "text-[11px]",
  title: "text-base font-semibold",
  overline: "text-[10px] font-semibold uppercase tracking-[0.2em]",
  eyebrow: "text-xs font-semibold uppercase tracking-[0.28em]",
  display: "text-3xl font-semibold sm:text-4xl",
};

export const textToneClasses: Record<TextTone, string> = {
  default: "text-[color:var(--text)]",
  muted: "text-[color:var(--muted)]",
  subtle: "text-[color:var(--muted)] opacity-70",
  inverse: "text-white",
  danger: "text-[color:var(--danger)]",
  success: "text-[color:var(--accent)]",
  warn: "text-[color:var(--warn)]",
  inherit: "",
};

export const textWeightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
} as const;

export const textAlignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
} as const;

export const textWrapClasses = {
  normal: "whitespace-normal",
  break: "break-words",
  nowrap: "whitespace-nowrap",
  truncate: "truncate",
} as const;

export const textLeadingClasses = {
  none: "leading-none",
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
} as const;

export const buttonBase =
  "inline-flex items-center justify-center rounded-full font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";

export const buttonSizeClasses = {
  sm: "gap-1 px-3 py-1 text-xs",
  md: "gap-1.5 px-4 py-2 text-sm",
  lg: "gap-2 px-5 py-2.5 text-sm",
} as const;

export const buttonVariantClasses = {
  primary:
    "border border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] hover:border-[color:var(--accent-strong)] hover:brightness-105",
  secondary:
    "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text)] shadow-[var(--shadow-soft)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
  ghost:
    "border border-transparent bg-transparent text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text)]",
  soft:
    "border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text)] shadow-[var(--shadow-soft)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
} as const;

export const buttonToneClasses = {
  default: "",
  accent: "!border-[color:var(--accent)] !text-[color:var(--accent)]",
  warn: "!border-[color:var(--warn)] !text-[color:var(--warn)]",
  danger: "!border-[color:var(--danger)] !text-[color:var(--danger)]",
} as const;

export const surfaceBase = "c-surface relative";

export const surfaceVariantClasses: Record<SurfaceVariant, string> = {
  panel: "border bg-[color:var(--surface)]",
  strong: "border bg-[color:var(--surface-strong)]",
  muted: "border bg-[color:var(--surface-muted)]",
  accent: "border bg-[color:var(--accent-soft)]",
  ghost: "border border-transparent bg-transparent shadow-none",
  dashed: "border-2 border-dashed bg-[color:var(--surface)]",
};

export const surfaceToneClasses: Record<SurfaceTone, string> = {
  default: "border-[color:var(--border)] text-[color:var(--text)]",
  accent: "border-[color:var(--accent)] text-[color:var(--text)]",
  success: "border-[color:var(--accent)] text-[color:var(--text)]",
  warn: "border-[color:var(--warn)] text-[color:var(--warn)]",
  danger: "border-[color:var(--danger)] text-[color:var(--danger)]",
};

export const surfaceRadiusClasses: Record<SurfaceRadius, string> = {
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-[28px]",
  "3xl": "rounded-[32px]",
  pill: "rounded-full",
};

export const surfaceShadowClasses: Record<SurfaceShadow, string> = {
  none: "",
  soft: "shadow-[var(--shadow-soft)]",
  base: "shadow-[var(--shadow)]",
};

export const surfacePaddingClasses: Record<Exclude<SurfaceSize, "adaptive">, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-7",
};

export const badgeBase =
  "inline-flex items-center rounded-full font-semibold tracking-[0.18em] uppercase";

export const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: "px-2.5 py-1 text-[10px]",
  md: "px-3 py-1.5 text-[11px]",
};

export const badgeVariantClasses: Record<BadgeVariant, string> = {
  soft: "border",
  solid: "border",
  outline: "border bg-transparent",
};

export const badgeToneClasses: Record<BadgeTone, Record<BadgeVariant, string>> = {
  default: {
    soft: "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text)]",
    solid:
      "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text)]",
    outline: "border-[color:var(--border)] text-[color:var(--muted)]",
  },
  accent: {
    soft: "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]",
    solid:
      "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-contrast)]",
    outline: "border-[color:var(--accent)] text-[color:var(--accent)]",
  },
  success: {
    soft: "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)]",
    solid:
      "border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-contrast)]",
    outline: "border-[color:var(--accent)] text-[color:var(--accent)]",
  },
  warn: {
    soft: "border-[color:var(--warn)] bg-[color:var(--warn-soft)] text-[color:var(--warn)]",
    solid: "border-[color:var(--warn)] bg-[color:var(--warn)] text-[color:var(--accent-contrast)]",
    outline: "border-[color:var(--warn)] text-[color:var(--warn)]",
  },
  danger: {
    soft:
      "border-[color:var(--danger)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]",
    solid:
      "border-[color:var(--danger)] bg-[color:var(--danger)] text-[color:var(--accent-contrast)]",
    outline: "border-[color:var(--danger)] text-[color:var(--danger)]",
  },
  muted: {
    soft: "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--muted)]",
    solid:
      "border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--muted)]",
    outline: "border-[color:var(--border)] text-[color:var(--muted)]",
  },
};

export const progressTrackClasses: Record<ProgressSize, string> = {
  sm: "h-1",
  md: "h-2",
};

export const progressFillClasses: Record<ProgressTone, string> = {
  accent: "bg-[color:var(--accent)]",
  success: "bg-[color:var(--accent)]",
  warn: "bg-[color:var(--warn)]",
  danger: "bg-[color:var(--danger)]",
  muted: "bg-[color:var(--muted)]",
};
