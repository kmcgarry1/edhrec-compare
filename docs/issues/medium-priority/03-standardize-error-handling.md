# 🚨 Standardize error handling across the application

**Labels:** `code-quality`, `medium-priority`

## Problem
Error handling is inconsistent throughout the app:
- Mix of `console.error`, `try-catch`, and error state management
- Some API failures show user-facing errors, others don't
- No standardized error logging or reporting

## Current State
- `scryfallApi.ts`: Logs to console and throws
- `EdhrecReader.vue`: Sets error ref and uses `notifyError`
- `Dashboard.vue`: Mostly console.error
- `CSVUpload.vue`: Uses global loading states

## Impact
- Inconsistent user experience
- Difficult debugging in production
- Silent failures possible
- No error tracking/monitoring

## Proposed Solution

### 1. Create Error Handling Utility
```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleError(
  error: unknown,
  options?: {
    notify?: boolean;
    fallbackMessage?: string;
  }
) {
  // Log to console (dev) / error service (prod)
  // Optionally show user notification
  // Return standardized error object
}
```

### 2. Create API Error Handler
```typescript
// src/api/errorHandler.ts
export async function apiCall<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, { 
      notify: true, 
      fallbackMessage: errorMessage 
    });
    return null;
  }
}
```

### 3. Update All API Calls
Use consistent error handling wrapper

### 4. Add Global Error Boundary
Catch unhandled errors in Vue app

## Success Criteria
- All errors handled consistently
- User-facing errors are clear and actionable
- All errors logged appropriately
- No silent failures
