import { handleError } from "../utils/errorHandler";

type ApiCallOptions = {
  notify?: boolean;
  context?: string;
};

export async function apiCall<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  options?: ApiCallOptions
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, {
      notify: options?.notify ?? true,
      fallbackMessage: errorMessage,
      context: options?.context ?? "apiCall",
    });
    return null;
  }
}
