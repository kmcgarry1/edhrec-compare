import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, ref, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { useEdhrecCardlists } from "../../../src/composables/useEdhrecCardlists";
import type { EdhrecCardlist } from "../../../src/types/edhrec";

const uploadedRows = ref<string[][]>([]);
const uploadedHeaders = ref<string[]>([]);
const showOwned = ref<boolean | null>(null);

vi.mock("../../../src/composables/useCsvUpload", () => ({
  useCsvUpload: () => ({
    rows: uploadedRows,
    headers: uploadedHeaders,
  }),
}));

vi.mock("../../../src/composables/useOwnedFilter", () => ({
  useOwnedFilter: () => ({
    showOwned,
  }),
}));

vi.mock("../../../src/utils/downloadTextFile", () => ({
  downloadTextFile: vi.fn(),
}));

vi.mock("../../../src/utils/errorHandler", () => ({
  handleError: vi.fn(),
}));

type ResizeObserverInstance = {
  callback: ResizeObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

const resizeObserverInstances: ResizeObserverInstance[] = [];
let frameQueue: FrameRequestCallback[] = [];

class MockResizeObserver {
  callback: ResizeObserverCallback;
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    resizeObserverInstances.push(this);
  }
}

const createCardlist = (header: string): EdhrecCardlist => ({
  header,
  tag: header.toLowerCase(),
  cardviews: [{ id: `${header.toLowerCase()}-1`, name: `${header} Card` }],
});

const setScrollY = (value: number) => {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value,
  });
};

const createSectionElement = (
  id: string,
  getTop: () => number,
  getRectSpy?: ReturnType<typeof vi.fn>
) => {
  const element = document.createElement("article");
  element.id = id;
  Object.defineProperty(element, "offsetTop", {
    configurable: true,
    get() {
      throw new Error("offsetTop should not be used for scroll tracking");
    },
  });
  element.getBoundingClientRect = (getRectSpy ??
    vi.fn(() => ({
      top: getTop() - window.scrollY,
      left: 0,
      right: 0,
      bottom: getTop() - window.scrollY + 200,
      width: 100,
      height: 200,
      x: 0,
      y: getTop() - window.scrollY,
      toJSON: () => ({}),
    }))) as typeof element.getBoundingClientRect;
  document.body.appendChild(element);
  return element;
};

const mountComposable = (cardlists: Ref<EdhrecCardlist[]>) => {
  const Host = defineComponent({
    setup(_, { expose }) {
      const api = useEdhrecCardlists(cardlists);
      expose(api);
      return () => h("div");
    },
  });

  return mount(Host);
};

const flushAnimationFrames = async () => {
  while (frameQueue.length) {
    const callbacks = [...frameQueue];
    frameQueue = [];
    callbacks.forEach((callback) => callback(0));
    await nextTick();
  }
};

describe("useEdhrecCardlists", () => {
  const originalResizeObserver = global.ResizeObserver;
  const originalWindowResizeObserver = window.ResizeObserver;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  beforeEach(() => {
    uploadedRows.value = [];
    uploadedHeaders.value = [];
    showOwned.value = null;
    resizeObserverInstances.length = 0;
    frameQueue = [];
    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frameQueue.push(callback);
      return frameQueue.length;
    }) as typeof window.requestAnimationFrame;
    window.cancelAnimationFrame = vi.fn() as typeof window.cancelAnimationFrame;
    setScrollY(0);
  });

  afterEach(() => {
    global.ResizeObserver = originalResizeObserver;
    window.ResizeObserver = originalWindowResizeObserver;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("updates the active section from cached positions without DOM reads on scroll", async () => {
    const cardlists = ref([createCardlist("Creatures"), createCardlist("Spells")]);
    let creaturesTop = 0;
    let spellsTop = 700;

    const creaturesRect = vi.fn(() => ({
      top: creaturesTop - window.scrollY,
      left: 0,
      right: 0,
      bottom: creaturesTop - window.scrollY + 200,
      width: 100,
      height: 200,
      x: 0,
      y: creaturesTop - window.scrollY,
      toJSON: () => ({}),
    }));
    const spellsRect = vi.fn(() => ({
      top: spellsTop - window.scrollY,
      left: 0,
      right: 0,
      bottom: spellsTop - window.scrollY + 200,
      width: 100,
      height: 200,
      x: 0,
      y: spellsTop - window.scrollY,
      toJSON: () => ({}),
    }));

    createSectionElement("creatures", () => creaturesTop, creaturesRect);
    createSectionElement("spells", () => spellsTop, spellsRect);

    const wrapper = mountComposable(cardlists);
    await nextTick();
    await flushAnimationFrames();

    expect((wrapper.vm as { activeSectionId: string }).activeSectionId).toBe("creatures");
    expect(creaturesRect).toHaveBeenCalled();
    expect(spellsRect).toHaveBeenCalled();

    creaturesRect.mockClear();
    spellsRect.mockClear();

    setScrollY(620);
    window.dispatchEvent(new Event("scroll"));
    await nextTick();
    await flushAnimationFrames();

    expect((wrapper.vm as { activeSectionId: string }).activeSectionId).toBe("spells");
    expect(creaturesRect).not.toHaveBeenCalled();
    expect(spellsRect).not.toHaveBeenCalled();
  });

  it("recomputes cached section positions when observed section sizes change", async () => {
    const cardlists = ref([createCardlist("Creatures"), createCardlist("Spells")]);
    let creaturesTop = 0;
    let spellsTop = 900;

    createSectionElement("creatures", () => creaturesTop);
    createSectionElement("spells", () => spellsTop);

    const wrapper = mountComposable(cardlists);
    await nextTick();
    await flushAnimationFrames();

    setScrollY(560);
    window.dispatchEvent(new Event("scroll"));
    await nextTick();
    await flushAnimationFrames();
    expect((wrapper.vm as { activeSectionId: string }).activeSectionId).toBe("creatures");

    spellsTop = 640;
    resizeObserverInstances[0]?.callback([], {} as ResizeObserver);
    window.dispatchEvent(new Event("resize"));
    await nextTick();
    await flushAnimationFrames();

    expect((wrapper.vm as { activeSectionId: string }).activeSectionId).toBe("spells");
  });
});
