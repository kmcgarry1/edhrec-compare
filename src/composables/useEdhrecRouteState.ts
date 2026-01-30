import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  EDHRECBracket,
  EDHRECCompanion,
  EDHRECPageModifier,
  EDHRECPageType,
} from "../components/helpers/enums";
import { buildFilterQuery, parseFilterQuery, type FilterRouteState } from "../utils/routeFilters";

const EDHREC_URL_PREFIX = "https://json.edhrec.com/pages/";
const EDHREC_URL_SUFFIX = ".json";

const setRefValue = <T,>(target: { value: T }, value: T) => {
  if (target.value !== value) {
    target.value = value;
  }
};

const areQueriesEqual = (existing: Record<string, string>, target: Record<string, string>) => {
  const existingKeys = Object.keys(existing);
  const targetKeys = Object.keys(target);
  if (existingKeys.length !== targetKeys.length) {
    return false;
  }

  return targetKeys.every((key) => existing[key] === target[key]);
};

export const useEdhrecRouteState = () => {
  const route = useRoute();
  const router = useRouter();

  const chosenPageType = ref<string>(EDHRECPageType.COMMANDER.value);
  const chosenBracket = ref<string>(EDHRECBracket.ALL.value);
  const chosenModifier = ref<string>(EDHRECPageModifier.ANY.value);
  const chosenCompanion = ref<string>(EDHRECCompanion.NONE.value);
  const currentCommanderSlug = ref<string | null>(null);

  const setBracket = (value: string | number) => {
    chosenBracket.value = String(value);
  };
  const setModifier = (value: string | number) => {
    chosenModifier.value = String(value);
  };
  const setPageType = (value: string | number) => {
    chosenPageType.value = String(value);
  };
  const setCompanion = (value: string | number) => {
    chosenCompanion.value = String(value);
  };

  const filterState = computed<FilterRouteState>(() => ({
    pageType: chosenPageType.value,
    bracket: chosenBracket.value,
    modifier: chosenModifier.value,
    companion: chosenCompanion.value,
  }));

  const buildCommanderUrl = (slug: string | null | undefined) => {
    if (!slug) {
      return null;
    }
    const segments = [chosenPageType.value, slug];
    if (chosenBracket.value) {
      segments.push(chosenBracket.value);
    }
    if (chosenCompanion.value && chosenCompanion.value !== EDHRECCompanion.NONE.value) {
      segments.push(chosenCompanion.value);
    }
    if (chosenModifier.value) {
      segments.push(chosenModifier.value);
    }

    return `${EDHREC_URL_PREFIX}${segments.join("/")}${EDHREC_URL_SUFFIX}`;
  };

  const commanderUrl = computed(() => buildCommanderUrl(currentCommanderSlug.value));

  const applyRouteState = () => {
    const filters = parseFilterQuery(route.query);
    setRefValue(chosenPageType, filters.pageType);
    setRefValue(chosenBracket, filters.bracket);
    setRefValue(chosenModifier, filters.modifier);
    setRefValue(chosenCompanion, filters.companion);

    const slugParam =
      typeof route.params.slug === "string" && route.params.slug.length > 0
        ? route.params.slug
        : null;
    setRefValue(currentCommanderSlug, slugParam);
  };

  let hasHydratedFromRoute = false;

  applyRouteState();
  hasHydratedFromRoute = true;

  watch(
    () => route.fullPath,
    () => {
      applyRouteState();
    }
  );

  const updateRouteFromState = () => {
    if (!hasHydratedFromRoute) {
      return;
    }

    const targetQuery = buildFilterQuery(filterState.value);
    const canonicalRouteQuery = buildFilterQuery(parseFilterQuery(route.query));
    const targetSlug = currentCommanderSlug.value;
    const currentSlug = typeof route.params.slug === "string" ? route.params.slug : null;

    const targetRoute = targetSlug
      ? { name: "commander", params: { slug: targetSlug }, query: targetQuery }
      : { name: "home", query: targetQuery };

    const isSameRoute =
      route.name === targetRoute.name &&
      currentSlug === (targetSlug ?? null) &&
      areQueriesEqual(canonicalRouteQuery, targetQuery);

    if (isSameRoute) {
      return;
    }

    void router.push(targetRoute);
  };

  watch(
    [currentCommanderSlug, chosenPageType, chosenBracket, chosenModifier, chosenCompanion],
    () => {
      updateRouteFromState();
    }
  );

  const setCommanderSlug = (slug: string | null | undefined) => {
    if (!slug) {
      currentCommanderSlug.value = null;
      return;
    }
    const trimmed = slug.trim();
    currentCommanderSlug.value = trimmed.length ? trimmed : null;
  };

  return {
    chosenPageType,
    chosenBracket,
    chosenModifier,
    chosenCompanion,
    currentCommanderSlug,
    commanderUrl,
    setCommanderSlug,
    setBracket,
    setModifier,
    setPageType,
    setCompanion,
  };
};
