import type { App } from "vue";
import { useGlobalNotices } from "../composables/useGlobalNotices";
import { captureError } from "./sentry";

const DEFAULT_FALLBACK_MESSAGE =
  "Something went wrong. Please try again in a moment.";

export class AppError extends Error {
  public userMessage: string;
  public code?: string;

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

type ClientErrorLog = {
  message: string;
  userMessage: string;
  code?: string;
  stack?: string;
  context?: string;
};

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

export function handleError(
  error: unknown,
  options?: HandleErrorOptions
): AppError {
  const fallbackMessage = options?.fallbackMessage ?? DEFAULT_FALLBACK_MESSAGE;
  const contextLabel = options?.context ?? "AppError";

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
