# Implement Comprehensive Error Boundaries

**Priority:** Medium  
**Type:** Reliability Enhancement  
**Component:** Error Handling Infrastructure  
**Effort:** Small (1-2 days)

## Problem

The application has basic error handling but lacks error boundaries to prevent component failures from crashing the entire app:

### Current Issues

- Component errors can crash entire application
- No graceful degradation for partial failures
- Error handler in `utils/errorHandler.ts` is global but not component-scoped
- Users see blank screen when a single component fails
- No user-friendly error recovery options
- Difficult to debug component-specific errors in production

### User Impact

- **Medium:** Single component error breaks entire application
- Loss of work in progress (CSV data, filters, etc.)
- No way to recover without page refresh
- Poor production debugging experience
- Frustrated users unable to continue work

## Proposed Solution

### Error Boundary Component

Create Vue error boundary components that catch and handle errors locally:

```vue
<!-- src/components/core/ErrorBoundary.vue -->
<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h3>{{ title || "Something went wrong" }}</h3>
      <p>{{ errorMessage }}</p>

      <div v-if="showDetails && isDev" class="error-details">
        <details>
          <summary>Error Details</summary>
          <pre>{{ error.stack }}</pre>
        </details>
      </div>

      <div class="error-actions">
        <CButton @click="reset" variant="primary">
          {{ resetText || "Try Again" }}
        </CButton>
        <CButton @click="reportError" variant="secondary"> Report Issue </CButton>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";
import { handleError } from "@/utils/errorHandler";
import { CButton } from "@/components/core";

interface Props {
  title?: string;
  resetText?: string;
  showDetails?: boolean;
  fallback?: string;
  onError?: (error: Error) => void;
}

const props = defineProps<Props>();
const error = ref<Error | null>(null);
const errorMessage = ref<string>("");
const isDev = import.meta.env.DEV;

onErrorCaptured((err: Error, instance, info) => {
  error.value = err;
  errorMessage.value = err.message;

  // Log to console and Sentry
  handleError(err, {
    notify: false, // Don't show global toast
    context: `ErrorBoundary: ${info}`,
  });

  // Call custom error handler if provided
  props.onError?.(err);

  // Prevent error from propagating up
  return false;
});

const reset = () => {
  error.value = null;
  errorMessage.value = "";
};

const reportError = () => {
  const githubUrl = "https://github.com/kmcgarry1/edhrec-compare/issues/new";
  const title = encodeURIComponent(`Error: ${error.value?.message}`);
  const body = encodeURIComponent(
    `
**Error Message:**
${error.value?.message}

**Stack Trace:**
\`\`\`
${error.value?.stack}
\`\`\`

**Browser:** ${navigator.userAgent}
**Page:** ${window.location.href}
  `.trim()
  );

  window.open(`${githubUrl}?title=${title}&body=${body}`, "_blank");
};
</script>

<style scoped>
.error-boundary {
  @apply rounded-lg border border-rose-200 bg-rose-50 p-6;
  @apply dark:border-rose-500/30 dark:bg-rose-950/30;
}

.error-content {
  @apply space-y-4 text-center;
}

.error-details {
  @apply mt-4 text-left;
}

.error-actions {
  @apply flex gap-2 justify-center;
}
</style>
```

### Strategic Error Boundary Placement

```vue
<!-- src/components/Dashboard.vue -->
<template>
  <div class="dashboard">
    <!-- Toolbar boundary: Toolbar failure doesn't break main content -->
    <ErrorBoundary title="Toolbar Error" reset-text="Reload Toolbar">
      <ToolkitHeader />
    </ErrorBoundary>

    <!-- Main content boundary: Search/display errors contained -->
    <ErrorBoundary title="Unable to load commander data" @error="handleReaderError">
      <EdhrecReader />
    </ErrorBoundary>

    <!-- Background is purely decorative - hide on error -->
    <ErrorBoundary :fallback="null">
      <NebulaBackground v-if="backgroundEnabled" />
    </ErrorBoundary>

    <!-- Global modals boundary -->
    <ErrorBoundary title="Modal Error">
      <CsvUploadModal v-if="showCsvModal" />
      <OnboardingModal v-if="showOnboarding" />
    </ErrorBoundary>
  </div>
</template>
```

### Async Error Handling

```typescript
// src/composables/useAsyncErrorBoundary.ts
import { ref } from "vue";
import { handleError } from "@/utils/errorHandler";

export const useAsyncErrorBoundary = () => {
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const execute = async <T>(
    fn: () => Promise<T>,
    options?: {
      onError?: (err: Error) => void;
      fallback?: T;
    }
  ): Promise<T | undefined> => {
    error.value = null;
    loading.value = true;

    try {
      const result = await fn();
      return result;
    } catch (err) {
      error.value = err as Error;
      handleError(err, {
        notify: true,
        context: "Async operation",
      });

      options?.onError?.(err as Error);
      return options?.fallback;
    } finally {
      loading.value = false;
    }
  };

  const reset = () => {
    error.value = null;
  };

  return { error, loading, execute, reset };
};
```

## Technical Considerations

### Files to Create

- `src/components/core/ErrorBoundary.vue` - Reusable error boundary
- `src/composables/useAsyncErrorBoundary.ts` - Async error wrapper
- `tests/unit/components/core/ErrorBoundary.spec.ts` - Unit tests

### Files to Modify

- `src/components/Dashboard.vue` - Add error boundaries
- `src/components/EdhrecReader.vue` - Use async error boundary
- `src/api/scryfallApi.ts` - Better error propagation
- `src/utils/errorHandler.ts` - Add error recovery helpers

### Error Categorization

```typescript
// src/utils/errorHandler.ts
export enum ErrorSeverity {
  Low = "low", // Cosmetic issue, app usable
  Medium = "medium", // Feature broken, workaround exists
  High = "high", // Major feature broken, no workaround
  Critical = "critical", // App unusable
}

export const categorizeError = (error: Error): ErrorSeverity => {
  // Network errors: Medium (retry available)
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return ErrorSeverity.Medium;
  }

  // Parse errors: Low (specific feature only)
  if (error.message.includes("parse") || error.message.includes("invalid")) {
    return ErrorSeverity.Low;
  }

  // Unknown errors: High (assume serious)
  return ErrorSeverity.High;
};
```

## Implementation Plan

### Phase 1: Core Error Boundary (Day 1)

1. Create ErrorBoundary component
2. Add styling and error UI
3. Implement reset functionality
4. Add GitHub issue reporting
5. Unit test error boundary

### Phase 2: Strategic Placement (Day 1-2)

1. Add boundaries to Dashboard
2. Wrap major feature sections
3. Add async error boundary composable
4. Test error scenarios

### Phase 3: Error Recovery (Day 2)

1. Add retry logic for network errors
2. Implement graceful degradation
3. Preserve user state on errors
4. Add error analytics

## Acceptance Criteria

- [ ] Component errors don't crash entire app
- [ ] Each major section has error boundary
- [ ] Users can retry failed operations
- [ ] Errors automatically reported to Sentry
- [ ] Error UI matches design system
- [ ] Dev mode shows detailed error info
- [ ] Prod mode shows user-friendly messages
- [ ] Unit tests for error boundary component

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/components/core/ErrorBoundary.spec.ts
import { mount } from "@vue/test-utils";
import ErrorBoundary from "@/components/core/ErrorBoundary.vue";

describe("ErrorBoundary", () => {
  it("catches and displays component errors", async () => {
    const FaultyComponent = {
      mounted() {
        throw new Error("Test error");
      },
    };

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: FaultyComponent,
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Something went wrong");
    expect(wrapper.text()).toContain("Test error");
  });

  it("allows retry after error", async () => {
    // Test reset functionality
  });

  it("reports errors to GitHub", async () => {
    // Test issue reporting
  });
});
```

### E2E Tests

```typescript
// tests/e2e/error-handling.spec.ts
test("handles API errors gracefully", async ({ page }) => {
  // Simulate network failure
  await page.route("**/api.scryfall.com/**", (route) => route.abort("failed"));

  await page.goto("/");
  await page.fill('input[placeholder*="Search"]', "Atraxa");

  // Should show error boundary, not crash
  await expect(page.locator(".error-boundary")).toBeVisible();
  await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
});
```

## Related Issues

- Error handling improvements overall
- User experience enhancements
- Production debugging capabilities

## References

- [Error Handling - Vue.js](https://vuejs.org/api/composition-api-lifecycle.html#onerrorcaptured)
- [Error Boundaries - React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) (concept reference)
- [Error Handling Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)
