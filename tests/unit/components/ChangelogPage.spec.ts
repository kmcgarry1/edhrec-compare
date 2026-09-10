import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ChangelogPage from "../../../src/components/ChangelogPage.vue";

const passthroughStub = {
  template: "<div><slot /></div>",
};

describe("ChangelogPage", () => {
  it("renders a compact release history with the latest release expanded", () => {
    const wrapper = mount(ChangelogPage, {
      global: {
        stubs: {
          CNotice: passthroughStub,
          CText: passthroughStub,
        },
      },
    });

    expect(wrapper.text()).toContain("Release Notes");
    expect(wrapper.text()).toContain("Version 2.0.0");
    expect(wrapper.text()).toContain("Version 1.0.0");

    const releases = wrapper.findAll("details");
    expect(releases.length).toBeGreaterThan(1);
    expect(releases[0]?.attributes("open")).toBe("");
    expect(releases[1]?.attributes("open")).toBeUndefined();

    const githubLink = wrapper.find("a[href='https://github.com/kmcgarry1/edhrec-compare/pull/156']");
    expect(githubLink.exists()).toBe(true);
    expect(githubLink.text()).toBe("#156");
  });
});
