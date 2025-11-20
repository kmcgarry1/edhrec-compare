# 🔐 Add error tracking service (Sentry/LogRocket)

**Labels:** `monitoring`, `low-priority`

## Problem
No production error tracking. Errors go unnoticed unless users report them.

## Impact
- Production errors invisible
- No error trend analysis
- Slow bug discovery
- Poor debugging info

## Proposed Solution

### Option 1: Sentry (Recommended)
Free tier: 5K events/month

```bash
npm install @sentry/vue
```

```typescript
// main.ts
import * as Sentry from "@sentry/vue";

if (import.meta.env.PROD) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    integrations: [
      new Sentry.BrowserTracing()
    ]
  });
}
```

### Option 2: LogRocket
Session replay + error tracking

### Option 3: Custom Solution
Log to backend service

## Configuration
- Only enable in production
- Don't log sensitive data (CSV contents)
- Sample rate for performance tracking
- Source maps for readable stack traces

## Success Criteria
- Errors tracked in production
- Readable stack traces
- Error trends visible
- Alerts for critical errors

## Privacy Note
Ensure error tracking complies with privacy policy. Don't log user data.
