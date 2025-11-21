import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, type PropType } from "vue";
import CommanderFilters from "../../../src/components/CommanderFilters.vue";
import {
  EDHRECBracket,
  EDHRECCompanion,
  EDHRECPageModifier,
  EDHRECPageType,
} from "../../../src/components/helpers/enums";

type Option = {
  value: string | number;
  label: string;
};

const baseProps = {
  bracket: EDHRECBracket.ALL.value,
  modifier: EDHRECPageModifier.ANY.value,
  pageType: EDHRECPageType.COMMANDER.value,
  companion: EDHRECCompanion.NONE.value,
};

const createDropdownStub = (collector?: Option[][]) =>
  defineComponent({
    name: "DropdownSelectStub",
    props: {
      options: {
        type: Array as PropType<Option[]>,
        required: true,
      },
      modelValue: [String, Number],
    },
    emits: ["update:modelValue"],
    setup(props, { emit }) {
      collector?.push(props.options);
      return () =>
        h(
          "select",
          {
            class: "dropdown-stub",
            onChange: (event: Event) => {
              const target = event.target as HTMLSelectElement;
              emit("update:modelValue", target.value);
            },
          },
          props.options.map((option) =>
            h("option", { value: option.value }, option.label)
          )
        );
    },
  });

describe("CommanderFilters", () => {
  it("passes the EDHREC option groups to each dropdown", () => {
    const optionSets: Option[][] = [];
    const DropdownSelectStub = createDropdownStub(optionSets);

    mount(CommanderFilters, {
      props: baseProps,
      global: {
        stubs: {
          DropdownSelect: DropdownSelectStub,
        },
      },
    });

    expect(optionSets).toHaveLength(4);
    expect(optionSets[0].map((option) => option.value)).toEqual(
      Object.values(EDHRECBracket).map((option) => option.value)
    );
    expect(optionSets[1].map((option) => option.value)).toEqual(
      Object.values(EDHRECPageModifier).map((option) => option.value)
    );
    expect(optionSets[2].map((option) => option.value)).toEqual(
      Object.values(EDHRECPageType).map((option) => option.value)
    );
    expect(optionSets[3].map((option) => option.value)).toEqual(
      Object.values(EDHRECCompanion).map((option) => option.value)
    );
  });

  it("emits updates when each dropdown changes", async () => {
    const DropdownSelectStub = createDropdownStub();
    const wrapper = mount(CommanderFilters, {
      props: baseProps,
      global: {
        stubs: {
          DropdownSelect: DropdownSelectStub,
        },
      },
    });

    const selects = wrapper.findAll("select.dropdown-stub");
    await selects[0].setValue("optimized");
    await selects[1].setValue("budget");
    await selects[2].setValue("average-decks");
    await selects[3].setValue("jegantha-companion");

    expect(wrapper.emitted("update:bracket")?.[0]).toEqual(["optimized"]);
    expect(wrapper.emitted("update:modifier")?.[0]).toEqual(["budget"]);
    expect(wrapper.emitted("update:pageType")?.[0]).toEqual(["average-decks"]);
    expect(wrapper.emitted("update:companion")?.[0]).toEqual([
      "jegantha-companion",
    ]);
  });

  it("casts numeric dropdown payloads to strings", async () => {
    const DropdownSelectStub = createDropdownStub();
    const wrapper = mount(CommanderFilters, {
      props: baseProps,
      global: {
        stubs: {
          DropdownSelect: DropdownSelectStub,
        },
      },
    });

    const dropdowns = wrapper.findAllComponents(DropdownSelectStub);
    dropdowns[0].vm.$emit("update:modelValue", 123);
    await nextTick();

    expect(wrapper.emitted("update:bracket")?.pop()).toEqual(["123"]);
  });
});
