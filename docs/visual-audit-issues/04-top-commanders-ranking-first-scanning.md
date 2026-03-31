---
title: Visual Audit 2026: Redesign Top Commanders for Ranking-First Scanning
labels:
  - ui-ux
  - design
  - visual-audit-2026
priority: medium
source_sections:
  - Route Review: Top Commanders
  - Quick Wins
  - Proposed Next Pass
legacy_issue_refs: []
---

## Summary

- Redesign top commanders around fast ranking-first scanning instead of a long stack of similarly weighted surfaces.
- Make ownership percentage the most immediate metric after commander identity.
- Split the route into a clearer overview and results system so CSV state, controls, and ranked output no longer compete equally.

## Audit Evidence

- The route still reads as one giant surface stack where hero, status, controls, filter, legend, loading, and results all share too much visual DNA.
- Commander cards are too tall for the amount of information shown, which slows desktop scanning.
- Ownership percentage exists but does not dominate enough to guide the eye after the commander name.
- Range, sorting, and refresh compete in the same command line without strong grouping.
- Status, legend, and filter elements take a lot of vertical space without feeling like one coherent control deck.

## Redesign Scope

- Split the route into a stronger overview section plus a distinct results section.
- Increase ranking rhythm with larger rank markers, stronger ownership metrics, and tighter card or list treatments.
- Reduce card height or introduce a compact desktop list mode that favors analytical scanning over gallery presentation.
- Treat CSV state as a bounded utility strip instead of a full content block that competes with the results.
- Simplify filters into one clearer command row with stronger grouping.

## Acceptance Criteria

- Desktop users can scan ranking and ownership information faster because the route emphasizes rank and percentage before secondary details.
- The route has a clearer separation between overview controls and ranked results.
- Commander cards or rows are materially denser without becoming harder to read.
- CSV state and legends support the route without visually overpowering ranked output.
- The route no longer feels like a twin of the dashboard hero-and-card stack.

## Implementation Order / Dependencies

- Start after the commander-detail redesign settles so the route can borrow any shared system updates that prove out there first.
- Keep the scope focused on ranking-first analysis rather than general dashboard behavior.
- Use this issue to close the route-level visual gap after the shared visual-system and commander-detail work are in place.
