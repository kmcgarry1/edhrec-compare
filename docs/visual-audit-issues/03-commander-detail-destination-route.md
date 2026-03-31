---
title: Visual Audit 2026: Turn Commander Detail into a Destination Route
labels:
  - ui-ux
  - design
  - visual-audit-2026
priority: high
source_sections:
  - Route Review: Commander Detail
  - Recommended Design Direction
  - Quick Wins
  - Proposed Next Pass
legacy_issue_refs: []
---

## Summary

- Give the selected commander route its own identity so it no longer looks like the landing dashboard with data appended to it.
- Anchor the page with a dedicated commander masthead that combines art, color identity, summary stats, and primary route actions.
- Improve long-scroll readability by giving sections stronger personalities and clearer navigation landmarks.

## Audit Evidence

- The commander route still looks too much like the landing dashboard after a commander is selected.
- The commander context panel does not anchor the page strongly enough once dense results appear.
- Cardlist sections repeat the same header chrome, stat strip, and table treatment often enough that they blur together.
- The floating cardlist navigation works functionally, but it reads like detached admin chrome instead of part of the page.
- The route becomes too tall and visually relentless because users scroll through many dense sections with weak landmarks.

## Redesign Scope

- Introduce a commander masthead that absorbs the current context panel and the highest-value controls.
- Redesign cardlist sections with clearer personalities, stronger section summaries, and less repeated chrome.
- Integrate section navigation into the results header or sticky command bar instead of leaving it as a disconnected floating strip.
- Add progressive disclosure where it improves scanability before users drill into every table.
- Preserve the route's data power while making it feel like a destination instead of a stacked report.

## Acceptance Criteria

- The selected commander route is visually distinct from the dashboard before users scroll.
- A commander masthead anchors the page with art, color identity, summary stats, and primary actions.
- Section navigation feels integrated into the results system instead of floating separately.
- Cardlist sections are easier to differentiate at a glance during long-scroll browsing.
- The route remains scannable without relying on hover-only affordances for comprehension.

## Implementation Order / Dependencies

- Prioritize this as the first route redesign after the shared visual-system issue lands.
- Use it to establish the strongest information-architecture patterns for the rest of the redesign pass.
- Complete this before the top-commanders redesign so the denser analytical route can borrow the updated route language where appropriate.
