---
title: Visual Audit 2026: Establish an Editorial Command Deck Visual System
labels:
  - ui-ux
  - design
  - visual-audit-2026
priority: high
source_sections:
  - Shared Findings
  - Recommended Design Direction
  - Quick Wins
legacy_issue_refs:
  - 70
  - 93
---

## Summary

- Replace the current "stack of dark slabs" language with a clearer page system built from route mastheads, workflow rails, content wells, and utility panels.
- Rebuild hierarchy so actions, data states, and structural sections no longer compete for the same visual weight.
- Treat dashboard, commander detail, and top commanders as separate products that share a system instead of near-identical shells.

## Audit Evidence

- The audit calls out surface sameness as the dominant visual problem across hero panels, toolbars, filters, summary cards, modals, and results sections.
- Labels and overlines are carrying too much structural meaning, so users have to infer grouping instead of reading it from layout weight.
- Accent color is being spent on pills and small controls instead of true primary actions, active state, and information hierarchy.
- Shared navigation elements feel bolted onto the experience rather than integrated into the route structure.

## Redesign Scope

- Define reusable roles for route mastheads, sticky workflow rails, primary content wells, and secondary utility trays.
- Tighten accent-color rules so strong emphasis is reserved for route actions, active state, and owned or success signals.
- Increase contrast between page-level typography and control-level typography so route headers carry more authority than utility labels.
- Bring shared navigation and results controls into the same visual language instead of letting them float as detached widgets.
- Exclude the already-fixed hover-preview placement work from this scope.

## Acceptance Criteria

- Each primary route uses distinct masthead, workflow, content, and utility treatments instead of repeating the same slab composition.
- Accent color usage is limited enough that primary actions and active state read immediately.
- Utility controls are visually subordinate to route-defining content and actions.
- Shared visual rules are documented clearly enough to guide the downstream route redesign issues.

## Implementation Order / Dependencies

- Start this before any route-specific redesign work.
- Use this issue to establish the shared primitives and hierarchy rules that dashboard, commander detail, and top commanders will inherit.
- Legacy overlap exists with earlier toolkit-header hierarchy work, but this issue supersedes those narrower passes with a route-system baseline.
