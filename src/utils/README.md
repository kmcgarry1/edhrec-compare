# Utilities

This directory contains pure utility functions with no Vue dependencies. These functions are framework-agnostic and can be used in any JavaScript/TypeScript context.

## Overview

Utilities are organized by domain:

- **Text manipulation** - slugifyCommander
- **File operations** - downloadTextFile, csvValidator
- **Animation** - animations, timing utilities
- **Error handling** - errorHandler, sentry integration
- **Type guards** - Type checking and validation

## Files

### `slugifyCommander.ts`

Commander name normalization for EDHREC URL generation.

**Functions:**

- `slugifyCommander(name)` - Convert name to URL-safe slug
- `buildCommanderSlug(primary, partner?)` - Build slug for single or partner commanders

**Example:**

```typescript
import { slugifyCommander, buildCommanderSlug } from "@/utils/slugifyCommander";

// Single commander
slugifyCommander("Atraxa, Praetors' Voice");
// Returns: "atraxa-praetors-voice"

// Partner commanders (automatically sorted)
buildCommanderSlug("Thrasios, Triton Hero", "Tymna the Weaver");
// Returns: "thrasios-triton-hero-tymna-the-weaver"
```

**Normalization Rules:**

- Converts to lowercase
- Replaces spaces and commas with hyphens
- Removes special characters and apostrophes
- Replaces `&` with `and`
- Removes consecutive hyphens
- Trims leading/trailing hyphens
- Partner slugs are sorted alphabetically

### `csvValidator.ts`

CSV file structure validation for card inventory uploads.

**Functions:**

- `validateCsv(headers, rows)` - Validate CSV structure and content

**Returns:**

```typescript
interface CsvValidationResult {
  valid: boolean; // Whether CSV passes all checks
  errors: string[]; // Critical errors preventing processing
  warnings: string[]; // Non-critical issues
}
```

**Validation Checks:**

- Header presence
- "Name" column detection (case-insensitive)
- Empty row detection
- Column count consistency
- Minimum row count

**Example:**

```typescript
import { validateCsv } from "@/utils/csvValidator";

const result = validateCsv(
  ["Name", "Quantity"],
  [
    ["Sol Ring", "1"],
    ["Lightning Bolt", "4"],
  ]
);

if (!result.valid) {
  result.errors.forEach((err) => console.error(err));
}
result.warnings.forEach((warn) => console.warn(warn));
```

### `downloadTextFile.ts`

Browser file download utility using Blob API.

**Functions:**

- `downloadTextFile(content, filename)` - Trigger file download

**Example:**

```typescript
import { downloadTextFile } from "@/utils/downloadTextFile";

// Download decklist
const decklist = cards.map((c) => `1 ${c.name}`).join("\n");
downloadTextFile(decklist, "my-deck.txt");

// Download CSV export
const csv = "Name,Quantity\n" + cards.map((c) => `${c.name},${c.qty}`).join("\n");
downloadTextFile(csv, "inventory.csv");
```

**Features:**

- Creates temporary Blob and anchor element
- Triggers browser download dialog
- Automatically cleans up object URL
- SSR-safe (checks for `document` existence)

### `animations.ts`

Animation utilities and timing helpers following Material Design principles.

**Constants:**

```typescript
// Durations (milliseconds)
durations = {
  instant: 100,
  quick: 200,
  standard: 300,
  emphasis: 500,
  slow: 600,
};

// Easing functions
easings = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)", // Enter animations
  accelerate: "cubic-bezier(0.4, 0, 1, 1)", // Exit animations
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};
```

**Functions:**

- `getStaggerDelay(index, baseDelay?, maxDelay?)` - Calculate staggered animation delays
- `applyTransition(element, styles, transition)` - Apply CSS transition with styles
- `createRipple(x, y)` - Create ripple effect object
- `getRippleCoordinates(event)` - Extract ripple position from click
- `prefersReducedMotion()` - Check user motion preferences
- `getAccessibleDuration(duration)` - Adjust duration for accessibility

**Example:**

```typescript
import { getStaggerDelay, durations, easings, prefersReducedMotion } from "@/utils/animations";

// Stagger list item animations
items.forEach((item, i) => {
  item.style.animationDelay = `${getStaggerDelay(i)}ms`;
});

// Apply transition
const duration = prefersReducedMotion() ? 1 : durations.standard;
element.style.transition = `all ${duration}ms ${easings.decelerate}`;
```

### `errorHandler.ts`

Application error handling with user notifications and error tracking.

**Exports:**

- `AppError` - Custom error class with user messages
- `handleError(error, options)` - Normalize and handle errors
- `installGlobalErrorHandler(app)` - Install Vue error handler

**AppError Example:**

```typescript
import { AppError } from "@/utils/errorHandler";

// Throw custom error with user message
throw new AppError(
  "Database connection failed", // Internal message (logged)
  "Unable to load data", // User message (shown in toast)
  "DB_CONNECTION_ERROR" // Optional error code
);
```

**Error Handling:**

```typescript
import { handleError } from "@/utils/errorHandler";

try {
  await riskyOperation();
} catch (error) {
  handleError(error, {
    notify: true,
    fallbackMessage: "Operation failed",
    context: "ComponentName",
  });
}
```

**Global Handler Installation:**

```typescript
// main.ts
import { installGlobalErrorHandler } from "@/utils/errorHandler";

const app = createApp(App);
installGlobalErrorHandler(app);
```

### `sentry.ts`

Sentry error tracking integration for production environments.

**Functions:**

- `initSentry(app)` - Initialize Sentry (production only)
- `captureError(error, context?)` - Send error to Sentry
- `setUserContext(user)` - Set user info (no PII!)
- `clearUserContext()` - Clear user info

**Setup:**

```typescript
// main.ts
import { initSentry } from "@/utils/sentry";

const app = createApp(App);

if (import.meta.env.PROD) {
  initSentry(app);
}
```

**Privacy Protection:**

- Masks all text in session replays
- Blocks all media in session replays
- Filters CSV data from breadcrumbs
- Removes sensitive context data
- Only captures 10% of errors

## Testing

All utilities have unit tests in `tests/unit/utils/`. Tests verify:

- Input/output correctness
- Edge case handling
- Error conditions
- SSR compatibility (where applicable)

## Best Practices

### Pure Functions

All utilities should be pure functions when possible:

```typescript
// Good - pure function
export const slugify = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, "-");
};

// Avoid - side effects in utility
export const logAndSlugify = (text: string): string => {
  console.log(text); // Side effect!
  return text.toLowerCase().replace(/\s+/g, "-");
};
```

### Type Safety

Always provide TypeScript types:

```typescript
// Good - explicit types
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

// Avoid - implicit any
export const formatNumber = (value, decimals = 2) => {
  return value.toFixed(decimals);
};
```

### SSR Safety

Check for browser APIs:

```typescript
// Good - SSR-safe
export const download = (content: string, filename: string) => {
  if (typeof document === "undefined") {
    return; // or throw descriptive error
  }
  // ... browser code
};

// Avoid - assumes browser
export const download = (content: string, filename: string) => {
  const link = document.createElement("a"); // Crashes on SSR
};
```

### Documentation

Document all public functions with JSDoc:

````typescript
/**
 * Convert card name to URL-safe slug
 *
 * @param name - Card name to normalize
 * @returns Normalized slug string
 *
 * @example
 * ```typescript
 * slugify('Lightning Bolt');
 * // Returns: "lightning-bolt"
 * ```
 */
export const slugify = (name: string): string => {
  // ...
};
````

## Related Documentation

- **Material Design Motion**: https://m3.material.io/styles/motion
- **Web Animations API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- **Blob API**: https://developer.mozilla.org/en-US/docs/Web/API/Blob
- **Sentry**: https://docs.sentry.io/platforms/javascript/guides/vue/
