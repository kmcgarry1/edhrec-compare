/**
 * Animation utilities for managing micro-interactions
 * Provides helper functions for staggered animations and timing utilities
 */

/**
 * Gets the delay for staggered animations
 * @param index - The index of the element in a list
 * @param baseDelay - The base delay in milliseconds between elements (default: 50ms)
 * @param maxDelay - Maximum delay cap in milliseconds (default: 500ms)
 * @returns Delay in milliseconds
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
 * Applies element style with transition
 * @param el - HTML element to animate
 * @param styles - CSS properties to apply
 * @param transition - CSS transition string
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
 * Checks if user prefers reduced motion
 * @returns true if prefers-reduced-motion is set to reduce
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Gets animation duration respecting user preferences
 * @param duration - Desired duration in milliseconds
 * @returns Duration adjusted for reduced motion preference (1ms if reduced motion)
 */
export const getAccessibleDuration = (duration: number): number => {
  return prefersReducedMotion() ? 1 : duration;
};
