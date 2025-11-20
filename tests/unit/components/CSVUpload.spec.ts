import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import CSVUpload from "../../../src/components/CSVUpload.vue";

const mockFileContents = new WeakMap<File, string>();
const pendingFileReads: Array<{ reader: MockFileReader; text: string }> = [];

class MockFileReader {
  public result: string | ArrayBuffer | null = null;
  public onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  public onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsText(file: File) {
    const text = mockFileContents.get(file) ?? "";
    pendingFileReads.push({ reader: this, text });
  }

  emitLoad(text: string) {
    this.result = text;
    this.onload?.({
      target: { result: text },
    } as ProgressEvent<FileReader>);
  }
}

const createMockFile = (content: string, name: string, type: string) => {
  const file = new File([content], name, { type });
  mockFileContents.set(file, content);
  return file;
};

const completePendingFileRead = () => {
  const pending = pendingFileReads.shift();
  if (pending) {
    pending.reader.emitLoad(pending.text);
  }
};

describe("CSVUpload", () => {
  let wrapper: ReturnType<typeof mount> | null = null;

  beforeAll(() => {
    vi.stubGlobal("FileReader", MockFileReader);
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    pendingFileReads.length = 0;
    wrapper?.unmount();
    wrapper = null;
  });

  beforeEach(() => {
    wrapper = mount(CSVUpload);
  });

  it("renders correctly", () => {
    expect(wrapper.exists()).toBe(true);
  });

  it("displays file input element", () => {
    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.exists()).toBe(true);
  });

  it("accepts CSV files only", () => {
    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.attributes("accept")).toBe(".csv");
  });

  it("emits file-uploaded event when valid CSV is selected", async () => {
    const file = createMockFile(
      "name,power\nLightning Bolt,3",
      "test.csv",
      "text/csv"
    );
    const fileInput = wrapper.find('input[type="file"]');

    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    completePendingFileRead();
    await flushPromises();
    expect(wrapper.emitted("file-uploaded")).toBeTruthy();
  });

  it("shows error message for invalid file type", async () => {
    const file = createMockFile("content", "test.txt", "text/plain");
    const fileInput = wrapper.find('input[type="file"]');

    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    expect(wrapper.text()).toContain("Please select a valid CSV file");
  });

  it("shows upload progress when processing file", async () => {
    const file = createMockFile(
      "name,power\nLightning Bolt,3",
      "test.csv",
      "text/csv"
    );
    const fileInput = wrapper.find('input[type="file"]');

    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    await flushPromises();
    expect(wrapper.find(".upload-progress").exists()).toBe(true);
    completePendingFileRead();
    await flushPromises();
  });
});
