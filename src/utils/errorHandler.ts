/**
 * Application error handling utilities
 *
 * Provides centralized error handling with user notifications, error tracking,
 * and a global error handler for Vue applications. Integrates with Sentry for
 * production error tracking.
 *
 * @module utils/errorHandler
 *
 * @example
 * ```typescript
 * import { handleError, AppError, installGlobalErrorHandler } from '@/utils/errorHandler';
 *
 * // In main.ts
 * installGlobalErrorHandler(app);
 *
 * // In components/composables
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   handleError(error, {
 *     notify: true,
 *     fallbackMessage: 'Failed to save data',
 *     context: 'DataService'
 *   });
 * }
 *
 * // Throw custom error
 * throw new AppError(
 *   'Internal error message',
 *   'User-friendly message',
 *   'ERROR_CODE'
 * );
 * ```
 */

import type { App } from "vue";
import { useGlobalNotices } from "../composables/useGlobalNotices";
import { captureError } from "./sentry";

const DEFAULT_FALLBACK_MESSAGE =
  "Something went wrong. Please try again in a moment.";

/**
 * Custom application error with user-friendly message
 */
export class AppError extends Error {
  /** User-facing error message */
  public userMessage: string;
  /** Optional error code for categorization */
  public code?: string;

  /**
   * Create a new AppError
   *
   * @param message - Internal error message (logged)
   * @param userMessage - User-friendly message (displayed)
   * @param code - Optional error code
   */
  constructor(
    message: string,
    userMessage: string = DEFAULT_FALLBACK_MESSAGE,
    code?: string
  ) {
    super(message);
    this.name = "AppError";
    this.userMessage = userMessage;
    this.code = code;
  }
}

/**
 * Client error log payload
 */
type ClientErrorLog = {
  message: string;
  userMessage: string;
  code?: string;
  stack?: string;
  context?: string;
};

/**
 * Report error to external logging service
 *
 * Only sends errors in production environment. Silently fails if
 * the endpoint is unavailable.
 *
 * @param payload - Error details to log
 */
const reportClientError = (payload: ClientErrorLog) => {
  if (
    import.meta.env.DEV ||
    typeof window === "undefined" ||
    typeof fetch !== "function"
  ) {
    return;
  }

  const body = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    void fetch("/api/log-error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn("Failed to report client error:", err);
    }
  }
};

export type HandleErrorOptions = {
  notify?: boolean;
  fallbackMessage?: string;
  context?: string;
};

const extractErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
};

const shouldIgnoreError = (message: string) => {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("resizeobserver loop") ||
    normalized.includes("could not find identifiable element")
  );
};

export function handleError(
  error: unknown,
  options?: HandleErrorOptions
): AppError {
  const fallbackMessage = options?.fallbackMessage ?? DEFAULT_FALLBACK_MESSAGE;
  const contextLabel = options?.context ?? "AppError";
  const rawMessage = extractErrorMessage(error);

  if (shouldIgnoreError(rawMessage)) {
    if (import.meta.env.DEV) {
      console.debug(`[${contextLabel}] Ignored benign error: ${rawMessage}`);
    }
    return new AppError(rawMessage || fallbackMessage, fallbackMessage);
  }

  let normalized: AppError;

  if (error instanceof AppError) {
    normalized = error;
  } else if (error instanceof Error) {
    normalized = new AppError(
      error.message || fallbackMessage,
      fallbackMessage,
      (error as { code?: string }).code
    );
    normalized.stack = error.stack;
  } else if (typeof error === "string") {
    normalized = new AppError(error, fallbackMessage);
  } else {
    normalized = new AppError("Unknown error", fallbackMessage);
  }

  if (import.meta.env.DEV) {
    console.error(`[${contextLabel}]`, error);
  } else {
    console.error(`[${contextLabel}]`, error);
  }

  // Send to Sentry in production
  if (import.meta.env.PROD) {
    captureError(normalized, {
      errorContext: {
        context: contextLabel,
        userMessage: normalized.userMessage,
        code: normalized.code,
      },
    });
  }

  reportClientError({
    message: normalized.message,
    userMessage: normalized.userMessage,
    code: normalized.code,
    stack: normalized.stack,
    context: contextLabel,
  });

  if (options?.notify) {
    const { notifyError } = useGlobalNotices();
    notifyError(normalized.userMessage, contextLabel);
  }

  return normalized;
}

let globalErrorListenersRegistered = false;

export const setupAppErrorHandling = (app: App) => {
  app.config.errorHandler = (err, instance, info) => {
    const label =
      info || instance?.$options?.name || instance?.$options?.__file || "Vue";
    handleError(err, {
      notify: true,
      fallbackMessage:
        "An unexpected error occurred while rendering the application.",
      context: label,
    });
  };

  if (
    globalErrorListenersRegistered ||
    typeof window === "undefined" ||
    typeof window.addEventListener !== "function"
  ) {
    return;
  }

  window.addEventListener("error", (event) => {
    handleError(event.error ?? event.message, {
      notify: true,
      fallbackMessage: "An unexpected error occurred.",
      context: "window.error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    handleError(event.reason ?? event, {
      notify: true,
      fallbackMessage: "A background request failed. Please try again.",
      context: "unhandledrejection",
    });
  });

  globalErrorListenersRegistered = true;
};
