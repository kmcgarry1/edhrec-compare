import { readonly, reactive } from "vue";

type NoticeType = "info" | "success" | "error";

export type Notice = {
  id: number;
  type: NoticeType;
  title?: string;
  message: string;
  timeout?: number;
};

const notices = reactive<Notice[]>([]);
let noticeCounter = 0;

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

const dismissNotice = (id: number) => {
  const index = notices.findIndex((notice) => notice.id === id);
  if (index !== -1) {
    notices.splice(index, 1);
  }
};

const notifyError = (message: string, title = "Something went wrong") =>
  pushNotice({ type: "error", title, message });

const notifyInfo = (message: string, title = "Notice") =>
  pushNotice({ type: "info", title, message });

const notifySuccess = (message: string, title = "Success") =>
  pushNotice({ type: "success", title, message });

export const useGlobalNotices = () => ({
  notices: readonly(notices),
  notifyError,
  notifyInfo,
  notifySuccess,
  dismissNotice,
});
