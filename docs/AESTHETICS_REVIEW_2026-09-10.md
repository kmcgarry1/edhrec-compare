# Commander Scout: aesthetics review

Reviewed 10 September 2026 against the local application using deterministic Playwright captures.

## Summary

The app now presents the core workflow more directly than the previous usability review, but the visual system still feels heavier than the task requires. Large framed surfaces, high-contrast purple actions, repeated pills, and decorative background treatment compete with card names, commander names, and ownership information. The strongest path is to preserve the warm fantasy/card identity while reducing visual furniture and making real card content carry more of the aesthetic weight.

This review focuses on aesthetics, not functional correctness. It uses the earlier usability review as context and prioritizes changes that improve hierarchy, polish, density, and visual consistency.

## Evidence

Screenshots and the capture script are in [the artifact folder](../artifacts/aesthetics-review-2026-09-10/). Captures cover 390, 768, 1100, and 1440 pixel widths in light and dark modes. The screenshots use fixture API responses; simplified fixture images should not be read as production image failures.

Representative evidence:

- [Home desktop](../artifacts/aesthetics-review-2026-09-10/home-desktop.png)
- [Home mobile](../artifacts/aesthetics-review-2026-09-10/home-mobile.png)
- [Commander desktop](../artifacts/aesthetics-review-2026-09-10/commander-desktop.png)
- [Top commanders desktop](../artifacts/aesthetics-review-2026-09-10/top-commanders-desktop.png)
- [Dark home](../artifacts/aesthetics-review-2026-09-10/home-desktop-dark.png)

## Easy Wins

| Priority | Issue                                                                                               | Affected area                                          | Suggested fix                                                                                              | Acceptance check                                                                            |
| -------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| EW1      | Main content is softened by broad blur/shadow treatment, making the first screen feel out of focus. | Home, commander masthead, content surfaces             | Remove or reduce backdrop blur/glow on primary content; reserve softness for distant background only.      | Search input, commander title, and first card row appear crisp in screenshots.              |
| EW2      | Purple primary buttons dominate every screen, including secondary actions.                          | Header, upload, export, section actions                | Keep one primary button per state; downgrade secondary export/upload/navigation to `secondary` or `ghost`. | In each screenshot, only the next best action has filled purple treatment.                  |
| EW3      | Too many rounded framed boxes create a card-inside-card look.                                       | Dashboard, commander sections, top commanders controls | Replace inner `CSurface` wrappers with separators, inline groups, or unframed blocks.                      | A section can be scanned as one content area instead of nested panels.                      |
| EW4      | Eyebrow labels are overused and overtracked.                                                        | Top commanders, CSV status, card tables, command bars  | Use normal-case `label` or `caption` for routine labels; reserve `eyebrow` for rare page-level grouping.   | Labels read as quiet metadata rather than decoration.                                       |
| EW5      | Card/ranking rows give visual weight to badges and containers before names.                         | Commander card rows, top commanders cards              | Increase name column prominence; keep ownership/status compact and aligned.                                | Commander/card names are the first readable text in list rows.                              |
| EW6      | Light theme leans beige and muddy because surface, border, and background are close in hue.         | Global tokens, `CSurface` roles                        | Slightly cool neutral surfaces and reduce warm shadows/borders.                                            | Light screens have clearer separation without adding more borders.                          |
| EW7      | Dark theme uses cleaner surfaces but still inherits busy gradients and mixed accent emphasis.       | Global dark tokens, buttons, surfaces                  | Reduce radial glows and align selected/primary/accent colors across components.                            | Dark screenshots look intentional rather than a recolored light theme.                      |
| EW8      | Header status pills consume mobile width and create visual noise.                                   | App shell header                                       | Shorten or hide passive status labels on mobile; expose details in menu/tray.                              | At 390px, the header reads as brand plus one main action/menu, not four competing controls. |

## Long-Term Direction

| Theme      | Current problem                                                                                           | Direction                                                                                                          | Acceptance check                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Layering   | Most page regions use borders, shadows, radius, and gradients at once.                                    | Define three layers: page background, content surface, overlay. Shadows belong mostly to overlays/sticky controls. | A screenshot can be annotated with only those three layers.                               |
| Typography | Display, title, eyebrow, and captions are mixed according to component defaults more than task hierarchy. | Create a type scale usage guide: display for page identity, title for sections, label/caption for metadata.        | No compact panel uses hero-scale type; routine labels are not widely tracked uppercase.   |
| Color      | The palette is distinctive but one-note in light mode and uneven in dark mode.                            | Keep warm fantasy identity, but make neutral, selected, primary, warning, danger, and disabled states explicit.    | Buttons, badges, notices, and progress bars use predictable meanings across themes.       |
| Artwork    | Card art is present but competes with gradients and placeholder framing.                                  | Treat card artwork as the main visual asset; remove competing decorative glows where art is visible.               | Pages feel richer because of actual card imagery, not background effects.                 |
| Density    | Ranking and result screens spend too much space on explanation and chrome.                                | Use compact operational layouts: title/status/controls, then rows. Explanations move below or into disclosure.     | At 1440x900, commander cards/results and top commander rows appear in the first viewport. |
| Components | Core primitives allow too many visually similar elevated states.                                          | Document and enforce usage rules for `CSurface`, `CText`, `CButton`, `CBadge`, and `CProgress`.                    | New screens do not invent local radii, shadows, or label treatments for routine cases.    |

## Roadmap

1. Quick polish pass: reduce blur/glows, downgrade duplicate primary buttons, tighten labels, and remove obvious nested surfaces.
2. Component-system cleanup: revise `CSurface` role defaults, normalize radius/shadow usage, and document `CText`/`CBadge` usage rules.
3. Page-level aesthetic pass: make home, commander route, and top commanders use compact work-first templates with card art as the main visual richness.
4. Visual regression checklist: keep captures for 390, 768, 1100, and 1440 widths in light/dark for home, commander, top commanders, upload, and settings.

## Assumptions

- Preserve the warm card-inspired identity rather than replacing it with a generic SaaS look.
- Treat this as expert visual review, not a formal accessibility or usability audit.
- Easy wins should avoid route-level rewrites and focus on visual hierarchy, spacing, token use, and emphasis.
- Long-term work may involve changing shared component defaults and page templates.
