import { computed, type Ref } from "vue";
import { useLayoutDensity } from "./useLayoutDensity";

export const useScryfallCardRowStyles = (
  have: Ref<boolean>,
  isCardLoading: Ref<boolean>
) => {
  const { density } = useLayoutDensity();

  const checkboxClass =
    "h-4 w-4 rounded border-[color:var(--border)] bg-transparent text-[color:var(--accent)] focus:ring-[color:var(--accent)]";

  const cellPadding = computed(() => {
    switch (density.value) {
      case "compact":
        return "px-2.5 py-1";
      case "cozy":
        return "px-3 py-1.5";
      default:
        return "px-3 py-2";
    }
  });

  const tableCellClasses = computed(() => ({
    checkbox: `${cellPadding.value} text-center`,
    name: `${cellPadding.value} align-top text-sm font-semibold text-[color:var(--text)]`,
    mana: `${cellPadding.value}`,
    muted: `${cellPadding.value} text-sm text-[color:var(--muted)]`,
    stats: `${cellPadding.value} text-sm font-mono tabular-nums text-[color:var(--text)]`,
    badge: `${cellPadding.value}`,
    status: `${cellPadding.value}`,
    price: `${cellPadding.value} text-right`,
  }));

  const statusLabelBase =
    "inline-flex h-4 items-center text-[11px] text-[color:var(--muted)] transition-opacity duration-150";
  const statusLabelClass = computed(() => [
    statusLabelBase,
    isCardLoading.value ? "opacity-100" : "opacity-0",
  ]);

  const cardRowClass = computed(() => {
    const base =
      "flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-xs text-[color:var(--text)] transition";
    const state = have.value
      ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]"
      : "border-[color:var(--border)] bg-[color:var(--surface)]";
    const hover = have.value
      ? "hover:border-[color:var(--accent-strong)]"
      : "hover:border-[color:var(--accent)] hover:bg-[color:var(--surface-muted)]";
    return `${base} ${state} ${hover}`;
  });

  const tableRowClass = computed(() => {
    const heightClass = (() => {
      switch (density.value) {
        case "compact":
          return "h-12";
        case "cozy":
          return "h-[52px]";
        default:
          return "h-14";
      }
    })();
    const base = have.value
      ? "bg-[color:var(--accent-soft)] text-[color:var(--text)]"
      : "bg-[color:var(--surface)] text-[color:var(--text)]";
    const hover = have.value
      ? "hover:bg-[color:var(--accent-soft)]"
      : "hover:bg-[color:var(--surface-muted)]";
    return `transition-colors ${base} ${hover} ${heightClass}`;
  });

  return {
    checkboxClass,
    tableCellClasses,
    statusLabelClass,
    cardRowClass,
    tableRowClass,
  };
};
