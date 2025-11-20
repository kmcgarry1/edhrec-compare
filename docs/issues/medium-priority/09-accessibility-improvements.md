# ♿ Improve accessibility with keyboard navigation and ARIA

**Labels:** `accessibility`, `medium-priority`

## Problem
While some ARIA attributes exist, comprehensive accessibility has not been audited:
- Keyboard navigation not fully tested
- Screen reader experience unknown
- Focus management may have gaps
- Color contrast not verified

## Impact
- May not be usable by screen reader users
- Keyboard-only users may struggle
- WCAG compliance unknown
- Legal/ethical concerns

## Proposed Solution

### 1. Audit with Tools
- Run axe-DevTools
- Test with NVDA/JAWS screen reader
- Test keyboard-only navigation
- Check color contrast ratios

### 2. Keyboard Navigation
Ensure all interactive elements accessible via keyboard:
- Tab order logical
- Focus visible
- Esc to close modals
- Enter to activate buttons
- Arrow keys for lists/navigation

### 3. ARIA Improvements
- Add `aria-label` where needed
- Use `aria-live` for loading states
- Add `aria-describedby` for form fields
- Proper heading hierarchy (h1, h2, h3)

### 4. Focus Management
- Trap focus in modals
- Return focus after modal close
- Focus first error on validation
- Skip links for navigation

### 5. Screen Reader Testing
Test key flows with screen reader:
- Uploading CSV
- Searching commander
- Applying filters
- Exporting decklist

### 6. Add Accessibility Tests
```typescript
// tests/e2e/accessibility.spec.ts
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Tab through interactive elements
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Upload CSV');
  
  // More keyboard tests...
});
```

## Success Criteria
- No critical axe violations
- All features keyboard accessible
- Screen reader can complete key tasks
- WCAG 2.1 AA compliance
- Focus management works correctly

## References
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vue A11y Guidelines](https://vue-a11y.com/)
- [axe-core](https://github.com/dequelabs/axe-core)
