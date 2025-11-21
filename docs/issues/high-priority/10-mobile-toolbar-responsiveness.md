# Mobile Toolbar Responsiveness

**Priority:** High  
**Type:** UX Enhancement  
**Component:** ToolkitHeader  
**Effort:** Medium (1-3 days)

## Problem

The toolkit header contains 6+ interactive elements (Hide, Dark/Light toggle, Hide BG, Upload CSV, plus filter buttons and export options) that become cramped and difficult to use on mobile screens (< 640px width).

### Current Issues

- Touch targets are smaller than the recommended 44×44px minimum
- Buttons with text labels ("Hide BG", "Show All") truncate or wrap awkwardly
- Horizontal space is insufficient for all controls
- Information overload in limited mobile viewport
- Toolbar can cause horizontal scrolling on narrow screens

### User Impact

- **High:** Mobile users struggle to tap small buttons accurately
- Frequently miss-tapping adjacent buttons
- Need to pinch-zoom to interact with toolbar
- Poor first impression on mobile devices
- Reduced accessibility for users with motor impairments

## Screenshots

- [Mobile cramped toolbar](https://github.com/user-attachments/assets/8b32ef9f-2f8c-4958-9829-501ce3b25d61)
- [Main interface desktop](https://github.com/user-attachments/assets/45f1f1e9-f478-4aa9-a40f-083ef4c8b453)

## Proposed Solution

### Mobile-First Redesign

1. **Responsive Hamburger Menu** (< 640px)
   - Replace toolbar with hamburger icon in top-right
   - Slide-out drawer or overlay menu for controls
   - Group related controls together
   - Use full-width buttons in menu (easy to tap)

2. **Icon-Only Buttons with Tooltips** (640px-1024px)
   - Remove text labels on medium screens
   - Keep icons only (moon/sun, palette, upload)
   - Add tooltips on hover/long-press
   - Maintain 44×44px minimum tap targets

3. **Bottom Navigation Alternative**
   - Consider bottom sheet for mobile (familiar pattern)
   - Primary actions: Upload CSV, Theme, Filters
   - Swipe up to reveal, swipe down to dismiss
   - Persistent mini-bar when collapsed

4. **Consolidated Actions**
   - Group theme settings (dark mode + background) into submenu
   - Combine export options into single dropdown
   - Move ownership filters to dedicated section (not toolbar)

### Implementation Steps

1. Add new mobile breakpoint detection composable
2. Create `MobileToolbar.vue` component variant
3. Implement hamburger menu with slide-out drawer
4. Add touch-friendly button sizing (min 44px)
5. Test on physical devices (iOS Safari, Chrome Android)
6. Add gesture support (swipe to open/close)

### Responsive Breakpoint Strategy

```typescript
// Pseudocode
if (viewport < 640px) {
  // Mobile: Hamburger menu, bottom sheet, or minimal icons
  showMobileMenu = true;
} else if (viewport < 1024px) {
  // Tablet: Icon-only buttons with tooltips
  showIconsOnly = true;
} else {
  // Desktop: Full toolbar with labels
  showFullToolbar = true;
}
```

## Technical Considerations

### Files to Modify

- `src/components/ToolkitHeader.vue` - Make responsive or split into variants
- `src/components/Dashboard.vue` - Handle mobile menu state
- `tailwind.config.cjs` - Ensure breakpoints align
- Consider new `MobileToolbar.vue` component

### CSS/Tailwind Approach

```vue
<!-- Example pattern -->
<div class="hidden md:flex gap-2">
  <!-- Desktop buttons with labels -->
</div>
<div class="flex md:hidden">
  <!-- Mobile hamburger icon -->
</div>
```

### Touch Target Standards

- Minimum 44×44px (iOS, Android)
- 48×48px preferred (Material Design)
- Adequate spacing between targets (8px+)

## Acceptance Criteria

- [ ] All toolbar buttons meet 44×44px minimum touch target on mobile
- [ ] No horizontal scrolling on any mobile screen size (320px+)
- [ ] Hamburger menu opens smoothly (< 200ms transition)
- [ ] All features accessible in mobile layout
- [ ] Toolbar tested on iOS Safari and Chrome Android
- [ ] Focus management works in mobile menu
- [ ] Swipe gesture optional enhancement implemented
- [ ] Visual regression tests updated for mobile variants

## Alternatives Considered

1. **Horizontal scroll toolbar** - Dismissed: Poor UX, not discoverable
2. **Multi-row toolbar** - Dismissed: Takes too much vertical space
3. **Accordion sections** - Considered: Could work for filters only
4. **Tab-based interface** - Dismissed: Adds complexity
5. **Floating action button (FAB)** - Considered: For primary action only

## Related Issues

- #TBD-visual-hierarchy (button prominence)
- #TBD-information-density (overall spacing)
- #TBD-mobile-ux (broader mobile improvements)
- docs/issues/medium-priority/09-accessibility-improvements.md (touch targets)

## References

- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [WCAG 2.5.5 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
