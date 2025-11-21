import { onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

/**
 * Composable to trap focus within a modal or dialog
 * @param containerRef - Reference to the container element
 * @param isActive - Ref to control when focus trap is active
 */
export const useFocusTrap = (
  containerRef: Ref<HTMLElement | null>,
  isActive: Ref<boolean>
) => {
  let previouslyFocusedElement: HTMLElement | null = null;

  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.value) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];

    const elements = containerRef.value.querySelectorAll<HTMLElement>(
      focusableSelectors.join(", ")
    );
    return Array.from(elements);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isActive.value || !containerRef.value) return;

    // Handle Escape key to close modal
    if (event.key === "Escape") {
      event.preventDefault();
      // Emit a close event - handled by parent component
      containerRef.value.dispatchEvent(
        new CustomEvent("escape-pressed", { bubbles: true })
      );
      return;
    }

    // Handle Tab key for focus trapping
    if (event.key === "Tab") {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab - moving backward
        if (document.activeElement === firstElement && lastElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab - moving forward
        if (document.activeElement === lastElement && firstElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  const activate = () => {
    if (typeof document === "undefined") return;

    // Store currently focused element to restore later
    previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus first focusable element in the modal
    requestAnimationFrame(() => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus();
      }
    });
  };

  const deactivate = () => {
    // Restore focus to previously focused element
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === "function") {
      requestAnimationFrame(() => {
        previouslyFocusedElement?.focus();
      });
    }
    previouslyFocusedElement = null;
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return {
    activate,
    deactivate,
  };
};
