// Shared Tailwind utility tokens for consistent button sizing and variants.
export const BUTTON_BASE =
  "inline-flex items-center font-semibold rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";

export const BUTTON_SIZES = {
  lg: "px-6 py-3 text-base",
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  xs: "px-2.5 py-1 text-xs",
};

export const BUTTON_VARIANTS = {
  primary:
    "border border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-contrast)] hover:border-[color:var(--accent-strong)] hover:brightness-105",
  secondary:
    "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]",
  tertiary: "text-[color:var(--muted)] hover:text-[color:var(--text)]",
  ghost:
    "text-[color:var(--muted)] hover:text-[color:var(--accent)] border border-transparent bg-transparent",
};
