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
