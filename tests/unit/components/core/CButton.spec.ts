import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import CButton from "../../../../src/components/core/CButton.vue";

describe("CButton", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(CButton, {
      slots: {
        default: "Click me",
      },
    });

    expect(wrapper.find("button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Click me");
  });

  it("applies primary variant styles by default", () => {
    const wrapper = mount(CButton);
    const button = wrapper.find("button");

    expect(button.classes()).toContain("border-[color:var(--accent)]");
  });

  it("applies secondary variant styles when specified", () => {
    const wrapper = mount(CButton, {
      props: {
        variant: "secondary",
      },
    });
    const button = wrapper.find("button");

    expect(button.classes()).toContain("border-[color:var(--border)]");
  });

  it("applies ghost variant styles when specified", () => {
    const wrapper = mount(CButton, {
      props: {
        variant: "ghost",
      },
    });
    const button = wrapper.find("button");

    expect(button.classes()).toContain("text-[color:var(--muted)]");
  });

  it("emits click event when clicked", async () => {
    const wrapper = mount(CButton);
    const button = wrapper.find("button");

    await button.trigger("click");

    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mount(CButton, {
      props: {
        disabled: true,
      },
    });
    const button = wrapper.find("button");

    await button.trigger("click");

    expect(wrapper.emitted("click")).toBeFalsy();
  });

  it("creates ripple effect on click when rippleEffect is enabled", async () => {
    const wrapper = mount(CButton, {
      props: {
        rippleEffect: true,
      },
    });

    const button = wrapper.find("button");
    await button.trigger("click");

    // Wait a tick for the DOM to update
    await wrapper.vm.$nextTick();

    const ripples = wrapper.findAll(".ripple");
    expect(ripples.length).toBeGreaterThan(0);
  });

  it("does not create ripple effect when rippleEffect is disabled", async () => {
    const wrapper = mount(CButton, {
      props: {
        rippleEffect: false,
      },
    });

    const button = wrapper.find("button");
    await button.trigger("click");

    await wrapper.vm.$nextTick();

    const ripples = wrapper.findAll(".ripple");
    expect(ripples.length).toBe(0);
  });

  it("sets button type attribute correctly", () => {
    const wrapper = mount(CButton, {
      props: {
        type: "submit",
      },
    });

    expect(wrapper.find("button").attributes("type")).toBe("submit");
  });

  it("adds disabled attribute when disabled prop is true", () => {
    const wrapper = mount(CButton, {
      props: {
        disabled: true,
      },
    });

    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("applies overflow-hidden class for ripple containment", () => {
    const wrapper = mount(CButton);
    const button = wrapper.find("button");

    expect(button.classes()).toContain("overflow-hidden");
    expect(button.classes()).toContain("relative");
  });
});
