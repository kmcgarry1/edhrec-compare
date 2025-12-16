import { describe, expect, it } from "vitest";
import {
    buildFilterQuery,
    defaultFilterRouteState,
    parseFilterQuery,
} from "../../../src/utils/routeFilters";
import {
    EDHRECBracket,
    EDHRECCompanion,
    EDHRECPageModifier,
    EDHRECPageType,
} from "../../../src/components/helpers/enums";

describe("routeFilters utilities", () => {
    it("returns defaults when query params are missing", () => {
        const parsed = parseFilterQuery({});

        expect(parsed).toEqual(defaultFilterRouteState);
    });

    it("parses valid query params", () => {
        const parsed = parseFilterQuery({
            pageType: EDHRECPageType.AVERAGE_DECK.value,
            bracket: EDHRECBracket.EXHIBITION.value,
            modifier: EDHRECPageModifier.BUDGET.value,
            companion: EDHRECCompanion.ZIRDA.value,
        });

        expect(parsed).toEqual({
            pageType: EDHRECPageType.AVERAGE_DECK.value,
            bracket: EDHRECBracket.EXHIBITION.value,
            modifier: EDHRECPageModifier.BUDGET.value,
            companion: EDHRECCompanion.ZIRDA.value,
        });
    });

    it("falls back to defaults for invalid query params", () => {
        const parsed = parseFilterQuery({
            pageType: "unknown",
            bracket: "bad",
            modifier: "nope",
            companion: "missing",
        });

        expect(parsed).toEqual(defaultFilterRouteState);
    });

    it("uses the first entry when query params are arrays", () => {
        const parsed = parseFilterQuery({
            bracket: [EDHRECBracket.OPTIMIZED.value, EDHRECBracket.CORE.value],
        });

        expect(parsed.bracket).toBe(EDHRECBracket.OPTIMIZED.value);
    });

    it("builds a minimal query object omitting defaults", () => {
        const query = buildFilterQuery(defaultFilterRouteState);

        expect(query).toEqual({});
    });

    it("includes non-default filter values in the query", () => {
        const query = buildFilterQuery({
            ...defaultFilterRouteState,
            pageType: EDHRECPageType.AVERAGE_DECK.value,
            modifier: EDHRECPageModifier.EXPENSIVE.value,
        });

        expect(query).toEqual({
            pageType: EDHRECPageType.AVERAGE_DECK.value,
            modifier: EDHRECPageModifier.EXPENSIVE.value,
        });
    });

    it("canonicalizes route query params back into buildFilterQuery output", () => {
        const canonical = buildFilterQuery(
            parseFilterQuery({
                pageType: EDHRECPageType.COMMANDER.value,
                bracket: "",
                modifier: "",
                companion: "",
            })
        );

        expect(canonical).toEqual({});
    });
});
