/**
 * Global toast notification system
 *
 * Manages a queue of user-facing notifications that appear
 * at the top-right of the screen. Supports info, success,
 * and error variants with auto-dismiss functionality.
 *
 * @module composables/useGlobalNotices
 *
 * @example
 * ```typescript
 * const { notifySuccess, notifyError, dismissNotice } = useGlobalNotices();
 *
 * // Show success message
 * notifySuccess('Settings saved!');
 *
 * // Show error with custom title
 * notifyError('Failed to load data', 'API Error');
 *
 * // Manually dismiss a notice
 * dismissNotice(noticeId);
 * ```
 */

import { readonly, reactive } from "vue";

type NoticeType = "info" | "success" | "error";

/**
 * Represents a single toast notification
 */
export type Notice = {
  /** Unique identifier for the notice */
  id: number;
  /** Visual style of the notice */
  type: NoticeType;
  /** Optional title shown above the message */
  title?: string;
  /** Main message content */
  message: string;
  /** Auto-dismiss timeout in milliseconds (0 = no auto-dismiss) */
  timeout?: number;
};

const notices = reactive<Notice[]>([]);
let noticeCounter = 0;

/**
 * Internal helper to add a notice to the queue
 *
 * @param notice - Notice configuration without ID
 */
const pushNotice = (notice: Omit<Notice, "id">) => {
  const entry: Notice = {
    timeout: 6000,
    ...notice,
    id: ++noticeCounter,
  };
  notices.push(entry);

  if (entry.timeout && entry.timeout > 0) {
    window.setTimeout(() => dismissNotice(entry.id), entry.timeout);
  }
};

/**
 * Remove a notice from the display queue
 *
 * @param id - Unique identifier of the notice to dismiss
 */
const dismissNotice = (id: number) => {
  const index = notices.findIndex((notice) => notice.id === id);
  if (index !== -1) {
    notices.splice(index, 1);
  }
};

/**
 * Show an error notification
 *
 * @param message - Error message to display
 * @param title - Optional title (defaults to "Something went wrong")
 *
 * @example
 * ```typescript
 * notifyError('Failed to save data');
 * notifyError('Network error', 'Connection Failed');
 * ```
 */
const notifyError = (message: string, title = "Something went wrong") =>
  pushNotice({ type: "error", title, message });

/**
 * Show an informational notification
 *
 * @param message - Information message to display
 * @param title - Optional title (defaults to "Notice")
 *
 * @example
 * ```typescript
 * notifyInfo('Loading data...');
 * notifyInfo('New features available', 'Update');
 * ```
 */
const notifyInfo = (message: string, title = "Notice") =>
  pushNotice({ type: "info", title, message });

/**
 * Show a success notification
 *
 * @param message - Success message to display
 * @param title - Optional title (defaults to "Success")
 *
 * @example
 * ```typescript
 * notifySuccess('Data saved successfully');
 * notifySuccess('Export complete', 'Download Ready');
 * ```
 */
const notifySuccess = (message: string, title = "Success") =>
  pushNotice({ type: "success", title, message });

/**
 * Composable for managing global toast notifications
 *
 * @returns Object containing notification state and methods
 */
export const useGlobalNotices = () => ({
  /** Readonly array of active notices */
  notices: readonly(notices),
  /** Show an error notification */
  notifyError,
  /** Show an informational notification */
  notifyInfo,
  /** Show a success notification */
  notifySuccess,
  /** Manually dismiss a notification by ID */
  dismissNotice,
});
