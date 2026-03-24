import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import {
  CBadge,
  CFieldShell,
  CGrid,
  CInline,
  CNotice,
  CProgress,
  CStack,
  CSurface,
} from "../../../../src/components/core";

describe("core primitives", () => {
  it("renders layout primitives with semantic elements and gap classes", () => {
    const stack = mount(CStack, {
      props: { as: "section", gap: "lg" },
      slots: { default: "<p>Stack</p>" },
    });
    const inline = mount(CInline, {
      props: { justify: "between", wrap: "nowrap" },
      slots: { default: "<span>Inline</span>" },
    });
    const grid = mount(CGrid, {
      props: { variant: "cards" },
      slots: { default: "<div>Card</div>" },
    });

    expect(stack.element.tagName).toBe("SECTION");
    expect(stack.classes()).toContain("gap-4");
    expect(inline.classes()).toContain("justify-between");
    expect(inline.classes()).toContain("flex-nowrap");
    expect(grid.classes()).toContain("sm:grid-cols-2");
  });

  it("renders surface and badge variants", () => {
    const surface = mount(CSurface, {
      props: { as: "article", variant: "accent", tone: "accent", size: "sm" },
    });
    const badge = mount(CBadge, {
      props: { tone: "warn", variant: "soft" },
      slots: { default: "Warn" },
    });

    expect(surface.element.tagName).toBe("ARTICLE");
    expect(surface.classes()).toContain("bg-[color:var(--accent-soft)]");
    expect(surface.classes()).toContain("p-3");
    expect(badge.classes()).toContain("bg-[color:var(--warn-soft)]");
    expect(badge.text()).toContain("Warn");
  });

  it("renders progress and notice state", async () => {
    const progress = mount(CProgress, {
      props: {
        current: 2,
        total: 5,
        showValue: true,
      },
    });
    const notice = mount(CNotice, {
      props: {
        title: "Heads up",
        message: "Something changed",
        dismissible: true,
        progress: { current: 1, total: 4 },
      },
    });

    expect(progress.text()).toContain("2 / 5");
    expect(progress.find("[role='progressbar']").attributes("aria-valuenow")).toBe("40");
    expect(notice.text()).toContain("Heads up");
    expect(notice.text()).toContain("Something changed");
    expect(notice.find("[role='progressbar']").exists()).toBe(true);

    await notice.find("button").trigger("click");
    expect(notice.emitted("dismiss")).toBeTruthy();
  });

  it("renders field shell label, helper, and error text", () => {
    const wrapper = mount(CFieldShell, {
      props: {
        label: "Commander",
        helper: "Choose a card",
        error: "Required field",
        labelFor: "commander-input",
      },
      slots: {
        default: "<input id='commander-input' />",
      },
    });

    expect(wrapper.text()).toContain("Commander");
    expect(wrapper.text()).toContain("Choose a card");
    expect(wrapper.text()).toContain("Required field");
    expect(wrapper.find("label").attributes("for")).toBe("commander-input");
  });
});
