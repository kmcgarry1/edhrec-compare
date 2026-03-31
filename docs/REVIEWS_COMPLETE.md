# Review Index

**Last Updated:** 2026-03-31  
**Status:** Active review set for UI/UX, security, and architecture

This file is the current entry point for review documentation. It supersedes the older "all reviews complete" snapshot from November 2025, which is still kept in the repository as historical planning material.

## Current Lead Reviews

### UI/UX

- **Executive summary:** [../VISUAL_DESIGN_REVIEW_SUMMARY.md](../VISUAL_DESIGN_REVIEW_SUMMARY.md)
- **Detailed route audit:** [VISUAL_AUDIT_2026-03-24.md](./VISUAL_AUDIT_2026-03-24.md)
- **Current posture:** Strong visual identity and a much better first-run dashboard flow, but the commander detail and top-commanders routes still need clearer hierarchy and denser analytical layouts.

### Security

- **Current review:** [SECURITY_REVIEW.md](./SECURITY_REVIEW.md)
- **Current posture:** Good browser hardening for a client-only app. CSP, reporting, privacy-focused Sentry, and in-memory collection handling are in place. Remaining work is mostly defense-in-depth and operational hardening.

### Architecture

- **Current review:** [ARCHITECTURE_REVIEW_SUMMARY.md](./ARCHITECTURE_REVIEW_SUMMARY.md)
- **Current posture:** The major 2025 performance architecture items have landed. Current risks are around error recovery, offline scope, and keeping route orchestration from getting too coupled as the product grows.

## Current Snapshot

| Area | Landed Since 2025 | Main Open Work |
| --- | --- | --- |
| UI/UX | Selection-stage onboarding, stronger route presentation, viewport-aware card preview | Stronger commander-detail masthead, tighter top-commanders scan rhythm, better section contrast |
| Security | CSP in HTML and headers, CSP report endpoint, privacy-filtered Sentry, no `v-html` rendering | Add dependency vulnerability gating, keep persistent storage narrow, monitor public log endpoints |
| Architecture | IndexedDB card cache, request deduplication, virtualized tables, route/component lazy loading, bundle analysis in CI | Error boundaries, fuller offline story, reduce route orchestration drift |

## Recommended Reading Order

1. Read [../VISUAL_DESIGN_REVIEW_SUMMARY.md](../VISUAL_DESIGN_REVIEW_SUMMARY.md) for current product-shape concerns.
2. Read [SECURITY_REVIEW.md](./SECURITY_REVIEW.md) for browser hardening and telemetry/privacy decisions.
3. Read [ARCHITECTURE_REVIEW_SUMMARY.md](./ARCHITECTURE_REVIEW_SUMMARY.md) for implementation status and remaining technical risks.
4. Use [../ARCHITECTURE.md](../ARCHITECTURE.md) for the implementation details behind the architecture review.

## Historical Review Archive

The broader November 2025 review bundle is still available for traceability:

- [COMPREHENSIVE_REVIEW_SUMMARY.md](./COMPREHENSIVE_REVIEW_SUMMARY.md)
- [PERFORMANCE_REVIEW.md](./PERFORMANCE_REVIEW.md)
- [FUNCTIONALITY_REVIEW.md](./FUNCTIONALITY_REVIEW.md)
- [COMPATIBILITY_REVIEW.md](./COMPATIBILITY_REVIEW.md)
- [COMPLIANCE_REVIEW.md](./COMPLIANCE_REVIEW.md)
- [MONITORING_ANALYTICS_REVIEW.md](./MONITORING_ANALYTICS_REVIEW.md)
- [CONTENT_MARKETING_REVIEW.md](./CONTENT_MARKETING_REVIEW.md)

Treat those files as historical planning documents. Several items in that set have already been implemented, especially around caching, request deduplication, virtualization, code splitting, Dependabot, and CSP.

## Working Agreement

- Use the current lead reviews above for present-tense decisions.
- Use the historical archive for context, not as a source of truth for implementation status.
- Cross-check active issue work against the codebase before recreating old backlog items.
