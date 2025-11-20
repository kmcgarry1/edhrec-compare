import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FloatingCardlistNav from "../../../src/components/FloatingCardlistNav.vue";

const sections = [
  { id: "ramp", label: "Ramp" },
  { id: "draw", label: "Card Draw", iconPath: "M0 0h24v24H0z" },
];

const mountComponent = () =>
  mount(FloatingCardlistNav, {
    attachTo: document.body,
    props: {
      sections,
      activeId: "ramp",
    },
  });

describe("FloatingCardlistNav", () => {
  it("renders buttons for each section", () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll("nav button");
    expect(buttons).toHaveLength(sections.length);
    expect(buttons[0]?.attributes("aria-label")).toBe("Ramp");
  });

  it("emits navigate when a section is clicked", async () => {
    const wrapper = mountComponent();
    const secondButton = wrapper.findAll("nav button")[1];
    await secondButton?.trigger("click");
    expect(wrapper.emitted("navigate")?.[0]).toEqual(["draw"]);
  });

  it("opens mobile menu when floating button is clicked", async () => {
    const wrapper = mountComponent();
    const trigger = wrapper.find(
      'button[aria-label="Open cardlist navigation"]'
    );
    await trigger.trigger("click");
    expect(document.body.textContent ?? "").toContain("Jump to cardlist");
  });
});
