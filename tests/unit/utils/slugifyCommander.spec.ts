import { describe, it, expect } from "vitest";
import { slugifyCommander, buildCommanderSlug } from "../../../src/utils/slugifyCommander";

describe("slugifyCommander", () => {
    it("returns empty string for empty input", () => {
        expect(slugifyCommander("")).toBe("");
    });

    it("returns empty string for whitespace-only input", () => {
        expect(slugifyCommander("   ")).toBe("");
    });

    it("lowercases and removes straight apostrophes", () => {
        expect(slugifyCommander("K'rrik")).toBe("krrik");
    });

    it("removes curly apostrophes", () => {
        expect(slugifyCommander("Ayli, Eternal Pilgrim’s Quest")).toBe("ayli-eternal-pilgrims-quest");
    });

    it("replaces ampersand with 'and'", () => {
        expect(slugifyCommander("Atraxa & Friends")).toBe("atraxa-and-friends");
    });

    it("replaces spaces and commas with single hyphen", () => {
        expect(slugifyCommander("Marneus, Calgar")).toBe("marneus-calgar");
    });

    it("collapses multiple hyphens and trims leading/trailing hyphens", () => {
        expect(slugifyCommander("  --Foo   Bar -- ")).toBe("foo-bar");
    });

    it("removes leading and trailing punctuation/hyphens", () => {
        expect(slugifyCommander(" -Hello-World- ")).toBe("hello-world");
    });

    it("preserves internal hyphens after collapsing", () => {
        expect(slugifyCommander("Foo---Bar--Baz")).toBe("foo-bar-baz");
    });

    it("handles mixed characters", () => {
        expect(slugifyCommander("  Glissa, & The ‘Traitor’ ")).toBe("glissa-and-the-traitor");
    });
});

describe("buildCommanderSlug", () => {
    it("returns empty when primary name is empty", () => {
        expect(buildCommanderSlug("")).toBe("");
        expect(buildCommanderSlug("   ")).toBe("");
    });

    it("returns primary slug when no partner provided", () => {
        expect(buildCommanderSlug("Atraxa, Praetors' Voice")).toBe("atraxa-praetors-voice");
    });

    it("returns primary slug when partner is undefined/null", () => {
        expect(buildCommanderSlug("Atraxa", undefined)).toBe("atraxa");
        expect(buildCommanderSlug("Atraxa", null)).toBe("atraxa");
    });

    it("returns primary slug when partner normalizes to empty", () => {
        expect(buildCommanderSlug("Atraxa", "   ")).toBe("atraxa");
    });

    it("sorts slugs alphabetically (partner first case)", () => {
        // the-ur-dragon < zedruu
        expect(buildCommanderSlug("Zedruu", "The Ur-Dragon")).toBe("the-ur-dragon-zedruu");
    });

    it("sorts slugs alphabetically (primary first case)", () => {
        // atraxa < chulane
        expect(buildCommanderSlug("Chulane, Teller of Tales", "Atraxa, Praetors' Voice"))
            .toBe("atraxa-praetors-voice-chulane-teller-of-tales");
    });

    it("handles identical resulting slugs", () => {
        expect(buildCommanderSlug("Foo", "FOO")).toBe("foo-foo");
    });

    it("handles complex normalization for both names", () => {
        expect(buildCommanderSlug(" Glissa, & The ‘Traitor’ ", "Marneus, Calgar"))
            .toBe("glissa-and-the-traitor-marneus-calgar");
    });

    it("is stable regardless of original input casing/order", () => {
        const a = buildCommanderSlug("Alpha", "beta");
        const b = buildCommanderSlug("beta", "Alpha");
        expect(a).toBe("alpha-beta");
        expect(b).toBe("alpha-beta");
    });
});