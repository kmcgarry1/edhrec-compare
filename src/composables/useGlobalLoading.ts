import { computed, reactive } from "vue";

type Scope = string;

const DEFAULT_SCOPE: Scope = "global";

type ProgressInfo = {
  current: number;
  total: number;
};

type ScopeState = {
  count: number;
  message: string | null;
  progress?: ProgressInfo;
};

const scopeStates = reactive<Record<Scope, ScopeState>>({});

const ensureScopeState = (scope: Scope) => {
  if (!scopeStates[scope]) {
    scopeStates[scope] = { count: 0, message: null };
  }
  return scopeStates[scope];
};

const startLoading = (
  status?: string,
  scope: Scope = DEFAULT_SCOPE,
  total?: number
) => {
  const state = ensureScopeState(scope);
  state.count += 1;
  if (status) {
    state.message = status;
  } else if (!state.message) {
    state.message = "Loading...";
  }
  if (total !== undefined && total > 0) {
    state.progress = { current: 0, total };
  }
};

const updateProgress = (scope: Scope, current: number) => {
  const state = scopeStates[scope];
  if (state?.progress) {
    state.progress.current = Math.min(current, state.progress.total);
  }
};

const stopLoading = (scope: Scope = DEFAULT_SCOPE) => {
  const state = scopeStates[scope];
  if (!state) {
    return;
  }
  state.count = Math.max(0, state.count - 1);
  if (state.count === 0) {
    state.message = null;
    state.progress = undefined;
    delete scopeStates[scope];
  }
};

const getScopeLoading = (scope: Scope) =>
  computed(() => (scopeStates[scope]?.count ?? 0) > 0);

const getScopeMessage = (scope: Scope) =>
  computed(() => scopeStates[scope]?.message ?? "Loading...");

const getScopeProgress = (scope: Scope) =>
  computed(() => scopeStates[scope]?.progress);

const isLoading = getScopeLoading(DEFAULT_SCOPE);
const loadingMessage = getScopeMessage(DEFAULT_SCOPE);
const loadingProgress = getScopeProgress(DEFAULT_SCOPE);

const withLoading = async <T>(
  action: () => Promise<T>,
  status?: string,
  scope: Scope = DEFAULT_SCOPE,
  total?: number
) => {
  startLoading(status, scope, total);
  try {
    return await action();
  } finally {
    stopLoading(scope);
  }
};

export const useGlobalLoading = () => ({
  isLoading,
  loadingMessage,
  loadingProgress,
  startLoading,
  stopLoading,
  updateProgress,
  withLoading,
  getScopeLoading,
  getScopeMessage,
  getScopeProgress,
});
