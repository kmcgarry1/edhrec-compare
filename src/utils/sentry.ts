import * as Sentry from "@sentry/vue";
import type { App } from "vue";

/**
 * Initialize Sentry error tracking for production environments.
 * This function should only be called in production mode.
 *
 * @param app - The Vue app instance
 * @returns boolean indicating whether Sentry was initialized
 */
export function initSentry(app: App): boolean {
  // Only initialize in production
  if (!import.meta.env.PROD) {
    return false;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  // Skip initialization if DSN is not configured
  if (!dsn || dsn.trim() === "") {
    if (import.meta.env.DEV) {
      console.warn("Sentry DSN not configured. Error tracking disabled.");
    }
    return false;
  }

  try {
    Sentry.init({
      app,
      dsn,
      environment: import.meta.env.MODE,
      // Sample 10% of transactions for performance monitoring
      tracesSampleRate: 0.1,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Don't capture replays by default to protect user privacy
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Capture 10% of sessions for replay in case of errors
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0.1,
      // Don't send sensitive data
      beforeSend(event) {
        // Filter out any breadcrumbs or context that might contain CSV data
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.filter(
            (breadcrumb) =>
              !breadcrumb.message?.includes("CSV") &&
              !breadcrumb.data?.csv &&
              !breadcrumb.category?.includes("csv")
          );
        }

        // Remove any extra context that might contain sensitive data
        if (event.contexts?.csv) {
          delete event.contexts.csv;
        }

        return event;
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
    return false;
  }
}

/**
 * Capture an error to Sentry if initialized.
 * This is a safe wrapper that won't throw if Sentry is not initialized.
 *
 * @param error - The error to capture
 * @param context - Optional context object
 */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  try {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value as Record<string, unknown>);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch (sentryError) {
    // Silently fail if Sentry is not initialized or throws an error
    if (import.meta.env.DEV) {
      console.warn("Failed to capture error to Sentry:", sentryError);
    }
  }
}

/**
 * Set user context for error tracking.
 * Use this sparingly and only with non-sensitive identifiers.
 *
 * @param user - User information (should not contain PII)
 */
export function setUserContext(user: { id?: string; username?: string }): void {
  try {
    Sentry.setUser(user);
  } catch (error) {
    // Silently fail if Sentry is not initialized
    if (import.meta.env.DEV) {
      console.warn("Failed to set user context:", error);
    }
  }
}

/**
 * Clear user context.
 */
export function clearUserContext(): void {
  try {
    Sentry.setUser(null);
  } catch (error) {
    // Silently fail if Sentry is not initialized
    if (import.meta.env.DEV) {
      console.warn("Failed to clear user context:", error);
    }
  }
}
