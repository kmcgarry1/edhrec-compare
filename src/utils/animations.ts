/**
 * Animation utilities for managing micro-interactions
 *
 * Provides helper functions for staggered animations, timing utilities,
 * ripple effects, and accessibility-aware animation durations.
 *
 * @module utils/animations
 *
 * @example
 * ```typescript
 * import { getStaggerDelay, durations, easings } from '@/utils/animations';
 *
 * // Apply staggered animation to list items
 * items.forEach((item, index) => {
 *   item.style.animationDelay = `${getStaggerDelay(index)}ms`;
 * });
 *
 * // Use predefined easing and duration
 * element.style.transition = `all ${durations.standard}ms ${easings.standard}`;
 * ```
 */

/**
 * Calculate delay for staggered animations
 *
 * Useful for animating lists where each item should appear slightly
 * after the previous one.
 *
 * @param index - The index of the element in a list
 * @param baseDelay - The base delay in milliseconds between elements (default: 50ms)
 * @param maxDelay - Maximum delay cap in milliseconds (default: 500ms)
 * @returns Delay in milliseconds
 *
 * @example
 * ```typescript
 * // Stagger card animations
 * cards.forEach((card, i) => {
 *   setTimeout(() => card.animate(), getStaggerDelay(i));
 * });
 * ```
 */
export const getStaggerDelay = (
  index: number,
  baseDelay = 50,
  maxDelay = 500
): number => {
  const delay = index * baseDelay;
  return Math.min(delay, maxDelay);
};

/**
 * CSS easing functions following Material Design principles
 */
export const easings = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)", // Enter
  accelerate: "cubic-bezier(0.4, 0, 1, 1)", // Exit
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

/**
 * Animation durations in milliseconds
 */
export const durations = {
  instant: 100,
  quick: 200,
  standard: 300,
  emphasis: 500,
  slow: 600,
} as const;

/**
 * Apply CSS styles with transition
 *
 * @param el - HTML element to animate
 * @param styles - CSS properties to apply
 * @param transition - CSS transition string
 *
 * @example
 * ```typescript
 * applyTransition(
 *   element,
 *   { opacity: '0', transform: 'translateY(20px)' },
 *   `all ${durations.standard}ms ${easings.decelerate}`
 * );
 * ```
 */
export const applyTransition = (
  el: HTMLElement,
  styles: Record<string, string>,
  transition: string
): void => {
  el.style.transition = transition;
  Object.entries(styles).forEach(([key, value]) => {
    if (value !== undefined) {
      (el.style as unknown as Record<string, string>)[key] = value;
    }
  });
};

/**
 * Creates a ripple effect object for button clicks
 * @param x - X coordinate relative to element
 * @param y - Y coordinate relative to element
 * @returns Ripple object with id, x, and y coordinates
 */
export const createRipple = (
  x: number,
  y: number
): { id: number; x: number; y: number } => {
  return {
    id: Date.now() + Math.random(),
    x,
    y,
  };
};

/**
 * Gets ripple coordinates from click event
 * @param event - Mouse event
 * @returns Object with x and y coordinates relative to target element
 */
export const getRippleCoordinates = (
  event: MouseEvent
): { x: number; y: number } => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

/**
 * Check if user prefers reduced motion
 *
 * Respects the `prefers-reduced-motion` media query for accessibility.
 *
 * @returns true if prefers-reduced-motion is set to reduce
 *
 * @example
 * ```typescript
 * if (!prefersReducedMotion()) {
 *   element.classList.add('animated');
 * }
 * ```
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get animation duration respecting user preferences
 *
 * Returns 1ms if user prefers reduced motion, otherwise returns
 * the requested duration.
 *
 * @param duration - Desired duration in milliseconds
 * @returns Duration adjusted for reduced motion preference (1ms if reduced motion)
 *
 * @example
 * ```typescript
 * const duration = getAccessibleDuration(durations.standard);
 * element.style.transitionDuration = `${duration}ms`;
 * ```
 */
export const getAccessibleDuration = (duration: number): number => {
  return prefersReducedMotion() ? 1 : duration;
};
