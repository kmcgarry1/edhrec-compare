import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

type GlobalNoticesModule = typeof import("../../../src/composables/useGlobalNotices");
let useGlobalNotices: GlobalNoticesModule["useGlobalNotices"];

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  ({ useGlobalNotices } = await vi.importActual<GlobalNoticesModule>(
    "../../../src/composables/useGlobalNotices"
  ));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGlobalNotices", () => {
  describe("notifyInfo", () => {
    it("should add an info notice with default title", () => {
      const { notices, notifyInfo } = useGlobalNotices();
      notifyInfo("Test info message");

      expect(notices.length).toBe(1);
      expect(notices[0]).toMatchObject({
        type: "info",
        title: "Notice",
        message: "Test info message",
        timeout: 6000,
      });
    });

    it("should add an info notice with custom title", () => {
      const { notices, notifyInfo } = useGlobalNotices();
      notifyInfo("Test message", "Custom Title");

      expect(notices[0].title).toBe("Custom Title");
    });
  });

  describe("notifySuccess", () => {
    it("should add a success notice with default title", () => {
      const { notices, notifySuccess } = useGlobalNotices();
      notifySuccess("Operation completed");

      expect(notices.length).toBe(1);
      expect(notices[0]).toMatchObject({
        type: "success",
        title: "Success",
        message: "Operation completed",
      });
    });

    it("should add a success notice with custom title", () => {
      const { notices, notifySuccess } = useGlobalNotices();
      notifySuccess("Done", "All Set");

      expect(notices[0].title).toBe("All Set");
    });
  });

  describe("notifyError", () => {
    it("should add an error notice with default title", () => {
      const { notices, notifyError } = useGlobalNotices();
      notifyError("Error occurred");

      expect(notices.length).toBe(1);
      expect(notices[0]).toMatchObject({
        type: "error",
        title: "Something went wrong",
        message: "Error occurred",
      });
    });

    it("should add an error notice with custom title", () => {
      const { notices, notifyError } = useGlobalNotices();
      notifyError("Failed", "Critical Error");

      expect(notices[0].title).toBe("Critical Error");
    });
  });

  describe("dismissNotice", () => {
    it("should remove a notice by id", () => {
      const { notices, notifyInfo, dismissNotice } = useGlobalNotices();
      notifyInfo("First");
      notifyInfo("Second");

      const idToRemove = notices[0].id;
      dismissNotice(idToRemove);

      expect(notices.length).toBe(1);
      expect(notices[0].message).toBe("Second");
    });

    it("should do nothing if notice id does not exist", () => {
      const { notices, notifyInfo, dismissNotice } = useGlobalNotices();
      notifyInfo("Test");

      dismissNotice(9999);

      expect(notices.length).toBe(1);
    });
  });

  describe("auto-dismiss", () => {
    it("should auto-dismiss notice after timeout", () => {
      const { notices, notifyInfo } = useGlobalNotices();
      notifyInfo("Auto dismiss");

      expect(notices.length).toBe(1);

      vi.advanceTimersByTime(6000);

      expect(notices.length).toBe(0);
    });
  });

  describe("notice ids", () => {
    it("should assign unique incrementing ids", () => {
      const { notices, notifyInfo } = useGlobalNotices();
      notifyInfo("First");
      notifyInfo("Second");
      notifyInfo("Third");

      expect(notices[0].id).toBeLessThan(notices[1].id);
      expect(notices[1].id).toBeLessThan(notices[2].id);
    });
  });

  describe("notices array", () => {
    it("should return notices proxy", () => {
      const { notices } = useGlobalNotices();
      expect(Array.isArray(notices)).toBe(true);
    });

    it("should accumulate multiple notices", () => {
      const { notices, notifyInfo, notifyError, notifySuccess } = useGlobalNotices();
      notifyInfo("Info");
      notifyError("Error");
      notifySuccess("Success");

      expect(notices.length).toBe(3);
    });
  });
});
