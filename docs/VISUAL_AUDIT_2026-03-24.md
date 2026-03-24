# Visual Audit and Redesign Baseline

Date: 2026-03-24

## Scope

- `/`
- `/commander/:slug`
- `/top-commanders`

## Shared Findings

- Surface sameness is the biggest visual problem. Hero panels, toolbars, modals, filters, summary cards, and results sections all use nearly the same dark slab treatment, so the interface has weak hierarchy.
- Labels are doing too much structural work. Small overlines like `Commander Scout`, `Next step`, `Search`, and `Collection` are often the only cues separating one block from another.
- The site reads as a stack of containers rather than a sequence of workflows. The user has to infer what matters next instead of being guided by layout weight.
- Accent color is overused in pills and buttons but underused for actual information hierarchy. Actions, filters, and data states compete for the same emphasis.
- Dense results are visually relentless. Once a commander is loaded, the page becomes a long column of similar section headers and similar dark tables without strong checkpoints.
- The floating left navigation is useful, but it feels bolted onto the page instead of integrated into the results system.
- Desktop card preview interaction is brittle. The hover preview was positioned with a fixed offset, which made it easy to push off-screen near the right or bottom edge.

## Route Review: Dashboard

### What Works

- The hero message is clear and the route intent is understandable immediately.
- The onboarding modal explains the first decision well.
- The search, collection, and export split is conceptually sound.

### Problems

- [DashboardHero.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/dashboard/DashboardHero.vue) and [TopCommandersHero.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/top-commanders/TopCommandersHero.vue) are too visually similar. The routes do different jobs but open with almost the same composition.
- [DashboardToolbar.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/dashboard/DashboardToolbar.vue) feels like another generic card instead of a command bar. The next-step prompt, ownership filter, and tab navigation all have equal weight.
- [OnboardingModal.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/OnboardingModal.vue) is readable but visually flat. It uses the same panel language as the rest of the app, so the modal does not feel special enough for first-run onboarding.
- The search flow is split across too many equal-looking blocks. The controls, commander context, and results feel adjacent instead of nested into one clear search-to-results story.
- The left column on desktop carries too many responsibilities. Search, collection, commander context, top-50 scan, display settings, and notices all read as separate mini-pages.

### Redesign Moves

- Turn the hero into a real route masthead with one primary action and one secondary escape hatch. Remove the third CTA from the same visual row.
- Convert the sticky toolbar into a slimmer “workflow rail” that reads as operating state, not content.
- Make the search area the dominant primary canvas and move supporting controls into a tighter secondary column or collapsible utility tray.
- Give onboarding a brighter focal treatment with a stronger step cue, more breathing room, and less generic card styling.

## Route Review: Commander Detail

### What Works

- Reusing the dashboard route for `/commander/:slug` keeps state flow consistent.
- The long cardlist structure is powerful once the user understands it.
- Ownership filtering and export actions are useful and already present.

### Problems

- The commander route still looks like the landing dashboard after a commander is selected. It needs its own visual identity.
- [CommanderDataPanel.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/CommanderDataPanel.vue) explains the commander context, but it does not anchor the page strongly enough once real results appear.
- [EdhrecReader.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/EdhrecReader.vue) stacks section after section with little visual rhythm between them.
- [CardlistSection.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/CardlistSection.vue) repeats the same header chrome, stat strip, and dark table treatment so often that sections blur together.
- [FloatingCardlistNav.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/FloatingCardlistNav.vue) is functional but visually detached. It reads like a floating admin widget rather than part of the page.
- The results page becomes too tall without enough sectional contrast. The user scrolls through many high-density tables with very few strong landmarks.

### Redesign Moves

- Introduce a dedicated commander masthead for the selected commander with art, color identity, summary stats, and the primary route actions.
- Collapse the current “commander context” and part of the controls into that masthead so the top of the route feels like a destination, not just another card.
- Redesign cardlist sections to have stronger personalities: bolder headers, clearer icons, more distinct section summaries, and less repeated chrome.
- Integrate section navigation into the results header or sticky command bar instead of leaving it as a disconnected floating strip.
- Consider progressive disclosure for sections so the route can stay scannable before the user drills into every table.

## Route Review: Top Commanders

### What Works

- The route intent is clear and the CSV ownership idea is strong.
- Ranking, sorting, and color filtering are all useful controls.
- The scan concept differentiates the route from the commander explorer.

### Problems

- [TopCommandersPage.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/TopCommandersPage.vue) still reads as one giant surface stack: hero, status, controls, filter, legend, loading, and results all share too much visual DNA.
- [TopCommanderCard.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/top-commanders/TopCommanderCard.vue) is too tall for the amount of information shown. The commander art is visually small, while the card chrome takes too much vertical space.
- Desktop scanning suffers because the eye has to work through dozens of nearly identical card boxes. The route needs a stronger ranking rhythm.
- Ownership percentage is present but not dominant enough. It should be the first thing the eye reads after the commander name.
- [TopCommandersControls.vue](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/components/top-commanders/TopCommandersControls.vue) puts range, sorting, and refresh on the same line without a clear primary control group.
- The status card, owned legend, and filter row are useful but visually fragmented. They occupy a lot of vertical space without feeling like one coherent control deck.

### Redesign Moves

- Split the route into a stronger overview section plus a distinct results section instead of one long card container.
- Make top commanders feel ranked. Larger rank markers, more prominent ownership numbers, and tighter cards would improve scan speed immediately.
- Reduce the card height or offer a compact list mode on desktop. The current gallery wastes too much space for a ranked analytical view.
- Treat CSV state as a sticky or clearly bounded utility strip rather than a full content block competing with the ranking results.
- Simplify the filter language into one clearer command row with stronger grouping.

## Interaction Review

- Desktop preview hover needed a viewport-aware placement strategy. This branch updates [useScryfallCardPreview.ts](/c:/Users/veenm/OneDrive/Documents/Projects/workspace/edhrec-compare/edhrec-compare/src/composables/useScryfallCardPreview.ts) so the preview can clamp and flip when the cursor approaches the viewport edges.
- Hover itself should not be the only “rich” desktop affordance. Key data views should remain readable without hover-dependent discovery.
- Lift and shadow effects are generally subtle enough, but some components still rely on hover polish instead of stronger base hierarchy.

## Recommended Design Direction

- Keep the dark, atmospheric backdrop. It fits the product and the screenshots already show that the background gradient is one of the better parts of the current UI.
- Move from “stacked dark cards” to “editorial command deck.” That means fewer generic slabs, more deliberate section roles, and clearer contrast between mastheads, command bars, content wells, and utility panels.
- Reserve the accent color for route actions, active state, and success/owned signals. Stop spending the same accent intensity on every pill group.
- Increase contrast between page-level typography and control-level typography. Route headers need more authority, while utility labels should recede harder.
- Treat the commander route and the top-commanders route as separate products sharing a system, not as twins wearing different text.

## Quick Wins

- Fix hover preview placement on desktop.
- Reduce top-commanders card height and make ownership percentage larger.
- Give the selected commander route a real masthead instead of a generic context panel.
- Rework the floating cardlist navigation into a sticky integrated section index.
- Simplify the dashboard toolbar so the next action is unmistakable.

## Proposed Next Pass

- Redesign the commander route first. It has the highest density, the most repeated chrome, and the biggest payoff from a stronger information architecture.
- After the commander route settles, redesign top commanders using a denser ranking-first desktop layout.
- Revisit onboarding last so the modal matches the new route language instead of the old one.
