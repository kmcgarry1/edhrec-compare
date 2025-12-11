/**
 * File download utility
 *
 * Triggers browser download of text content as a file using the Blob API.
 * Creates a temporary anchor element to initiate the download.
 *
 * @module utils/downloadTextFile
 *
 * @example
 * ```typescript
 * import { downloadTextFile } from '@/utils/downloadTextFile';
 *
 * // Download decklist
 * downloadTextFile('1 Sol Ring\n1 Command Tower', 'decklist.txt');
 *
 * // Download CSV
 * downloadTextFile('Name,Quantity\nSol Ring,1', 'inventory.csv');
 * ```
 */

/**
 * Download text content as a file
 *
 * Creates a Blob from the content and triggers a browser download.
 * Automatically cleans up the object URL after download.
 *
 * @param content - Text content to download
 * @param filename - Name for the downloaded file
 *
 * @example
 * ```typescript
 * // Generate and download decklist
 * const decklist = cards.map(c => `1 ${c.name}`).join('\n');
 * downloadTextFile(decklist, 'my-deck.txt');
 * ```
 */
export const downloadTextFile = (content: string, filename: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
