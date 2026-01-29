/**
 * EDHREC API helpers
 *
 * Lightweight wrapper for EDHREC JSON endpoints used by the app.
 */

import { apiCall } from "./errorHandler";
import { requestCache } from "./requestCache";

const EDHREC_BASE_URL = "https://json.edhrec.com/pages";

type EdhrecCardView = {
  id?: string;
  name?: string;
  sanitized?: string;
  url?: string;
  num_decks?: number;
  rank?: number;
};

type EdhrecCardlist = {
  header?: string;
  cardviews?: EdhrecCardView[];
};

type EdhrecResponse = {
  header?: string;
  container?: {
    json_dict?: {
      cardlists?: EdhrecCardlist[];
    };
  };
};

type EdhrecPagedResponse = {
  header?: string;
  cardviews?: EdhrecCardView[];
  more?: string;
  is_paginated?: boolean;
};

export type TopCommander = {
  name: string;
  slug: string;
  rank: number;
  deckCount: number;
};

export type TopCommandersResponse = {
  header: string;
  commanders: TopCommander[];
};

const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const resolveSlug = (cardview: EdhrecCardView) => {
  if (cardview.sanitized) {
    return cardview.sanitized;
  }
  if (cardview.url) {
    const segments = cardview.url.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last) {
      return last;
    }
  }
  if (cardview.name) {
    return sanitizeSlug(cardview.name);
  }
  return "";
};

const topCommanderCache: {
  timestamp: number;
  payload: TopCommandersResponse | null;
} = {
  timestamp: 0,
  payload: null,
};

const averageDeckCache = new Map<string, string[]>();

const TOP_COMMANDER_PAGE_SIZE = 100;
const TOP_COMMANDER_BASE_URL = `${EDHREC_BASE_URL}/commanders/year.json`;
const TOP_COMMANDER_PAGED_PREFIX = `${EDHREC_BASE_URL}/commanders/year-past2years-`;

const extractCommanderCardviews = (
  payload: EdhrecResponse | EdhrecPagedResponse
) => {
  if ("container" in payload && payload.container?.json_dict?.cardlists?.length) {
    return payload.container.json_dict.cardlists[0]?.cardviews ?? [];
  }
  if ("cardviews" in payload && payload.cardviews) {
    return payload.cardviews;
  }
  return [];
};

const fetchEdhrecJson = async <T extends EdhrecResponse | EdhrecPagedResponse>(
  url: string,
  cacheKey: string
) =>
  requestCache.dedupe(cacheKey, () =>
    apiCall<T>(
      async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`EDHREC error: ${response.status}`);
        }
        return (await response.json()) as T;
      },
      "Unable to load top commanders from EDHREC.",
      { context: `edhrecTopCommanders:${cacheKey}` }
    )
  );

/**
 * Fetch top commanders from EDHREC.
 */
type TopCommanderOptions = {
  path?: string;
};

export async function getTopCommanders(
  limit = 50,
  options?: TopCommanderOptions
): Promise<TopCommandersResponse> {
  const path = options?.path ?? "commanders/year";
  const isGlobalTop = path === "commanders/year";
  const cacheWindow = 5 * 60 * 1000; // 5 minutes
  if (
    isGlobalTop &&
    topCommanderCache.payload &&
    Date.now() - topCommanderCache.timestamp < cacheWindow
  ) {
    if (topCommanderCache.payload.commanders.length >= limit) {
      return {
        header: topCommanderCache.payload.header,
        commanders: topCommanderCache.payload.commanders.slice(0, limit),
      };
    }
  }

  if (!isGlobalTop) {
    const url = `${EDHREC_BASE_URL}/${path}.json`;
    const payload = await fetchEdhrecJson<EdhrecResponse>(
      url,
      `edhrec:top-commanders:${path}`
    );
    const cardviews = extractCommanderCardviews(payload);
    const header =
      payload?.header || "Top Commanders (Past 2 Years)";
    const commanders = cardviews
      .map((cardview, index) => {
        const slug = resolveSlug(cardview);
        if (!slug || !cardview.name) {
          return null;
        }
        return {
          name: cardview.name,
          slug,
          rank: cardview.rank ?? index + 1,
          deckCount: cardview.num_decks ?? 0,
        };
      })
      .filter((entry): entry is TopCommander => Boolean(entry))
      .slice(0, limit);

    return { header, commanders };
  }

  const basePayload = await fetchEdhrecJson<EdhrecResponse>(
    TOP_COMMANDER_BASE_URL,
    "edhrec:top-commanders:base"
  );

  const baseCardviews = extractCommanderCardviews(basePayload);
  const header =
    basePayload?.header || "Top Commanders (Past 2 Years)";

  const needed = Math.max(limit - TOP_COMMANDER_PAGE_SIZE, 0);
  const additionalPages = Math.ceil(needed / TOP_COMMANDER_PAGE_SIZE);
  const pagedCardviews: EdhrecCardView[] = [];

  for (let page = 1; page <= additionalPages; page += 1) {
    const url = `${TOP_COMMANDER_PAGED_PREFIX}${page}.json`;
    const payload = await fetchEdhrecJson<EdhrecPagedResponse>(
      url,
      `edhrec:top-commanders:page:${page}`
    );
    const cardviews = extractCommanderCardviews(payload);
    pagedCardviews.push(...cardviews);
    if (pagedCardviews.length >= needed) {
      break;
    }
  }

  const allCommanders = [...baseCardviews, ...pagedCardviews]
    .map((cardview) => {
      const slug = resolveSlug(cardview);
      if (!slug || !cardview.name) {
        return null;
      }
      return {
        name: cardview.name,
        slug,
        rank: cardview.rank ?? 0,
        deckCount: cardview.num_decks ?? 0,
      };
    })
    .filter((entry): entry is TopCommander => Boolean(entry));

  const commanders = allCommanders.slice(0, limit);

  const result = { header, commanders: allCommanders };
  topCommanderCache.timestamp = Date.now();
  topCommanderCache.payload = result;

  return {
    header,
    commanders,
  };
}

/**
 * Fetch average deck card names for a commander slug.
 */
export async function getAverageDeckCards(
  slug: string
): Promise<string[] | null> {
  if (!slug) {
    return null;
  }
  const cached = averageDeckCache.get(slug);
  if (cached) {
    return cached;
  }

  const url = `${EDHREC_BASE_URL}/average-decks/${slug}.json`;

  const payload = await requestCache.dedupe(`edhrec:average-deck:${slug}`, () =>
    apiCall<EdhrecResponse | null>(
      async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`EDHREC error: ${response.status}`);
        }
        return (await response.json()) as EdhrecResponse;
      },
      "Unable to load average deck data from EDHREC.",
      {
        context: `edhrecAverageDeck:${slug}`,
        suppressError: true,
        fallbackValue: null,
        notify: false,
      }
    )
  );

  if (!payload) {
    return null;
  }

  const cardlists = payload?.container?.json_dict?.cardlists ?? [];
  const names = cardlists.flatMap((list) =>
    (list.cardviews ?? []).map((card) => card.name ?? "").filter(Boolean)
  );

  averageDeckCache.set(slug, names);
  return names;
}
