import { describe, expect, it } from "vitest";
import {
  formatReleaseDate,
  parseChangelog,
  splitChangelogReferences,
} from "../../../src/utils/changelog";

describe("changelog utilities", () => {
  it("parses release sections and ignores the unreleased bucket", () => {
    const releases = parseChangelog(`# Changelog

## [Unreleased]

- Hidden for now.

## [2.0.0] - 2026-03-24

### Changed

- Added a page (#156).

### Fixed

- Tightened release metadata (#155).

## [1.0.0] - 2025-11-22

### Added

- First stable release (#52, #55).
`);

    expect(releases).toHaveLength(2);
    expect(releases[0]).toEqual({
      version: "2.0.0",
      date: "2026-03-24",
      sections: [
        { title: "Changed", items: ["Added a page (#156)."] },
        { title: "Fixed", items: ["Tightened release metadata (#155)."] },
      ],
    });
    expect(releases[1]?.version).toBe("1.0.0");
  });

  it("formats release dates without local timezone drift", () => {
    expect(formatReleaseDate("2026-03-24")).toBe("Mar 24, 2026");
  });

  it("splits GitHub references into linkable text segments", () => {
    expect(splitChangelogReferences("Added a page (#156, #155).")).toEqual([
      { text: "Added a page (" },
      {
        text: "#156",
        href: "https://github.com/kmcgarry1/edhrec-compare/pull/156",
      },
      { text: ", " },
      {
        text: "#155",
        href: "https://github.com/kmcgarry1/edhrec-compare/pull/155",
      },
      { text: ")." },
    ]);
  });
});
