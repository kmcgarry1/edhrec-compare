import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ChangelogPage from "../../../src/components/ChangelogPage.vue";

const passthroughStub = {
  template: "<div><slot /></div>",
};

const buttonStub = {
  props: ["to", "href"],
  template: "<a class='button-stub' :data-to='to' :href='href'><slot /></a>",
};

describe("ChangelogPage", () => {
  it("renders the tracked release history and navigation links", () => {
    const wrapper = mount(ChangelogPage, {
      global: {
        stubs: {
          CBadge: passthroughStub,
          CButton: buttonStub,
          CInline: passthroughStub,
          CNotice: passthroughStub,
          CSurface: passthroughStub,
          CText: passthroughStub,
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.text()).toContain("What changed in Commander Scout");
    expect(wrapper.text()).toContain("Version 2.0.0");
    expect(wrapper.text()).toContain("Version 1.0.0");

    const internalLinks = wrapper.findAll(".button-stub").map((link) => link.attributes("data-to"));
    expect(internalLinks).toEqual(expect.arrayContaining(["/", "/top-commanders"]));

    const githubLink = wrapper.find("a[href='https://github.com/kmcgarry1/edhrec-compare/pull/156']");
    expect(githubLink.exists()).toBe(true);
    expect(githubLink.text()).toBe("#156");
  });
});
