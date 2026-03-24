# Core UI Primitives

`src/components/core` is the app's primitive layer. New UI work should prefer these components before introducing raw `div` and `span` wrappers.

## Available primitives

- `CText`: typography variants and tone control
- `CButton`: button and link-like actions
- `CStack`: vertical layout
- `CInline`: horizontal layout
- `CGrid`: common responsive grid layouts
- `CSurface`: panel and shell chrome
- `CBadge`: compact pill and label treatments
- `CProgress`: linear progress display
- `CNotice`: status, error, warning, and loading notices
- `CFieldShell`: label/helper/status wrapper for form controls

## Wrapper rule

Use raw elements when semantics or framework mechanics require them:

- document structure like `section`, `header`, `main`, `ul`, `li`, `table`
- media and vector elements like `img`, `svg`, `canvas`
- Vue transition and teleport anchors
- decorative layers and absolute-positioned background effects

For visible layout and text wrappers, default to a primitive first. If a raw wrapper still seems necessary, add a short comment or keep the usage obviously mechanical rather than visual.
