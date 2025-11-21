# Accessibility Guide

Commander Scout has been designed with accessibility in mind to ensure all users can effectively use the application, regardless of their abilities or the assistive technologies they use.

## Table of Contents

1. [Keyboard Navigation](#keyboard-navigation)
2. [Screen Reader Support](#screen-reader-support)
3. [Focus Management](#focus-management)
4. [ARIA Attributes](#aria-attributes)
5. [Testing Accessibility](#testing-accessibility)

## Keyboard Navigation

The application is fully navigable using only a keyboard. All interactive elements can be reached and activated using standard keyboard controls.

### Global Keyboard Shortcuts

- **Tab**: Move focus to the next interactive element
- **Shift + Tab**: Move focus to the previous interactive element
- **Enter**: Activate buttons and links
- **Space**: Activate buttons and checkboxes
- **Escape**: Close open modals and dialogs

### Specific Component Shortcuts

#### Modals and Dialogs

- Press **Escape** to close any open modal (Onboarding, CSV Upload, Cardlist Navigation)
- Focus is automatically trapped within modals - Tab will cycle through only the elements within the modal
- When a modal closes, focus returns to the element that opened it

#### Commander Search

- Type in the search field to trigger autocomplete results
- Use **Tab** to move through search results
- Press **Enter** or **Space** to select a result from the list
- Use **Clear** button or **Backspace** to remove selection

#### Toolkit Header

- **Tab** through all control buttons (Hide, Theme Toggle, Background Toggle, Upload CSV)
- Press **Enter** or **Space** to activate any button
- Filter buttons (Owned/Unowned/Show All) can be toggled with **Enter** or **Space**

#### Card Lists

- Navigate between cardlist sections using the floating navigation buttons
- On mobile, open the navigation drawer with the menu button
- Use **Tab** to move between navigation items
- Press **Enter** to jump to a specific cardlist section

## Screen Reader Support

Commander Scout provides comprehensive screen reader support with proper semantic HTML and ARIA attributes.

### Announced Content

The following content is announced to screen readers:

- **Loading states**: When data is being fetched or processed (aria-live="polite")
- **Error messages**: Critical errors are announced with higher priority (aria-live="assertive", role="alert")
- **Success notifications**: CSV uploads and other successful operations
- **Dynamic search results**: Commander search results as they appear
- **Modal dialogs**: Proper announcement when dialogs open with title and description

### Button Labels

All icon-only buttons include descriptive aria-labels:

- Theme toggle: "Switch to light/dark theme"
- Background toggle: "Show/Hide nebula background"
- Upload button: "Upload CSV collection file"
- Hide toolkit: "Hide toolkit"
- Close buttons: "Close [dialog name]"
- Clear buttons: "Clear [field name] selection"

### Form Fields

All form fields include:

- **Labels**: Visible labels using `<label>` elements or aria-label
- **Helper text**: Connected via aria-describedby to provide additional context
- **Error messages**: Connected via aria-describedby and marked with role="alert"

## Focus Management

### Focus Indicators

All interactive elements have visible focus indicators:

- Focus rings appear with the Tailwind `focus-visible:ring-2` utility
- Custom emerald-colored rings (`ring-emerald-400/70`) for brand consistency
- High contrast focus states for visibility in both light and dark modes

### Focus Trapping

Modals implement focus trapping to prevent users from tabbing outside:

- Tab and Shift+Tab cycle through only the focusable elements within the modal
- First element receives focus when modal opens
- Last element cycles back to first element when tabbing forward
- First element cycles back to last element when tabbing backward

### Focus Restoration

When a modal closes, focus is automatically returned to:

- The button that triggered the modal opening
- Or the previously focused element before the modal opened

This ensures users don't lose their place in the application.

## ARIA Attributes

### Dialog/Modal Attributes

All modals include:

```html
role="dialog" aria-modal="true" aria-labelledby="[heading-id]" aria-describedby="[description-id]"
```

### Live Regions

Dynamic content uses appropriate aria-live values:

- **polite**: For loading states, search results, and informational updates
- **assertive**: For critical errors that require immediate attention

### Button States

Toggle buttons include:

```html
aria-pressed="true|false"
```

Filter buttons include both:

```html
aria-label="Show [filter type] cards" aria-pressed="true|false"
```

### Navigation

Navigation components include:

```html
<nav aria-label="[Descriptive label]">role="group" aria-label="[Group description]"</nav>
```

## Testing Accessibility

### Automated Testing

Run the accessibility E2E tests:

```bash
npm run test:e2e -- accessibility.spec.ts
```

These tests verify:

- Keyboard navigation works correctly
- Escape key closes modals
- Focus trap works in modals
- ARIA attributes are present
- Form fields have proper descriptions
- Loading states use aria-live regions

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] Can you navigate the entire app using only Tab/Shift+Tab?
- [ ] Can you activate all buttons with Enter or Space?
- [ ] Does Escape close all modals?
- [ ] Can you see which element has focus at all times?

#### Screen Reader Testing

- [ ] Are all buttons and links announced with clear labels?
- [ ] Are loading states announced?
- [ ] Are error messages announced immediately?
- [ ] Are form field instructions read when focusing the field?
- [ ] Are modal titles and descriptions announced when opening?

#### Focus Management

- [ ] Does focus trap work in all modals?
- [ ] Does focus return to the trigger element when closing modals?
- [ ] Can you Tab through all elements in modals without escaping?

### Recommended Testing Tools

- **axe DevTools**: Browser extension for automated accessibility scanning
- **NVDA** (Windows): Free open-source screen reader
- **JAWS** (Windows): Professional screen reader
- **VoiceOver** (macOS/iOS): Built-in screen reader
- **Lighthouse**: Built into Chrome DevTools, includes accessibility audit

### Testing with Screen Readers

#### NVDA (Windows)

1. Download from https://www.nvaccess.org/
2. Start NVDA
3. Navigate with Tab and read with Down arrow
4. Test all major workflows:
   - Uploading CSV
   - Searching commanders
   - Applying filters
   - Navigating card lists

#### VoiceOver (macOS)

1. Enable in System Preferences > Accessibility
2. Start with Cmd+F5
3. Use Ctrl+Option+Arrow keys to navigate
4. Test all major workflows

## Known Limitations

- Color contrast has not been formally tested against WCAG 2.1 AA standards
- Some complex data tables may need additional ARIA table attributes
- Mobile touch target sizes should be verified for WCAG compliance

## Future Improvements

- Add skip navigation links
- Implement keyboard shortcuts reference (? key to show shortcuts)
- Add high contrast mode
- Test with additional screen readers (TalkBack, ChromeVox)
- Add ARIA landmarks for better page structure navigation
- Implement reduced motion preferences for animations

## WCAG 2.1 Compliance

Commander Scout aims to meet WCAG 2.1 Level AA standards:

### Currently Implemented

- ✅ Keyboard accessibility (2.1.1, 2.1.2)
- ✅ Focus visible (2.4.7)
- ✅ Focus order (2.4.3)
- ✅ Labels or instructions (3.3.2)
- ✅ Name, Role, Value (4.1.2)
- ✅ Status messages (4.1.3)

### Needs Verification

- ⚠️ Color contrast (1.4.3) - Not yet tested with automated tools
- ⚠️ Text spacing (1.4.12) - Should be tested at 200% zoom
- ⚠️ Reflow (1.4.10) - Should be tested at 400% zoom

## Contributing

When adding new features, please:

1. Ensure all interactive elements are keyboard accessible
2. Add appropriate ARIA labels to icon-only buttons
3. Use semantic HTML elements (button, nav, main, etc.)
4. Test with keyboard navigation before submitting PR
5. Include aria-describedby for form fields with helper text
6. Add aria-live regions for dynamic content
7. Implement focus trapping for new modals using `useFocusTrap` composable

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vue A11y Guidelines](https://vue-a11y.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [The A11Y Project](https://www.a11yproject.com/)

## Support

If you encounter accessibility issues, please:

1. Open a GitHub issue with the "accessibility" label
2. Provide details about your assistive technology
3. Include steps to reproduce the issue
4. Suggest improvements if possible

We are committed to making Commander Scout accessible to everyone.
