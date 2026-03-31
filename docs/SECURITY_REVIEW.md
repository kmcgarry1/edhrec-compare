# Security Review

**Review Date:** 2026-03-31  
**Review Scope:** Browser security, client-side data handling, telemetry, and operational safeguards  
**Status:** Active

## Executive Summary

Commander Scout has a relatively small attack surface because it is a client-side application with no user authentication, no server-side data model, and no embedded secrets. The current security posture is materially better than the November 2025 review suggested. The core browser-hardening work is already in place: a real Content Security Policy, synchronized CSP headers, CSP reporting, privacy-filtered Sentry, constrained local persistence, and a rendering model that avoids `v-html`.

The remaining security work is mostly defense-in-depth:

- keep user collection data out of persistent storage
- add automated dependency vulnerability checks to CI
- monitor the public telemetry endpoints for abuse or noise
- preserve the current text-only rendering model unless explicit sanitization is added

## What Was Validated

This review was checked against the current implementation in:

- [../index.html](../index.html)
- [../vercel.json](../vercel.json)
- [../tests/unit/security/csp.spec.ts](../tests/unit/security/csp.spec.ts)
- [../src/components/CSVUpload.vue](../src/components/CSVUpload.vue)
- [../src/api/scryfallApi.ts](../src/api/scryfallApi.ts)
- [../src/utils/sentry.ts](../src/utils/sentry.ts)
- [../api/csp-report.ts](../api/csp-report.ts)
- [../api/log-error.ts](../api/log-error.ts)
- [../.github/workflows/ci.yml](../.github/workflows/ci.yml)
- [../.github/dependabot.yml](../.github/dependabot.yml)

## Current Strengths

### 1. Content Security Policy is implemented and tested

- The CSP is declared in both [../index.html](../index.html) and [../vercel.json](../vercel.json).
- A unit test keeps the HTML meta policy and Vercel header policy synchronized.
- `report-uri` and `report-to` both point to a dedicated CSP reporting endpoint.
- `frame-ancestors`, `object-src`, `form-action`, and `base-uri` are locked down.

This closes the largest gap from the older security review.

### 2. The data model is privacy-aware by default

- User collection CSV data is processed client-side and kept in memory.
- Preferences and recent commanders are stored in `localStorage`, but the collection itself is not.
- Scryfall caching is limited to public card metadata in IndexedDB.

This is an appropriate storage split for the current product.

### 3. The rendering model is still low-risk

- There is no `v-html` usage under `src/`.
- CSV upload flow validates structure before import and renders values as text.
- Scryfall and EDHREC lookups sanitize and normalize card names before API usage.

This means the app currently relies on Vue's escaping model rather than unsafe HTML rendering paths.

### 4. Telemetry is privacy-filtered

- Sentry only initializes in production when `VITE_SENTRY_DSN` is present.
- Replays are masked and media is blocked.
- CSV-related breadcrumbs and contexts are removed before events are sent.
- CSP and client-error logging endpoints redact long fields before writing structured logs.

## Current Risks

### Medium

#### 1. The app relies on safe rendering conventions more than explicit sanitization

Today that is acceptable because the app renders text, avoids `v-html`, and keeps uploads local. The risk is future drift: if rich text, raw HTML, or third-party embedded markup is introduced later, the current safeguards will not be enough by themselves.

**Recommendation:** Treat "no HTML rendering for user-controlled content" as a hard rule unless a dedicated sanitization boundary is introduced.

#### 2. Public log endpoints can be noisy or abused

The CSP and client-error endpoints are intentionally simple public POST handlers. They are fine for current telemetry, but they do not include auth, origin checks, or explicit rate limiting.

**Recommendation:** If traffic grows, add simple abuse controls or alerting around unusual report volume before the logs become operationally noisy.

### Low

#### 3. Dependency vulnerability checks are not yet part of CI

Dependabot is configured, and CI already runs lint, build, bundle size, unit tests, and Playwright. What is still missing is an automated dependency vulnerability gate such as `npm audit` or an equivalent security scanner in CI.

**Recommendation:** Add a dependency audit step to CI so dependency drift is caught on the same path as functional regressions.

#### 4. Local persistence should stay intentionally narrow

Preferences and recent commanders are fine in `localStorage`. Inventory data is not. The current implementation makes the right choice; the risk is accidentally expanding persistence later because caching infrastructure already exists.

**Recommendation:** Keep a written rule that only public API data may be persisted. User collection data should remain session-scoped unless there is an explicit product decision and review.

## Security Posture Summary

| Area | Current State | Notes |
| --- | --- | --- |
| CSP | Strong | Implemented, mirrored in headers, and tested |
| XSS surface | Low | No `v-html`; text rendering model remains intact |
| Client storage | Good | Preferences persisted, user collection kept in memory |
| Telemetry privacy | Good | Sentry filters CSV context and masks replay content |
| Supply chain | Moderate | Dependabot exists, but CI vulnerability scanning is still missing |
| Public endpoints | Moderate | CSP/client-error logging is intentionally open and should be monitored |

## Recommended Next Steps

1. Add dependency vulnerability scanning to CI.
2. Keep user collection data out of IndexedDB and other persistent stores.
3. Preserve the current no-HTML-rendering rule for user-controlled content.
4. Monitor CSP and client-error endpoints for abuse if traffic increases.

## Conclusion

The current security posture is appropriate for a browser-only data-comparison tool and is substantially better than the repository's older review documents implied. The important work now is not emergency remediation. It is keeping the current guardrails intact while the product grows.

For the active review index, see [REVIEWS_COMPLETE.md](./REVIEWS_COMPLETE.md).
