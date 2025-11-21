import { handleError } from "../utils/errorHandler";

type ApiCallOptions<T> = {
  notify?: boolean;
  context?: string;
  suppressError?: boolean;
  fallbackValue?: T;
};

export async function apiCall<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  options?: ApiCallOptions<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const normalized = handleError(error, {
      notify: options?.notify ?? true,
      fallbackMessage: errorMessage,
      context: options?.context ?? "apiCall",
    });

    if (options?.suppressError) {
      return (options.fallbackValue ?? null) as T;
    }

    throw normalized;
  }
}
