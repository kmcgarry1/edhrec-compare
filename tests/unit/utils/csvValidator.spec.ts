import { describe, expect, it } from "vitest";
import { validateCsv } from "../../../src/utils/csvValidator";

describe("validateCsv", () => {
  it("accepts CSVs with a name column and matching rows", () => {
    const result = validateCsv(["Name", "Quantity"], [
      ["Sol Ring", "1"],
      ["Lightning Greaves", "1"],
    ]);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("warns when a name column is missing", () => {
    const result = validateCsv(["Quantity"], [["1"], ["2"]]);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('No "Name" column found. Using first column.');
  });

  it("warns about empty rows", () => {
    const result = validateCsv(["Name", "Quantity"], [
      ["", ""],
      ["Sol Ring", "1"],
    ]);

    expect(result.valid).toBe(true);
    expect(result.warnings[0]).toBe("Found 1 empty row");
  });

  it("produces an error when row lengths do not match headers", () => {
    const result = validateCsv(["Name", "Quantity"], [
      ["Sol Ring", "1"],
      ["Lightning Greaves"],
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Rows 3");
  });

  it("fails when no headers exist", () => {
    const result = validateCsv([], [["Sol Ring"]]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("No headers were detected in this CSV.");
  });

  it("fails when no data rows follow the header", () => {
    const result = validateCsv(["Name"], []);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("No card rows detected after the header row.");
  });
});
