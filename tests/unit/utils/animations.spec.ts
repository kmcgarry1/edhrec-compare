import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getStaggerDelay,
  easings,
  durations,
  applyTransition,
  createRipple,
  getRippleCoordinates,
  prefersReducedMotion,
  getAccessibleDuration,
} from "../../../src/utils/animations";

describe("animations", () => {
  describe("getStaggerDelay", () => {
    it("calculates delay based on index and base delay", () => {
      expect(getStaggerDelay(0)).toBe(0);
      expect(getStaggerDelay(1)).toBe(50);
      expect(getStaggerDelay(2)).toBe(100);
      expect(getStaggerDelay(5)).toBe(250);
    });

    it("uses custom base delay when provided", () => {
      expect(getStaggerDelay(0, 100)).toBe(0);
      expect(getStaggerDelay(1, 100)).toBe(100);
      expect(getStaggerDelay(2, 100)).toBe(200);
    });

    it("caps delay at maxDelay", () => {
      expect(getStaggerDelay(20, 50, 500)).toBe(500);
      expect(getStaggerDelay(100, 10, 200)).toBe(200);
    });

    it("uses default maxDelay of 500ms", () => {
      expect(getStaggerDelay(15)).toBe(500);
      expect(getStaggerDelay(20)).toBe(500);
    });
  });

  describe("easings", () => {
    it("exports standard Material Design easing functions", () => {
      expect(easings.standard).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
      expect(easings.decelerate).toBe("cubic-bezier(0, 0, 0.2, 1)");
      expect(easings.accelerate).toBe("cubic-bezier(0.4, 0, 1, 1)");
      expect(easings.bounce).toBe("cubic-bezier(0.68, -0.55, 0.265, 1.55)");
    });
  });

  describe("durations", () => {
    it("exports animation durations in milliseconds", () => {
      expect(durations.instant).toBe(100);
      expect(durations.quick).toBe(200);
      expect(durations.standard).toBe(300);
      expect(durations.emphasis).toBe(500);
      expect(durations.slow).toBe(600);
    });
  });

  describe("applyTransition", () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement("div");
    });

    it("applies transition and styles to element", () => {
      applyTransition(
        element,
        {
          opacity: "0.5",
          transform: "translateY(10px)",
        },
        "all 0.3s ease"
      );

      expect(element.style.transition).toBe("all 0.3s ease");
      expect(element.style.opacity).toBe("0.5");
      expect(element.style.transform).toBe("translateY(10px)");
    });

    it("applies multiple styles correctly", () => {
      applyTransition(
        element,
        {
          opacity: "0.5",
          color: "red",
        },
        "all 0.3s ease"
      );

      expect(element.style.opacity).toBe("0.5");
      expect(element.style.color).toBe("red");
    });
  });

  describe("createRipple", () => {
    it("creates ripple object with coordinates and unique id", () => {
      const ripple1 = createRipple(100, 200);
      const ripple2 = createRipple(150, 250);

      expect(ripple1).toHaveProperty("id");
      expect(ripple1).toHaveProperty("x", 100);
      expect(ripple1).toHaveProperty("y", 200);

      expect(ripple2).toHaveProperty("id");
      expect(ripple2).toHaveProperty("x", 150);
      expect(ripple2).toHaveProperty("y", 250);

      expect(ripple1.id).not.toBe(ripple2.id);
    });
  });

  describe("getRippleCoordinates", () => {
    it("calculates coordinates relative to target element", () => {
      const element = document.createElement("button");
      element.getBoundingClientRect = vi.fn(() => ({
        left: 100,
        top: 50,
        right: 200,
        bottom: 100,
        width: 100,
        height: 50,
        x: 100,
        y: 50,
        toJSON: () => ({}),
      }));

      const event = new MouseEvent("click", {
        clientX: 150,
        clientY: 75,
      });

      Object.defineProperty(event, "currentTarget", {
        value: element,
        writable: false,
      });

      const coords = getRippleCoordinates(event);

      expect(coords.x).toBe(50);
      expect(coords.y).toBe(25);
    });
  });

  describe("prefersReducedMotion", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns true when prefers-reduced-motion is set to reduce", () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      }));

      vi.stubGlobal("matchMedia", mockMatchMedia);

      expect(prefersReducedMotion()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith(
        "(prefers-reduced-motion: reduce)"
      );
    });

    it("returns false when prefers-reduced-motion is not set", () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      }));

      vi.stubGlobal("matchMedia", mockMatchMedia);

      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe("getAccessibleDuration", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("returns 1ms when user prefers reduced motion", () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      }));

      vi.stubGlobal("matchMedia", mockMatchMedia);

      expect(getAccessibleDuration(300)).toBe(1);
      expect(getAccessibleDuration(500)).toBe(1);
    });

    it("returns original duration when user does not prefer reduced motion", () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      }));

      vi.stubGlobal("matchMedia", mockMatchMedia);

      expect(getAccessibleDuration(300)).toBe(300);
      expect(getAccessibleDuration(500)).toBe(500);
    });
  });
});
