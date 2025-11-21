# Commander Scout Architecture

This document describes the architecture, design decisions, and technical implementation of Commander Scout (edhrec-compare). It serves as a guide for contributors to understand how the application works and why certain architectural choices were made.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [State Management](#state-management)
4. [Data Flow](#data-flow)
5. [Design Decisions](#design-decisions)
6. [External Dependencies](#external-dependencies)
7. [Performance Considerations](#performance-considerations)
8. [Security](#security)

---

## Overview

### Application Purpose

Commander Scout is a specialized tool for Magic: The Gathering Commander players that helps them:

- **Compare EDHREC data** with their personal card collection
- **Search commanders** with fuzzy matching and partner combinations
- **View deck recommendations** filtered by budget, power bracket, and other criteria
- **Enrich card data** with pricing, images, and metadata from Scryfall
- **Export decklist data** for external use

### High-Level Architecture

Commander Scout is a **single-page application (SPA)** built with modern web technologies. The architecture follows these principles:

```
┌──────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                     (Vue 3 Components)                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────────────┐
│                   State Management Layer                     │
│              (Composables + Reactive State)                  │
└────────┬─────────────────────────────────┬───────────────────┘
         │                                 │
┌────────┴──────────┐           ┌─────────┴──────────┐
│   CSV Processing  │           │   API Integration  │
│   (In-Memory)     │           │   (EDHREC + SF)    │
└───────────────────┘           └────────────────────┘
```

**Key Characteristics:**

- **Client-side only** - No backend server, all processing in browser
- **In-memory state** - CSV data stored in browser memory (no persistence)
- **API-driven** - Data fetched from public EDHREC and Scryfall APIs
- **Progressive enhancement** - Works without JavaScript for basic HTML
- **Responsive design** - Tailwind CSS for mobile-first UI

### Key Technologies

| Technology          | Version | Purpose               | Why Chosen                                                                               |
| ------------------- | ------- | --------------------- | ---------------------------------------------------------------------------------------- |
| **Vue 3**           | 3.5.24  | UI Framework          | Modern, performant, excellent TypeScript support with Composition API                    |
| **TypeScript**      | 5.9.3   | Type Safety           | Catch errors at compile time, better IDE support, self-documenting code                  |
| **Vite** (Rolldown) | 7.2.2   | Build Tool            | Fast HMR, optimized builds, native ESM support. Using Rolldown variant for faster builds |
| **Tailwind CSS**    | 3.4.13  | Styling               | Utility-first, consistent design system, excellent for rapid prototyping                 |
| **VueUse**          | 14.0.0  | Composition Utilities | Battle-tested composables for common patterns (debounce, local storage, etc.)            |
| **Playwright**      | 1.56.1  | E2E Testing           | Modern, reliable browser automation for testing user flows                               |
| **Vitest**          | 4.0.12  | Unit Testing          | Fast, Vite-native test runner with excellent DX                                          |

_Note: Version numbers reflect the state at documentation time (2025-11-21). Check `package.json` for current versions._

---

## Directory Structure

```
src/
├── api/                    # External API integrations
│   ├── scryfallApi.ts     # Scryfall card data fetching & bulk operations
│   └── errorHandler.ts    # Centralized error handling with user notifications
│
├── components/            # Vue components organized by feature
│   ├── core/             # Reusable core components (CText, etc.)
│   ├── helpers/          # Component utilities (enums, icon maps)
│   ├── Card.vue          # Reusable card container with variants
│   ├── CardTable.vue     # Virtualized table for large card lists
│   ├── CommanderSearch.vue    # Fuzzy commander search with autocomplete
│   ├── EdhrecReader.vue       # Main EDHREC data fetching & display
│   ├── CSVUpload.vue          # CSV file parsing & validation
│   ├── Dashboard.vue          # Root layout component
│   ├── ToolkitHeader.vue      # Top navigation & filters
│   ├── GlobalNoticeStack.vue  # Toast notifications
│   ├── GlobalLoadingBanner.vue # Loading indicators
│   ├── NebulaBackground.vue   # Dynamic gradient background
│   └── [other components]
│
├── composables/          # Composition API reusable logic
│   ├── useTheme.ts              # Dark/light theme with localStorage persistence
│   ├── useBackgroundPreference.ts # Background animation toggle
│   ├── useCsvUpload.ts          # CSV data state management
│   ├── useGlobalLoading.ts      # Scoped loading indicators
│   ├── useGlobalNotices.ts      # Toast notification queue
│   ├── useOwnedFilter.ts        # Filter cards by ownership
│   ├── useCommanderColors.ts    # Extract commander color identity
│   └── useScryfallSymbols.ts    # Mana symbol SVG loading
│
├── utils/                # Pure utility functions
│   ├── slugifyCommander.ts  # Commander name → EDHREC slug conversion
│   ├── downloadTextFile.ts  # Client-side file download helper
│   └── errorHandler.ts      # Error formatting & logging
│
├── types/                # TypeScript type definitions
│   └── cards.ts         # Shared card data types
│
├── assets/              # Static assets
│   └── inventory.csv    # Sample CSV for users
│
├── stubs/               # Library stubs for tree-shaking
│   └── vue-router.ts   # Empty vue-router stub (no routing used)
│
├── App.vue             # Root component with analytics
├── main.ts             # Application entry point
└── style.css           # Global Tailwind styles
```

### Component Organization Philosophy

- **Flat structure** - Components in a single directory for easy discovery
- **Feature-based grouping** - Related components stay close (e.g., Commander\* components)
- **Core subfolder** - Only truly reusable, generic components
- **Helpers subfolder** - Non-component utilities used by multiple components

---

## State Management

### Composable-Based Global State

Commander Scout uses **Vue 3's Composition API** for state management instead of traditional state libraries like Vuex or Pinia. This approach provides:

✅ **Benefits:**

- Simpler mental model (just reactive refs)
- Better TypeScript inference
- Easier testing (pure functions)
- No boilerplate (actions, mutations, getters)
- Tree-shakeable (unused composables excluded from bundle)

### Why No Vuex/Pinia?

**Decision Rationale:**

1. **App complexity doesn't warrant it** - State is relatively simple (CSV data, UI preferences, loading flags)
2. **Composition API is sufficient** - Reactive refs + computed values handle all needs
3. **Bundle size** - Avoid adding 10-15KB for features we don't use
4. **Learning curve** - New contributors don't need to learn a state management library

### State Architecture

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    Application State                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Preferences (localStorage)                           │
│  ├─ Theme: "light" | "dark"                                │
│  └─ Background: enabled/disabled                           │
│                                                             │
│  CSV Data (in-memory)                                      │
│  ├─ Headers: string[]                                      │
│  └─ Rows: string[][]                                       │
│                                                             │
│  EDHREC State (transient)                                  │
│  ├─ Selected Commander: { name, colors, partner }         │
│  ├─ Filters: { bracket, modifier, pageType, companion }   │
│  └─ Cardlists: Array<{ header, cardviews[] }>            │
│                                                             │
│  UI State (transient)                                      │
│  ├─ Loading: Map<scope, count>                            │
│  ├─ Notices: Array<{ id, type, message, timeout }>       │
│  └─ Active Section: string                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### State Flow Diagram

```
User Action → Component Handler → Composable Function → Reactive State Update → UI Re-render
                                         ↓
                                   Side Effects
                                   (API calls, localStorage, etc.)
```

**Example: Theme Toggle**

```
User clicks theme button
  → Component calls toggleTheme()
  → useTheme composable updates ref
  → localStorage.setItem() persists choice
  → DOM class updated (light/dark)
  → All components re-render with new theme
```

---

## Data Flow

### 1. CSV Upload Flow

```
User selects CSV file
  ↓
CSVUpload.vue handles file input
  ↓
FileReader API reads file content
  ↓
Parse CSV into rows (detect "Name" column)
  ↓
Normalize card names (handle // for MDFCs)
  ↓
Store in useCsvUpload composable
  ↓
Components reactively filter based on owned cards
```

**Key Implementation Details:**

- CSV parsing is synchronous (happens in one tick)
- Normalization creates variants: `"Delver of Secrets"`, `"Insectile Aberration"`, `"Delver of Secrets // Insectile Aberration"`
- No backend storage - CSV data lives in browser memory only
- On page refresh, user must re-upload CSV

### 2. Commander Search Flow

```
User types commander name
  ↓
Debounced input (300ms)
  ↓
Scryfall autocomplete API call
  ↓
Filter results to legendary creatures
  ↓
Display dropdown with options
  ↓
User selects commander
  ↓
Build EDHREC slug (slugifyCommander + partner handling)
  ↓
Trigger EDHREC data fetch
```

### 3. EDHREC Data Fetch Flow

```
Commander selected + filters applied
  ↓
Construct EDHREC URL:
  https://json.edhrec.com/pages/{pageType}/{slug}/{bracket}/{modifier}/{companion}.json
  ↓
Fetch JSON from EDHREC
  ↓
Extract cardlists from response
  ↓
For each cardlist:
  ├─ Group cards by section (Creatures, Instants, etc.)
  ├─ Extract card names
  └─ Prepare for Scryfall enrichment
  ↓
Trigger bulk Scryfall fetch (next flow)
```

### 4. Scryfall Enrichment Flow

```
Have list of card names from EDHREC
  ↓
Sanitize names (remove // suffix for MDFCs)
  ↓
Batch into groups of 75 cards (Scryfall limit)
  ↓
For each batch:
  ├─ POST to /cards/collection
  ├─ Wait for response
  ├─ Pause 300ms (rate limiting)
  └─ Extract: prices, images, types, mana costs
  ↓
Map Scryfall data back to card names
  ↓
Handle double-faced cards:
  ├─ Register both face names
  └─ Store image_uris from card_faces array
  ↓
Store enriched data in component state
  ↓
Render tables with prices, images, ownership overlay
```

### 5. Export Flow

```
User clicks "Copy" or "Download"
  ↓
Filter cards by active ownership filter (owned/not owned/all)
  ↓
Format as decklist text:
  1x Card Name
  1x Another Card
  ↓
If Copy: navigator.clipboard.writeText()
If Download: Create blob + trigger download
  ↓
Show success notification
```

---

## Design Decisions

### 1. Why Vue 3 Composition API?

**Decision:** Use Vue 3 with Composition API exclusively (no Options API)

**Rationale:**

- **Better TypeScript support** - Type inference works naturally with composables
- **Code reusability** - Extract logic into functions, not mixins
- **Tree-shaking** - Unused composables don't bloat bundle
- **Testing** - Composables are just functions, easier to unit test
- **Future-proof** - Vue ecosystem moving toward Composition API

**Trade-offs:**

- ❌ Steeper learning curve for developers familiar with Options API
- ✅ Better long-term maintainability and testability

### 2. Why No Routing?

**Decision:** Single-page application with no routing library

**Rationale:**

- **Single focused task** - App has one primary view (commander comparison)
- **No distinct pages** - All state is in-memory, no shareable URLs needed
- **Bundle size** - Saves ~10KB from vue-router
- **Simplicity** - Less mental overhead for contributors

**Implementation:**

- Created `src/stubs/vue-router.ts` to satisfy library dependencies
- Vite alias resolves `vue-router` imports to stub during build

**When to reconsider:**

- If we add user accounts/authentication
- If we add distinct pages (settings, history, etc.)
- If we need shareable URLs for specific commanders

### 3. Why Rolldown Instead of Standard Vite?

**Decision:** Use `rolldown-vite` variant instead of official Vite package

**Rationale:**

- **Faster builds** - Rolldown is Rust-based bundler (faster than Rollup)
- **Compatibility** - Drop-in replacement for Vite (same API)
- **Bundle optimization** - Better tree-shaking and minification
- **Development speed** - Faster HMR during development

**Implementation:**

```json
{
  "dependencies": {
    "vite": "npm:rolldown-vite@7.2.2"
  },
  "overrides": {
    "vite": "npm:rolldown-vite@7.2.2"
  }
}
```

**Trade-offs:**

- ❌ Less mature than official Vite (potential edge case bugs)
- ✅ Significantly faster builds (1-2s vs 3-5s)

### 4. State Management Approach

**Decision:** Use module-level reactive refs instead of Vuex/Pinia

**Example Pattern:**

```typescript
// Composable pattern
const theme = ref<Theme>("light");

export const useTheme = () => {
  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };
  return { theme: readonly(theme), toggleTheme };
};
```

**Why this works:**

- Module-level refs are **singletons** (same instance across app)
- `readonly()` prevents external mutations
- Functions enforce validation and side effects
- Perfect for simple global state

### 5. Testing Strategy

**Decision:** Vitest for unit tests, Playwright for E2E tests

**Rationale:**

- **Vitest** - Fast, Vite-native, excellent Vue component testing support
- **Playwright** - Reliable, cross-browser, modern API
- **Coverage targets** - Aim for 80%+ on critical paths (API, composables, utils)

**Test Philosophy:**

- Unit test pure functions (utils, composables)
- Integration test components with dependencies
- E2E test critical user flows (CSV upload → search → export)
- Don't test implementation details (internal state)

---

## External Dependencies

### EDHREC JSON API

**Endpoint:** `https://json.edhrec.com/pages/`

**URL Pattern:**

```
/pages/{pageType}/{slug}/{bracket}/{modifier}/{companion}.json
```

**Parameters:**

- `pageType`: "commanders" | "average-decks"
- `slug`: Commander name (slugified, sorted for partners)
- `bracket`: "exhibition" | "core" | "upgraded" | "optimized" | "cedh" | "" (all)
- `modifier`: "budget" | "expensive" | "" (any)
- `companion`: "gyruda-companion" | "jegantha-companion" | etc. | "" (none)

**Example:**

```
https://json.edhrec.com/pages/commanders/atraxa-praetors-voice/core/budget.json
```

**Response Structure:**

```json
{
  "container": {
    "json_dict": {
      "cardlists": [
        {
          "header": "Creatures",
          "cardviews": [{ "id": "card-id", "name": "Card Name" }]
        }
      ]
    }
  }
}
```

**Rate Limiting:**

- No documented rate limit
- Recommendation: Avoid rapid-fire requests (respect server resources)

**Error Handling:**

- 404: Commander not found or invalid parameters
- 500: Server error (rare)
- Network errors: Show user-friendly message with retry option

### Scryfall API

**Base URL:** `https://api.scryfall.com`

**Endpoints Used:**

1. **Card Autocomplete** - `/cards/autocomplete?q={query}`
   - Returns partial matches for commander search
   - Limit: 20 results per request

2. **Named Card Lookup** - `/cards/named?fuzzy={name}`
   - Single card fetch by name
   - Handles fuzzy matching

3. **Bulk Card Fetch** - `/cards/collection` (POST)
   - Fetch up to 75 cards in one request
   - Body: `{ identifiers: [{ name: "Card Name" }, ...] }`

4. **Mana Symbols** - `/symbology`
   - Fetch SVG URIs for mana symbols
   - Cached after first load

**Rate Limiting Strategy:**

Scryfall requests ~10 requests/second, but we implement conservative rate limiting:

```typescript
// Batch size: 75 cards (API limit)
const BATCH_SIZE = 75;

// Delay between batches: 300ms
const BATCH_DELAY = 300;

// For 300 cards: 4 batches × 300ms = 1.2s total
```

**Why 300ms delay?**

- Respects Scryfall's guidelines (avoid hammering API)
- Provides better UX (progressive loading instead of all-or-nothing)
- Reduces risk of 429 (Too Many Requests) errors

**Error Handling:**

```typescript
// scryfallApi.ts - Error handling pattern
try {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return null; // Not found
    if (response.status === 429) throw new Error("Rate limit exceeded");
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  handleError(error, { notify: true, context: "Scryfall API" });
  return null;
}
```

**Caching Strategy:**

- No persistent cache (browser memory only)
- Same card fetched multiple times during session = multiple requests
- Future improvement: IndexedDB cache for frequently used cards

---

## Performance Considerations

### 1. Bundle Size Optimization

**Current Bundle Sizes:**

- JavaScript: ~179 KB (61 KB gzipped)
- CSS: ~37 KB (7 KB gzipped)
- Total: ~216 KB (68 KB gzipped)

**Optimization Techniques:**

1. **Tree-shaking**
   - Use ES modules for all imports
   - Avoid default exports (harder to tree-shake)
   - Stub unused libraries (vue-router)

2. **Code splitting**
   - Lazy load heavy components (not implemented yet)
   - Future: Split CSV parsing into separate chunk

3. **Dependency audit**
   - VueUse: Only import specific composables (not `@vueuse/core` bundle)
   - Tailwind: PurgeCSS removes unused utility classes

**Size Budget:**

- JavaScript: 200 KB (gzipped)
- CSS: 50 KB (gzipped)
- Monitored via `npm run size` (size-limit package)

### 2. Virtual Scrolling Strategy

**Current Implementation:** ❌ Not implemented yet

**Why needed:**

- EDHREC cardlists can have 100-500 cards
- Rendering 500+ DOM nodes causes jank
- Mobile devices especially struggle

**Planned Approach:**

```typescript
// Use @vueuse/core's useVirtualList
import { useVirtualList } from "@vueuse/core";

const { list, containerProps, wrapperProps } = useVirtualList(
  cards,
  { itemHeight: 60 } // Fixed row height
);
```

**Benefits:**

- Only render visible rows (~20 at a time)
- Smooth scrolling even with 1000+ cards
- Reduced memory usage

### 3. API Call Optimization

**Batching Strategy:**

```typescript
// Batch Scryfall calls (75 cards per request)
async function getCardsByNames(names: string[]) {
  const batches = chunk(names, 75);
  const results = [];

  for (const batch of batches) {
    const cards = await fetchBatch(batch);
    results.push(...cards);
    await delay(300); // Rate limiting
  }

  return results;
}
```

**Debouncing User Input:**

```typescript
// Commander search - wait for user to stop typing
const debouncedSearch = useDebounceFn(searchCommanders, 300);
```

**Lazy Loading:**

- Scryfall symbols loaded on-demand (when first card with symbol appears)
- Commander images loaded on-demand (after selection)

### 4. Rendering Optimization

**Computed Properties:**

```typescript
// Memoized card filtering
const filteredCards = computed(() => {
  if (!showOwned.value) return cards.value;
  return cards.value.filter((card) => ownedCards.has(card.name));
});
```

**v-show vs v-if:**

- `v-show` for frequently toggled elements (filters, modals)
- `v-if` for rarely toggled elements (error states)

**Key Attributes:**

```vue
<!-- Stable keys for efficient diffing -->
<div v-for="card in cards" :key="card.id"></div>
```

---

## Security

### Content Security Policy (CSP)

**Configuration:** `index.html`

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  connect-src 'self' 
              https://json.edhrec.com 
              https://api.scryfall.com 
              https://vercel.com;
  font-src 'self' data:;
"
/>
```

**Explanation:**

| Directive     | Value                    | Purpose                                                   |
| ------------- | ------------------------ | --------------------------------------------------------- |
| `default-src` | `'self'`                 | Only load resources from same origin by default           |
| `script-src`  | `'self' 'unsafe-inline'` | Allow inline scripts (required for Vite HMR in dev)       |
| `style-src`   | `'self' 'unsafe-inline'` | Allow inline styles (Tailwind JIT, Vue scoped styles)     |
| `img-src`     | `'self' data: https:`    | Allow images from any HTTPS source (Scryfall card images) |
| `connect-src` | `'self' + APIs`          | Whitelist API endpoints for fetch requests                |
| `font-src`    | `'self' data:`           | Allow embedded fonts (data URIs)                          |

**Why `'unsafe-inline'`?**

- Vite development server requires inline scripts for HMR
- Vue single-file components generate inline styles
- **Future improvement:** Use nonces for production builds

**Security Trade-offs:**

- ✅ Blocks XSS attacks from untrusted sources
- ✅ Prevents malicious script injection
- ❌ `'unsafe-inline'` weakens protection (acceptable for this app)

### Input Validation

**CSV Upload:**

```typescript
// Validate file size (prevent DoS)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

if (file.size > MAX_FILE_SIZE) {
  notifyError("File too large. Maximum size is 10 MB.");
  return;
}

// Validate file type
if (!file.name.endsWith(".csv")) {
  notifyError("Please upload a CSV file.");
  return;
}
```

**Commander Search:**

```typescript
// Sanitize input before API call
function sanitizeCardName(name: string): string {
  return name
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML
    .substring(0, 200); // Limit length
}
```

**URL Construction:**

```typescript
// Use encodeURIComponent to prevent injection
const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(sanitizedName)}`;
```

### API Key Management

**Current State:** ✅ No API keys required

- EDHREC JSON API is public (no authentication)
- Scryfall API is public (no authentication)
- Vercel Analytics uses public token (safe to expose)

**If API Keys Added in Future:**

1. Store in environment variables (`.env.local`)
2. Never commit to version control (`.gitignore`)
3. Use Vite's `import.meta.env` for access
4. Backend proxy for sensitive keys (if needed)

### Cross-Site Scripting (XSS) Prevention

**Vue's Built-in Protection:**

- Vue automatically escapes interpolated text (`{{ }}`)
- v-html directive **not used** in codebase
- User input never directly rendered as HTML

**Example Safe Pattern:**

```vue
<!-- Safe: Vue escapes card.name -->
<div>{{ card.name }}</div>

<!-- Unsafe: DO NOT DO THIS -->
<div v-html="card.name"></div>
```

### CORS Handling

**Scenario:** Fetching data from external APIs

**Solution:**

- EDHREC and Scryfall APIs allow cross-origin requests
- Both APIs include `Access-Control-Allow-Origin: *` header
- No proxy needed (simplifies deployment)

**If CORS issues arise:**

1. Add CORS proxy (e.g., `https://corsproxy.io`)
2. Deploy backend serverless function (Vercel, Netlify)
3. Request API owners to add our domain to whitelist

---

## Future Considerations

### Potential Improvements

1. **Virtual Scrolling**
   - Implement for CardTable component
   - Improves performance with 500+ card lists

2. **IndexedDB Caching**
   - Cache Scryfall card data locally
   - Reduces API calls for frequently viewed cards
   - Improves offline experience

3. **Service Worker**
   - Cache static assets for offline use
   - Background sync for API requests

4. **URL State Management**
   - Add routing for shareable commander URLs
   - Query params for filter state
   - Browser history for navigation

5. **Progressive Web App (PWA)**
   - Add manifest.json
   - Enable "Add to Home Screen"
   - Offline fallback page

6. **Accessibility Improvements**
   - Keyboard navigation for card tables
   - Screen reader announcements for loading states
   - ARIA labels for interactive elements

7. **Bundle Size Optimizations**
   - Lazy load heavy components
   - Split vendor chunks
   - Consider removing Vercel analytics for self-hosted version

---

## Contributing

When contributing to Commander Scout, please keep this architecture in mind:

1. **Follow the Composition API pattern** - Use composables for shared logic
2. **Keep components focused** - Single responsibility principle
3. **Test critical paths** - API calls, composables, utils
4. **Document design decisions** - Update this file for significant changes
5. **Respect the CSP** - Don't add inline event handlers or eval()

For questions or clarification on architectural decisions, open an issue with the `question` label.

---

**Last Updated:** 2025-11-21  
**Maintainers:** Commander Scout Team
