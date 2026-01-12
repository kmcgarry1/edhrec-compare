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

const notifyError = vi.hoisted(() => vi.fn());
const notifySuccess = vi.hoisted(() => vi.fn());
const handleError = vi.hoisted(() => vi.fn());

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notifyError,
    notifySuccess,
  }),
}));

vi.mock("../../../src/utils/errorHandler", () => ({
  handleError,
}));

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

  emitError() {
    this.onerror?.({} as ProgressEvent<FileReader>);
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

const failPendingFileRead = () => {
  const pending = pendingFileReads.shift();
  if (pending) {
    pending.reader.emitError();
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
    notifyError.mockClear();
    notifySuccess.mockClear();
    handleError.mockClear();
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

  it("shows validation summary for a valid CSV", async () => {
    const file = createMockFile(
      "Name,Quantity\n\"Sol Ring\",1",
      "valid.csv",
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

    expect(wrapper.text()).toContain("Valid CSV");
    expect(wrapper.text()).toContain("Found 1 card");
    expect(notifySuccess).toHaveBeenCalledWith("Found 1 card");
  });

  it("shows warnings when CSV headers are missing name", async () => {
    const file = createMockFile("Title,Quantity\nSol Ring,1", "warn.csv", "text/csv");
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    completePendingFileRead();
    await flushPromises();

    expect(wrapper.text()).toContain('No "Name" column found.');
  });

  it("shows errors when CSV structure is invalid", async () => {
    const file = createMockFile("Name,Quantity\nSol Ring", "bad.csv", "text/csv");
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    completePendingFileRead();
    await flushPromises();

    expect(wrapper.text()).toContain("We couldn't process that CSV");
    expect(notifyError).toHaveBeenCalled();
  });

  it("handles empty CSV content", async () => {
    const file = createMockFile("", "empty.csv", "text/csv");
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    completePendingFileRead();
    await flushPromises();

    expect(wrapper.text()).toContain("doesn't appear to contain any card rows");
  });

  it("handles CSVs with no usable rows", async () => {
    const file = createMockFile("Name,Quantity\n,", "blank.csv", "text/csv");
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    completePendingFileRead();
    await flushPromises();

    expect(wrapper.text()).toContain("No usable card rows detected after filtering blanks.");
  });

  it("handles file reader errors", async () => {
    const file = createMockFile("Name\nSol Ring", "read-error.csv", "text/csv");
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      writable: false,
    });

    await fileInput.trigger("change");
    failPendingFileRead();
    await flushPromises();

    expect(notifyError).toHaveBeenCalledWith("We couldn't read that CSV. Please try again.");
  });

  it("loads sample inventory via fetch", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "Name,Quantity\nSol Ring,1",
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as typeof fetch;

    await wrapper.get("button[aria-label='Load sample inventory CSV']").trigger("click");
    await flushPromises();

    expect(fetchSpy).toHaveBeenCalled();
    expect(wrapper.text()).toContain("inventory.csv");
    expect(notifySuccess).toHaveBeenCalledWith("Found 1 card");

    globalThis.fetch = originalFetch;
  });

  it("reports errors when loading sample inventory fails", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchSpy as typeof fetch;

    await wrapper.get("button[aria-label='Load sample inventory CSV']").trigger("click");
    await flushPromises();

    expect(handleError).toHaveBeenCalled();

    globalThis.fetch = originalFetch;
  });
});
