---
title: Visual Audit 2026: Reframe Dashboard as a Workflow-First Search Canvas
labels:
  - ui-ux
  - design
  - visual-audit-2026
priority: medium
source_sections:
  - Route Review: Dashboard
  - Quick Wins
legacy_issue_refs:
  - 71
  - 94
---

## Summary

- Reframe the dashboard around one clear search-to-results story instead of a column of equal-weight cards and utilities.
- Keep the selection stage as the focal onboarding surface, then make the active search canvas unmistakably primary once the user moves deeper into the workflow.
- Reduce the number of separate responsibilities carried by the left desktop column.

## Audit Evidence

- The dashboard hero and top-commanders hero are still too visually similar even though the routes do different jobs.
- The sticky toolbar reads like another generic card instead of a command surface that expresses route state.
- Search controls, commander context, and results currently feel adjacent rather than nested into one workflow.
- The desktop layout assigns search, collection, commander context, top-50 scan, settings, and notices to the same visual lane, which makes the route read like several mini-pages.

## Redesign Scope

- Turn the hero into a true route masthead with one primary action and one clear secondary escape hatch.
- Convert the sticky toolbar into a slimmer workflow rail that communicates state rather than competing as content.
- Make the search area the dominant primary canvas and move supporting controls into a tighter secondary column or collapsible utility tray.
- Tighten density and layout so next-step guidance is obvious without bringing back the archived modal-first onboarding model.
- Fold earlier whitespace and density concerns into this route-wide reframe instead of treating them as isolated spacing tweaks.

## Acceptance Criteria

- The dashboard opening composition is visibly distinct from the top-commanders route.
- The route exposes one dominant primary workflow from selection through search and results.
- The sticky toolbar reads as operating state, not as another generic dark panel.
- Supporting utilities no longer interrupt or visually outrank the main search canvas.
- Desktop layout reduces the number of equal-priority blocks in the left column.

## Implementation Order / Dependencies

- Start after the shared visual-system issue establishes the common route roles.
- Land before any onboarding revisit so the onboarding language can match the new dashboard structure.
- This issue supersedes older density-focused dashboard concerns by absorbing them into a route-level redesign.
