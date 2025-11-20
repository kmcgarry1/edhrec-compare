import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SiteNotice from "../../../src/components/SiteNotice.vue";

describe("SiteNotice", () => {
  it("renders project disclaimer text", () => {
    const wrapper = mount(SiteNotice);
    expect(wrapper.text()).toMatch(/EDHREC CSV Compare is a personal portfolio/i);
    const links = wrapper.findAll("a");
    expect(links.map((link) => link.attributes("href"))).toEqual(
      expect.arrayContaining([
        "https://edhrec.com/terms-of-use",
        "https://edhrec.com/privacy",
      ])
    );
  });
});
