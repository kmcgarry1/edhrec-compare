import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Card from "../../../src/components/Card.vue";

describe("Card", () => {
  it("renders title, subtitle, and default slot content", () => {
    const wrapper = mount(Card, {
      props: {
        title: "Commander Toolkit",
        subtitle: "Upload your CSV",
        as: "section",
      },
      slots: {
        default: "<p>Body content</p>",
      },
    });

    expect(wrapper.element.tagName).toBe("SECTION");
    expect(wrapper.text()).toContain("Commander Toolkit");
    expect(wrapper.text()).toContain("Upload your CSV");
    expect(wrapper.text()).toContain("Body content");
  });

  it("renders footer slot content", () => {
    const wrapper = mount(Card, {
      slots: {
        default: "<p>Body</p>",
        footer: "<div class='footer-slot'>Footer content</div>",
      },
    });

    const footer = wrapper.find("footer");
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain("Footer content");
  });

  it("forwards surface variants to the root surface", () => {
    const wrapper = mount(Card, {
      props: {
        variant: "command",
      },
      slots: {
        default: "<p>Command deck</p>",
      },
    });

    expect(wrapper.classes()).toContain("surface-role-command");
  });
});
