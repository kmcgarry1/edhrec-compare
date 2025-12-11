import type { LocationQuery } from "vue-router";
import {
  EDHRECBracket,
  EDHRECCompanion,
  EDHRECPageModifier,
  EDHRECPageType,
} from "../components/helpers/enums";

export type FilterRouteState = {
  pageType: string;
  bracket: string;
  modifier: string;
  companion: string;
};

export const defaultFilterRouteState: FilterRouteState = {
  pageType: EDHRECPageType.COMMANDER.value,
  bracket: EDHRECBracket.ALL.value,
  modifier: EDHRECPageModifier.ANY.value,
  companion: EDHRECCompanion.NONE.value,
};

const allowedFilterValues = {
  pageType: new Set(Object.values(EDHRECPageType).map((option) => option.value)),
  bracket: new Set(Object.values(EDHRECBracket).map((option) => option.value)),
  modifier: new Set(Object.values(EDHRECPageModifier).map((option) => option.value)),
  companion: new Set(Object.values(EDHRECCompanion).map((option) => option.value)),
};

const normalizeQueryValue = (value: LocationQuery[keyof LocationQuery]) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return typeof value === "string" ? value : "";
};

export const parseFilterQuery = (query: LocationQuery): FilterRouteState => {
  const pageType = normalizeQueryValue(query.pageType);
  const bracket = normalizeQueryValue(query.bracket);
  const modifier = normalizeQueryValue(query.modifier);
  const companion = normalizeQueryValue(query.companion);

  return {
    pageType: allowedFilterValues.pageType.has(pageType)
      ? pageType
      : defaultFilterRouteState.pageType,
    bracket: allowedFilterValues.bracket.has(bracket)
      ? bracket
      : defaultFilterRouteState.bracket,
    modifier: allowedFilterValues.modifier.has(modifier)
      ? modifier
      : defaultFilterRouteState.modifier,
    companion: allowedFilterValues.companion.has(companion)
      ? companion
      : defaultFilterRouteState.companion,
  };
};

export const buildFilterQuery = (state: FilterRouteState): Record<string, string> => {
  const query: Record<string, string> = {};

  if (state.pageType && state.pageType !== defaultFilterRouteState.pageType) {
    query.pageType = state.pageType;
  }
  if (state.bracket) {
    query.bracket = state.bracket;
  }
  if (state.modifier) {
    query.modifier = state.modifier;
  }
  if (state.companion) {
    query.companion = state.companion;
  }

  return query;
};
