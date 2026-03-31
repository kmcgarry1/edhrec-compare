# UI/UX Review Summary

**Review Date:** 2026-03-31  
**Primary Source Audit:** [docs/VISUAL_AUDIT_2026-03-24.md](./docs/VISUAL_AUDIT_2026-03-24.md)  
**Status:** Active

## Executive Summary

Commander Scout's UI is in a better place than the older 2025 review summary described. The first-run dashboard is now a clear, high-intent selection stage instead of a flat onboarding step, the desktop card preview logic is viewport-aware, and the app's visual identity is more deliberate.

The remaining UI/UX problems are no longer about baseline polish. They are about hierarchy inside the densest workflows:

- the commander-detail route still carries too much repeated chrome
- the top-commanders route still scans more like a stack of cards than a ranked analysis tool
- route differentiation is improved, but the commander-detail experience still lacks the same immediate identity as the dashboard entry state

## What Was Validated

This summary was checked against the current implementation in:

- [docs/VISUAL_AUDIT_2026-03-24.md](./docs/VISUAL_AUDIT_2026-03-24.md)
- [src/components/Dashboard.vue](./src/components/Dashboard.vue)
- [src/components/dashboard/DashboardSelectionStage.vue](./src/components/dashboard/DashboardSelectionStage.vue)
- [src/components/EdhrecReader.vue](./src/components/EdhrecReader.vue)
- [src/components/top-commanders/TopCommandersHero.vue](./src/components/top-commanders/TopCommandersHero.vue)
- [src/components/top-commanders/TopCommandersControls.vue](./src/components/top-commanders/TopCommandersControls.vue)
- [src/components/top-commanders/TopCommanderCard.vue](./src/components/top-commanders/TopCommanderCard.vue)
- [src/composables/useScryfallCardPreview.ts](./src/composables/useScryfallCardPreview.ts)

## What Improved Since The 2025 Review

### 1. The dashboard entry state has a stronger point of view

[DashboardSelectionStage.vue](./src/components/dashboard/DashboardSelectionStage.vue) is now a real route-opening surface with:

- a clear workflow narrative
- a dominant search area
- better staging for the CSV upload decision
- route-specific visual language instead of a generic modal feel

### 2. The product has a clearer visual identity

The app now leans into an atmospheric command-deck style more intentionally. The background treatment, display typography, and staged intro composition give the dashboard more character than the older review documented.

### 3. Desktop preview behavior is materially better

The hover preview in [useScryfallCardPreview.ts](./src/composables/useScryfallCardPreview.ts) clamps and flips against the viewport. That closes a real interaction bug noted in the March audit.

## Current Findings

### High Priority

#### 1. Commander-detail hierarchy is still too flat for the amount of information shown

On the commander route, [EdhrecReader.vue](./src/components/EdhrecReader.vue) still presents a command surface, a results header, floating section navigation, and repeated section containers in a way that feels functional but visually repetitive.

**Why it matters:** Once a commander is loaded, the route becomes the app's densest workflow. It needs stronger anchors than "another good-looking surface."

**Next move:** Introduce a more distinctive commander masthead and reduce repeated section chrome so the page reads as a destination instead of a long stack.

#### 2. Top commanders still reads more like a gallery than an analytical ranking tool

[TopCommandersPage.vue](./src/components/TopCommandersPage.vue) is better organized than before, but the route still spends a lot of vertical space on utility surfaces before the ranking itself. [TopCommanderCard.vue](./src/components/top-commanders/TopCommanderCard.vue) remains tall relative to the amount of information users need to scan quickly.

**Next move:** Push the ranking rhythm harder. Make ownership percentage and rank more dominant, reduce card height, and consider a denser desktop mode.

### Medium Priority

#### 3. Route differentiation is still uneven

The dashboard entry state now has a clear identity, and the top-commanders hero has one as well. The commander-detail route is the odd one out: it works, but it still inherits too much generic shell language instead of establishing its own visual center of gravity.

#### 4. Section navigation is useful but still visually secondary

[FloatingCardlistNav.vue](./src/components/FloatingCardlistNav.vue) is more integrated than a fully detached floating widget, but it still reads like a utility object next to the real content rather than part of the results system itself.

## Recommended Next Pass

1. Redesign the commander-detail route first. That is where hierarchy debt is highest.
2. Tighten the top-commanders route into a more compact, ranking-first scan.
3. Revisit route-to-route visual differentiation after the commander-detail masthead is solved.

## Conclusion

The app has moved past the "basic polish" stage. The major UI question now is how to make the heavy analytical routes feel as intentional as the entry experience. The March 2026 audit still holds, but the context has shifted: the dashboard opening is stronger, so the remaining hierarchy weaknesses are more visible deeper in the product.

Use [docs/VISUAL_AUDIT_2026-03-24.md](./docs/VISUAL_AUDIT_2026-03-24.md) for route-by-route detail and [docs/REVIEWS_COMPLETE.md](./docs/REVIEWS_COMPLETE.md) for the active review index.
