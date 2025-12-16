import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import SiteNotice from "../../../src/components/SiteNotice.vue";

describe("SiteNotice", () => {
  it("renders collapsed summary and expands to show legal links", async () => {
    const wrapper = mount(SiteNotice);

    expect(wrapper.text()).toMatch(/Independent hobby project/i);
    expect(wrapper.text()).toMatch(/personal experiment, not affiliated with EDHREC/i);

    await wrapper.find("button").trigger("click");
    await nextTick();

    const links = wrapper.findAll("a");
    expect(links.map((link) => link.attributes("href"))).toEqual(
      expect.arrayContaining([
        "https://edhrec.com/terms-of-use",
        "https://edhrec.com/privacy",
      ])
    );
  });
});
