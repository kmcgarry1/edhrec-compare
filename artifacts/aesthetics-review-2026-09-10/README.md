# Aesthetics review artifacts

Generated 10 September 2026 against the local Vite app with deterministic EDHREC and Scryfall network fixtures.

## Reproduce

Start the app:

```sh
npm run dev -- --host --port 4173
```

Capture screenshots:

```sh
node artifacts/aesthetics-review-2026-09-10/capture-aesthetics.mjs
```

## Notes

- Viewports: 390, 768, 1100, and 1440 CSS pixels wide.
- Routes: home, commander detail, top commanders, changelog.
- States: light and dark modes, upload modal, settings/menu overlay.
- Card art and mana symbols are fixture images, so broken or simplified image rendering is only used as evidence for layout resilience, not production asset quality.
