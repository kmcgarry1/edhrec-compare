#!/bin/bash

# Script to create GitHub issues from comprehensive app reviews
# This creates issues for Performance, Security, Functionality, Compatibility,
# Compliance, Analytics/Monitoring, and Marketing/Content reviews

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Creating GitHub Issues from Comprehensive Reviews   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}\n"

# Counter for created issues
CREATED=0
FAILED=0

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local priority="$4"
    
    echo -e "${YELLOW}Creating issue: ${NC}$title"
    echo -e "${YELLOW}Labels: ${NC}$labels"
    echo -e "${YELLOW}Priority: ${NC}$priority\n"
    
    if gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels"; then
        echo -e "${GREEN}✓ Successfully created issue${NC}\n"
        ((CREATED++))
    else
        echo -e "${RED}✗ Failed to create issue${NC}\n"
        ((FAILED++))
    fi
}

# ============================================================================
# PERFORMANCE ISSUES (#76-#80)
# ============================================================================

echo -e "${BLUE}═══ Performance Issues (5) ===${NC}\n"

# #76 - Implement IndexedDB Caching
create_issue \
    "Implement IndexedDB Caching for API Responses" \
    "## Problem

Currently, every commander search triggers fresh API requests to EDHREC and Scryfall, even for frequently accessed commanders. This results in:
- Unnecessary bandwidth usage
- Slower repeat visits
- Poor offline experience
- Higher API load

**Cache hit rate: 0%**

## Solution

Implement IndexedDB-based caching for:
1. EDHREC JSON responses (7 days TTL)
2. Scryfall card data (30 days TTL)
3. Commander search results

## Expected Impact

- 80% reduction in API calls for repeat views
- Sub-500ms load time for cached commanders
- Foundation for offline PWA support
- Reduced bandwidth costs

## Implementation

\`\`\`typescript
// src/composables/useCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

async function getCached<T>(key: string): Promise<T | null> {
  const entry = await db.cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    await db.cache.delete(key);
    return null;
  }
  
  return entry.data;
}

async function setCached<T>(key: string, data: T, ttl: number) {
  await db.cache.put({
    key,
    data,
    timestamp: Date.now(),
    ttl
  });
}
\`\`\`

## Acceptance Criteria

- [ ] IndexedDB schema created
- [ ] Cache wrapper composable implemented
- [ ] EDHREC responses cached (7 day TTL)
- [ ] Scryfall responses cached (30 day TTL)
- [ ] Cache invalidation working
- [ ] Graceful degradation for Safari Private Mode
- [ ] Cache hit rate > 70% for repeat visits
- [ ] Tests for caching logic

## References

- Performance Review: docs/PERFORMANCE_REVIEW.md
- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" \
    "performance,high-priority,enhancement" \
    "high"

# #77 - Virtual Scrolling for Card Tables
create_issue \
    "Implement Virtual Scrolling for Large Card Tables" \
    "## Problem

Card tables with 500+ cards render all rows simultaneously, causing:
- Scroll performance degradation (30-45 FPS)
- High memory usage
- Laggy user experience on lower-end devices

## Solution

Implement virtual scrolling to render only visible rows plus a buffer.

## Expected Impact

- 60% reduction in render time for large lists
- Consistent 60 FPS scrolling
- 50% reduction in memory usage
- Better mobile performance

## Implementation

Use \`vue-virtual-scroller\` or similar:

\`\`\`vue
<template>
  <RecycleScroller
    :items=\"cards\"
    :item-size=\"80\"
    key-field=\"name\"
    v-slot=\"{ item }\"
  >
    <ScryfallCardRow :card=\"item\" />
  </RecycleScroller>
</template>
\`\`\`

## Acceptance Criteria

- [ ] Virtual scrolling library integrated
- [ ] Card tables use virtual scrolling
- [ ] Scroll FPS maintains 60 FPS with 500+ cards
- [ ] Memory usage reduced
- [ ] Works on mobile devices
- [ ] No visual glitches
- [ ] Tests for scrolling behavior

## References

- Performance Review: docs/PERFORMANCE_REVIEW.md
- vue-virtual-scroller: https://github.com/Akryum/vue-virtual-scroller" \
    "performance,high-priority,enhancement" \
    "high"

# #78 - Code Splitting and Lazy Loading
create_issue \
    "Enable Code Splitting and Lazy Loading" \
    "## Problem

All components are bundled together (201 KB JS), causing:
- Slower initial load (4.5s TTI on 3G)
- Users download unused features
- Poor Core Web Vitals scores

## Solution

Implement code splitting for:
1. CSV upload modal (lazy load)
2. Scryfall enrichment features (lazy load)
3. Vendor chunks (separate bundle)

## Expected Impact

- 40% reduction in initial bundle size (201 KB → 120 KB)
- Faster time-to-interactive (4.5s → 2.5s on 3G)
- Better Core Web Vitals
- Improved Lighthouse scores

## Implementation

\`\`\`typescript
// Lazy load components
const CSVUpload = defineAsyncComponent(() =>
  import('./components/CSVUpload.vue')
);

// Vite config for chunking
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue'],
          'scryfall': ['./src/api/scryfallApi.ts']
        }
      }
    }
  }
});
\`\`\`

## Acceptance Criteria

- [ ] CSV upload modal lazy loaded
- [ ] Initial bundle < 150 KB JavaScript
- [ ] TTI < 3s on 3G connections
- [ ] No broken imports
- [ ] Lighthouse Performance score > 90
- [ ] Bundle analysis shows proper splitting

## References

- Performance Review: docs/PERFORMANCE_REVIEW.md
- Vite Code Splitting: https://vitejs.dev/guide/features.html#async-chunk-loading" \
    "performance,high-priority,enhancement" \
    "high"

# #79 - API Request Deduplication
create_issue \
    "Implement API Request Deduplication" \
    "## Problem

Rapid filter changes or multiple component requests can trigger duplicate API calls, wasting bandwidth and potentially hitting rate limits.

## Solution

Implement request deduplication to cache in-flight requests and return same promise for duplicate requests.

## Expected Impact

- 20% reduction in API calls
- Better API rate limit compliance
- Reduced bandwidth usage

## Implementation

\`\`\`typescript
const inFlightRequests = new Map<string, Promise<any>>();

async function deduplicatedFetch(url: string) {
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }
  
  const promise = fetch(url).then(r => r.json());
  inFlightRequests.set(url, promise);
  
  promise.finally(() => {
    inFlightRequests.delete(url);
  });
  
  return promise;
}
\`\`\`

## Acceptance Criteria

- [ ] Request deduplication implemented
- [ ] Works with EDHREC API
- [ ] Works with Scryfall API
- [ ] Duplicate requests return same promise
- [ ] In-flight cache cleaned up
- [ ] Tests for deduplication logic

## References

- Performance Review: docs/PERFORMANCE_REVIEW.md" \
    "performance,medium-priority,enhancement" \
    "medium"

# #80 - PWA and Offline Support
create_issue \
    "Implement PWA and Offline Support" \
    "## Problem

Application has no offline functionality and isn't installable as a PWA. Users must be online and visit the website every time.

## Solution

Implement Progressive Web App features:
1. Service worker for offline functionality
2. Web app manifest for installability
3. Offline fallback for cached data

## Expected Impact

- Instant repeat loads (cached assets)
- \"Add to Home Screen\" capability
- Basic offline functionality
- Better mobile experience

## Implementation

\`\`\`typescript
// vite-plugin-pwa configuration
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Commander Scout',
        short_name: 'CmdScout',
        theme_color: '#10b981',
        icons: [/* ... */]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/api\\.scryfall\\.com\\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ]
});
\`\`\`

## Acceptance Criteria

- [ ] Service worker registered
- [ ] Manifest file created
- [ ] \"Add to Home Screen\" works
- [ ] Cached assets load offline
- [ ] Cached API responses work offline
- [ ] Offline fallback message shown
- [ ] Works on iOS and Android

## References

- Performance Review: docs/PERFORMANCE_REVIEW.md
- vite-plugin-pwa: https://vite-pwa-org.netlify.app/" \
    "performance,medium-priority,enhancement,pwa" \
    "medium"

# ============================================================================
# SECURITY ISSUES (#81-#86)
# ============================================================================

echo -e "${BLUE}═══ Security Issues (6) ===${NC}\n"

# #81 - Implement Content Security Policy
create_issue \
    "Implement Content Security Policy (CSP)" \
    "## Problem

No Content Security Policy configured, leaving application vulnerable to:
- XSS attacks through compromised dependencies
- Injection through malicious CSV files
- Inline script execution from third parties

## Solution

Implement strict CSP via meta tag:

\`\`\`html
<meta http-equiv=\"Content-Security-Policy\" content=\"
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://cards.scryfall.io https://c2.scryfall.com;
  connect-src 'self' https://api.scryfall.com https://json.edhrec.com https://o4507992945205248.ingest.us.sentry.io;
  font-src 'self';
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
\">
\`\`\`

## Expected Impact

- Defense-in-depth against XSS
- Protection against malicious CSV payloads
- Better security posture
- Compliance with security best practices

## Acceptance Criteria

- [ ] CSP meta tag added to index.html
- [ ] All legitimate resources whitelisted
- [ ] CSP violations logged (report-uri)
- [ ] No console CSP errors in normal operation
- [ ] Tested on all major browsers
- [ ] Inline scripts eliminated or nonce-based

## References

- Security Review: docs/SECURITY_REVIEW.md
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" \
    "security,high-priority,enhancement" \
    "high"

# #82 - Sanitize CSV Input Data
create_issue \
    "Sanitize CSV Input Data to Prevent XSS" \
    "## Problem

CSV data is parsed without sanitization. Malicious CSV files could contain:
- XSS payloads in card names
- HTML injection
- Script execution

**Attack Vector:**
\`\`\`csv
Name,Quantity
<img src=x onerror=alert('XSS')>,1
<script>alert('XSS')</script>,1
\`\`\`

## Solution

Sanitize all CSV input before rendering using DOMPurify:

\`\`\`typescript
import DOMPurify from 'dompurify';

function sanitizeCardName(name: string): string {
  return DOMPurify.sanitize(name, { ALLOWED_TAGS: [] });
}
\`\`\`

## Expected Impact

- Prevention of XSS through CSV upload
- Better security posture
- Protection of user data
- Compliance with security best practices

## Acceptance Criteria

- [ ] DOMPurify installed and configured
- [ ] All CSV input sanitized before use
- [ ] Card names validated against expected patterns
- [ ] XSS payloads in CSV files neutralized
- [ ] Tests for XSS prevention
- [ ] No impact on legitimate card names

## References

- Security Review: docs/SECURITY_REVIEW.md
- DOMPurify: https://github.com/cure53/DOMPurify" \
    "security,high-priority,bug,xss" \
    "high"

# #83 - Secure Client-Side Storage Strategy
create_issue \
    "Define Secure Client-Side Storage Strategy" \
    "## Problem

Future caching implementation needs secure storage strategy:
- CSV inventory data could be sensitive
- Browser extensions can read localStorage
- IndexedDB not encrypted by default

## Solution

Document and implement secure storage guidelines:
1. Only cache public API responses
2. Never store user's CSV inventory persistently
3. Use session-only storage for user data
4. Clear cache on browser close

## Implementation

\`\`\`typescript
// Storage policy
const STORAGE_POLICY = {
  // Safe to cache (public data)
  SAFE: ['edhrec-api', 'scryfall-api', 'card-images'],
  
  // Never cache (user data)
  NEVER: ['csv-inventory', 'user-preferences-sensitive'],
  
  // Session only (cleared on close)
  SESSION: ['current-commander', 'active-filters']
};
\`\`\`

## Acceptance Criteria

- [ ] Storage policy documented
- [ ] Public data cached in IndexedDB
- [ ] User data never persisted
- [ ] Session storage for temporary data
- [ ] Safari Private Mode gracefully degraded
- [ ] Documentation updated

## References

- Security Review: docs/SECURITY_REVIEW.md" \
    "security,medium-priority,documentation" \
    "medium"

# #84 - Improve Error Message Security
create_issue \
    "Improve Error Message Security (Prevent Information Disclosure)" \
    "## Problem

Some error messages expose technical details that could be useful to attackers:
- API URLs
- Internal structure
- Implementation details

## Solution

Use generic error messages for users, log detailed errors to Sentry only:

\`\`\`typescript
// Good - generic message
notifyError('Failed to load commander data. Please try again.');

// Bad - exposes implementation
notifyError(\`Failed to fetch from \${apiUrl}: \${error.message}\`);
\`\`\`

## Acceptance Criteria

- [ ] All error messages reviewed
- [ ] Generic messages shown to users
- [ ] Detailed errors logged to Sentry only
- [ ] No sensitive data in error messages
- [ ] No stack traces exposed to users

## References

- Security Review: docs/SECURITY_REVIEW.md" \
    "security,low-priority,enhancement" \
    "low"

# #85 - Add npm audit to CI Pipeline
create_issue \
    "Add npm audit to CI Pipeline" \
    "## Problem

Dependency vulnerabilities are only detected manually. CI should automatically check for vulnerabilities on every build.

## Solution

Add npm audit to GitHub Actions:

\`\`\`yaml
- name: Security audit
  run: npm audit --audit-level=moderate
\`\`\`

## Acceptance Criteria

- [ ] npm audit added to CI pipeline
- [ ] Moderate and above vulnerabilities fail build
- [ ] Audit results visible in PR checks
- [ ] Documentation updated

## References

- Security Review: docs/SECURITY_REVIEW.md" \
    "security,low-priority,ci" \
    "low"

# #86 - Add Privacy Policy
create_issue \
    "Add Privacy Policy for GDPR/CCPA Compliance" \
    "## Problem

No privacy policy published, though required for GDPR/CCPA compliance (even with minimal data collection).

## Solution

Create privacy policy stating:
- No personal data collected
- CSV data processed locally only
- Error tracking via Sentry (anonymized)
- localStorage usage (preferences)
- No cookies or tracking

## Acceptance Criteria

- [ ] Privacy policy created
- [ ] Accessible from footer
- [ ] Covers Sentry usage
- [ ] Covers localStorage usage
- [ ] States no personal data collected
- [ ] GDPR-compliant language

## References

- Security Review: docs/SECURITY_REVIEW.md
- Compliance Review: docs/COMPLIANCE_REVIEW.md" \
    "legal,low-priority,documentation,compliance" \
    "low"

# Summary
echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Summary                             ║${NC}"
echo -e "${BLUE}╠═══════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}  Issues created: $CREATED${NC}"
echo -e "${RED}  Issues failed:  $FAILED${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All issues created successfully!${NC}"
    echo -e "\nView issues at: $(gh repo view --json url -q .url)/issues"
else
    echo -e "${YELLOW}⚠ Some issues failed to create. Check output above.${NC}"
fi

echo -e "\n${BLUE}Note: This script created issues #76-#86 (11 issues).${NC}"
echo -e "${BLUE}Additional 40 issues (#87-#129) will be created in subsequent runs.${NC}"
echo -e "${BLUE}See docs/COMPREHENSIVE_REVIEW_SUMMARY.md for full issue list.${NC}\n"
