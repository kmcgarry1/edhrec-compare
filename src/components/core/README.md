# Core UI Primitives

`src/components/core` is the app's primitive layer. New UI work should prefer
these components before introducing one-off layout wrappers or route-specific
visual patterns.

The primitive system is intentionally small. It sits on top of:

- CSS custom properties and theme values in `src/style.css`
- shared class maps in `src/components/core/config.ts`
- density-aware spacing from `src/composables/useLayoutDensity.ts`

## Design intent

The goal is consistency, not maximal abstraction.

- Shared primitives should carry the app's visual language across routes.
- Tokens should change the look of the system before ad hoc utility overrides do.
- Semantics stay explicit through `as`, `tag`, and normal HTML structure.
- The same primitives should hold up in light, dark, and high-contrast modes.
- Layout primitives should remain compatible with comfortable, cozy, and compact density.

## Current design language

### Typography

- Body text uses `Manrope`.
- Display and heading text use `Fraunces`.
- `CText` exposes the shared type ramp: `body`, `helper`, `label`, `caption`,
  `title`, `overline`, `eyebrow`, and `display`.

### Color and status

- Core surfaces and text colors are driven by CSS variables like `--surface`,
  `--surface-muted`, `--text`, `--muted`, and `--border`.
- Action and emphasis states center on `--accent`.
- System feedback uses `--warn` and `--danger`.
- Light, dark, and high-contrast overrides all live in `src/style.css`.

### Density

- Density state is global and persisted in local storage.
- `CSurface` with `size="adaptive"` follows the active density scale.
- Route-level layouts should use `useLayoutDensity()` rather than hard-coding
  repeated padding and gap shifts.

### Surface role mapping

For route shells, `CSurface` role variants are the primary hierarchy language:

- `masthead`: route identity, entry point, and hero-level framing
- `command`: compact action deck or route command shell
- `rail`: workflow controls, navigation, and section jumping
- `content`: primary reading well, results container, or main canvas
- `utility`: secondary support, metadata, export helpers, and side context
- `dense`: compact supporting blocks nested inside larger shells

Use role variants to make hierarchy obvious before adding route-local chrome.
If a route still feels flat, adjust the shell roles first.

## Primitive inventory

| Primitive     | Use it for                                      | Notes                                                                                                |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `CText`       | shared typography and text tone                 | Prefer this over styling raw `p`/`span` nodes by hand.                                               |
| `CButton`     | button, link-like, and segmented actions        | Includes shared sizing, variants, tones, disabled handling, and ripple feedback.                     |
| `CStack`      | vertical layout                                 | Default building block for panel internals and content flow.                                         |
| `CInline`     | horizontal layout                               | Use for toolbars, pills, metadata rows, and button groups.                                           |
| `CGrid`       | responsive grids                                | Use the built-in variants before inventing route-specific grid helpers.                              |
| `CSurface`    | panels, shells, and section chrome              | Primary way to express visual weight, containment, and route hierarchy.                              |
| `CBadge`      | short labels, pills, metadata tokens            | Use `textCase="caps"` for label chips and `textCase="normal"` for readable status or metadata pills. |
| `CProgress`   | linear progress display                         | Supports either percentage or current/total values.                                                  |
| `CNotice`     | info, warning, error, and loading states        | Bundles surface, text, optional dismiss action, and optional progress.                               |
| `CFieldShell` | field labels, helper text, and status messaging | Keeps form copy consistent around raw inputs and custom controls.                                    |

## Guidance for core design work

When changing the design system, prefer this order:

1. Update tokens in `src/style.css` if the change is truly system-wide.
2. Update shared primitive class maps in `src/components/core/config.ts`.
3. Extend the primitive API only if multiple routes need the new behavior.
4. Fall back to route-local utility classes only for one-off composition.

### Favor primitives over visual wrappers

If the element exists mainly to control spacing, tone, or hierarchy, it should
usually be a primitive. Common examples:

- replace a styled `div` with `CSurface`
- replace a flex utility wrapper with `CInline` or `CStack`
- replace a styled metadata `span` with `CText` or `CBadge`

### When `Card` is still acceptable

`Card.vue` remains a compatibility wrapper for untouched legacy areas. It is
acceptable when:

- the component has not been migrated to direct primitives yet
- the wrapper header/footer slot behavior is already stable and out of scope
- the work does not need shell-level hierarchy changes

For any new route shell, major shell refactor, or shared design pass, prefer
direct `CSurface` usage instead of adding more `Card`-based chrome.

### Keep semantics explicit

Most primitives accept `as` or `tag`. Use that instead of giving up on the
primitive layer:

- `CStack as="section"`
- `CInline as="header"`
- `CText tag="h2"`
- `CBadge as="span"`

### Use tones intentionally

- `accent` is for emphasis and primary action.
- `muted` is for secondary metadata.
- `warn` and `danger` should represent genuine status, risk, or exception states.
- `success` currently shares the accent family and should not be treated as a
  separate green design language without updating the underlying tokens.

### Respect density and accessibility

Core design work is incomplete if it only looks correct in one mode.

- check comfortable, cozy, and compact density
- check light, dark, and high-contrast modes
- keep focus rings visible
- preserve readable contrast for badges, notices, and subtle text

## Wrapper rule

Use raw elements when semantics or framework mechanics require them:

- document structure like `section`, `header`, `main`, `ul`, `li`, `table`
- media and vector elements like `img`, `svg`, `canvas`
- Vue transition and teleport anchors
- decorative layers and absolute-positioned background effects

For visible layout and text wrappers, default to a primitive first. If a raw
wrapper still seems necessary, keep the usage obviously mechanical or leave a
short comment explaining why the primitive layer was not the right fit.

## Verification

For any non-trivial primitive or route migration work:

- update or add unit tests under `tests/unit/components/core`
- run the shared primitive smoke tests in `tests/unit/components/core/Primitives.spec.ts`
- run through `docs/PRIMITIVE_REFACTOR_QA_CHECKLIST.md`
