import { describe, it, expect, vi, afterEach } from "vitest";
import { downloadTextFile } from "../../../src/utils/downloadTextFile";

describe("downloadTextFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns early when document is undefined", () => {
    vi.stubGlobal("document", undefined);
    expect(() => downloadTextFile("content", "file.txt")).not.toThrow();
  });

  it("creates an anchor, sets href/download, clicks it, and cleans up", () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        element.click = clickSpy;
      }
      return element;
    });
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    downloadTextFile("hello world", "hello.txt");

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    const appendedChild = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(appendedChild.href).toBe("blob:mock-url");
    expect(appendedChild.download).toBe("hello.txt");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(appendedChild);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("passes correct content and type to Blob and uses the resulting URL", () => {
    let capturedBlob: Blob | null = null;
    const createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockImplementation((blob: Blob | MediaSource) => {
      capturedBlob = blob as Blob;
      return "blob:from-mock-blob";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const content = "some text";
    const filename = "test.txt";
    downloadTextFile(content, filename);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(capturedBlob).not.toBeNull();
    expect(capturedBlob?.type).toBe("text/plain");
  });

  it("handles multiple calls with separate object URLs and links", () => {
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === "a") {
        element.click = clickSpy;
      }
      return element;
    });
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:url-1")
      .mockReturnValueOnce("blob:url-2");
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    downloadTextFile("first", "file1.txt");
    downloadTextFile("second", "file2.txt");

    expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
    expect(revokeObjectURLSpy).toHaveBeenNthCalledWith(1, "blob:url-1");
    expect(revokeObjectURLSpy).toHaveBeenNthCalledWith(2, "blob:url-2");

    const firstLink = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
    const secondLink = appendChildSpy.mock.calls[1][0] as HTMLAnchorElement;

    expect(firstLink).not.toBe(secondLink);
    expect(firstLink.href).toBe("blob:url-1");
    expect(firstLink.download).toBe("file1.txt");
    expect(secondLink.href).toBe("blob:url-2");
    expect(secondLink.download).toBe("file2.txt");

    expect(clickSpy).toHaveBeenCalledTimes(2);
    expect(removeChildSpy).toHaveBeenCalledWith(firstLink);
    expect(removeChildSpy).toHaveBeenCalledWith(secondLink);
  });
});
