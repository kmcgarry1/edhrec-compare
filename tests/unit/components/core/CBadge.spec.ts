import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CBadge from "../../../../src/components/core/CBadge.vue";

describe("CBadge", () => {
  it("renders with the default semantic element and label styling", () => {
    const wrapper = mount(CBadge, {
      slots: {
        default: "Default badge",
      },
    });

    expect(wrapper.element.tagName).toBe("SPAN");
    expect(wrapper.classes()).toContain("uppercase");
    expect(wrapper.classes()).toContain("tracking-[0.18em]");
    expect(wrapper.classes()).toContain("bg-[color:var(--surface-muted)]");
    expect(wrapper.text()).toContain("Default badge");
  });

  it("supports readable text chips through textCase", () => {
    const wrapper = mount(CBadge, {
      props: {
        textCase: "normal",
        tone: "accent",
        variant: "soft",
      },
      slots: {
        default: "CSV pending",
      },
    });

    expect(wrapper.classes()).toContain("normal-case");
    expect(wrapper.classes()).toContain("tracking-[0.08em]");
    expect(wrapper.classes()).toContain("bg-[color:var(--accent-soft)]");
    expect(wrapper.classes()).not.toContain("uppercase");
  });

  it("renders alternate elements and solid treatments", () => {
    const wrapper = mount(CBadge, {
      props: {
        as: "strong",
        variant: "solid",
        tone: "danger",
        size: "sm",
      },
      slots: {
        default: "Danger",
      },
    });

    expect(wrapper.element.tagName).toBe("STRONG");
    expect(wrapper.classes()).toContain("text-[10px]");
    expect(wrapper.classes()).toContain("bg-[color:var(--danger)]");
    expect(wrapper.classes()).toContain("text-[color:var(--accent-contrast)]");
  });
});
