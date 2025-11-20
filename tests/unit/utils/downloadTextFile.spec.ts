/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, afterEach } from "vitest";
import { downloadTextFile } from "../../../src/utils/downloadTextFile";

describe("downloadTextFile", () => {
    const original = {
        document: globalThis.document,
        URL: globalThis.URL,
        Blob: globalThis.Blob,
    };

    afterEach(() => {
        // Restore all globals after each test
        (globalThis as any).document = original.document;
        (globalThis as any).URL = original.URL;
        (globalThis as any).Blob = original.Blob;
        vi.restoreAllMocks();
    });

    it("returns early when document is undefined", () => {
        (globalThis as any).document = undefined;
        expect(() => downloadTextFile("content", "file.txt")).not.toThrow();
    });

    it("creates an anchor, sets href/download, clicks it, and cleans up", () => {
        // Mock link element
        const linkMock: any = { href: "", download: "", click: vi.fn() };
        const appendChild = vi.fn();
        const removeChild = vi.fn();

        // Mock document
        const createElement = vi.fn(() => linkMock);
        (globalThis as any).document = {
            createElement,
            body: { appendChild, removeChild },
        } as unknown as Document;

        // Mock URL
        const createObjectURL = vi.fn(() => "blob:mock-url");
        const revokeObjectURL = vi.fn();
        (globalThis as any).URL = {
            createObjectURL,
            revokeObjectURL,
        } as any;

        downloadTextFile("hello world", "hello.txt");

        expect(createElement).toHaveBeenCalledWith("a");
        expect(appendChild).toHaveBeenCalledWith(linkMock);
        expect(linkMock.href).toBe("blob:mock-url");
        expect(linkMock.download).toBe("hello.txt");
        expect(linkMock.click).toHaveBeenCalledTimes(1);
        expect(removeChild).toHaveBeenCalledWith(linkMock);
        expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("passes correct content and type to Blob and uses the resulting URL", () => {
        // Capture Blob constructor usage
        const blobInstances: any[] = [];
        function MockBlob(this: any, parts: any[], options?: BlobPropertyBag) {
            const instance = { __isMockBlob: true, parts, options };
            blobInstances.push(instance);
            return instance as any;
        }
        (globalThis as any).Blob = MockBlob as any;

        // Mock minimal DOM
        const linkMock: any = { href: "", download: "", click: vi.fn() };
        const appendChild = vi.fn();
        const removeChild = vi.fn();
        const createElement = vi.fn(() => linkMock);
        (globalThis as any).document = {
            createElement,
            body: { appendChild, removeChild },
        } as unknown as Document;

        // Mock URL
        const createObjectURL = vi.fn(() => "blob:from-mock-blob");
        const revokeObjectURL = vi.fn();
        (globalThis as any).URL = {
            createObjectURL,
            revokeObjectURL,
        } as any;

        const content = "some text";
        const filename = "test.txt";
        downloadTextFile(content, filename);

        expect(blobInstances.length).toBe(1);
        expect(blobInstances[0].__isMockBlob).toBe(true);
        expect(blobInstances[0].parts).toEqual([content]);
        expect(blobInstances[0].options).toEqual({ type: "text/plain" });
        expect(createObjectURL).toHaveBeenCalledWith(blobInstances[0]);
        expect(linkMock.href).toBe("blob:from-mock-blob");
        expect(linkMock.download).toBe(filename);
    });

    it("handles multiple calls with separate object URLs and links", () => {
        // Create fresh link objects per call
        const createElement = vi.fn(() => ({ href: "", download: "", click: vi.fn() } as any));
        const appendChild = vi.fn();
        const removeChild = vi.fn();
        (globalThis as any).document = {
            createElement,
            body: { appendChild, removeChild },
        } as unknown as Document;

        const createObjectURL = vi
            .fn()
            .mockReturnValueOnce("blob:url-1")
            .mockReturnValueOnce("blob:url-2");
        const revokeObjectURL = vi.fn();
        (globalThis as any).URL = {
            createObjectURL,
            revokeObjectURL,
        } as any;

        downloadTextFile("first", "file1.txt");
        downloadTextFile("second", "file2.txt");

        // Extract link objects that were appended
        const firstLink = appendChild.mock.calls[0][0];
        const secondLink = appendChild.mock.calls[1][0];

        expect(firstLink).not.toBe(secondLink);
        expect(firstLink.href).toBe("blob:url-1");
        expect(firstLink.download).toBe("file1.txt");
        expect(secondLink.href).toBe("blob:url-2");
        expect(secondLink.download).toBe("file2.txt");

        expect(revokeObjectURL).toHaveBeenNthCalledWith(1, "blob:url-1");
        expect(revokeObjectURL).toHaveBeenNthCalledWith(2, "blob:url-2");

        // Ensure both links were clicked and removed
        expect((firstLink as any).click).toHaveBeenCalledTimes(1);
        expect((secondLink as any).click).toHaveBeenCalledTimes(1);
        expect(removeChild).toHaveBeenCalledWith(firstLink);
        expect(removeChild).toHaveBeenCalledWith(secondLink);
    });
});
