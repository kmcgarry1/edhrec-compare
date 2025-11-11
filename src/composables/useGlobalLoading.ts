import { computed, reactive } from "vue";

type Scope = string;

const DEFAULT_SCOPE: Scope = "global";

type ScopeState = {
  count: number;
  message: string | null;
};

const scopeStates = reactive<Record<Scope, ScopeState>>({});

const ensureScopeState = (scope: Scope) => {
  if (!scopeStates[scope]) {
    scopeStates[scope] = { count: 0, message: null };
  }
  return scopeStates[scope];
};

const startLoading = (status?: string, scope: Scope = DEFAULT_SCOPE) => {
  const state = ensureScopeState(scope);
  state.count += 1;
  if (status) {
    state.message = status;
  } else if (!state.message) {
    state.message = "Loading...";
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
    delete scopeStates[scope];
  }
};

const getScopeLoading = (scope: Scope) =>
  computed(() => (scopeStates[scope]?.count ?? 0) > 0);

const getScopeMessage = (scope: Scope) =>
  computed(() => scopeStates[scope]?.message ?? "Loading...");

const isLoading = getScopeLoading(DEFAULT_SCOPE);
const loadingMessage = getScopeMessage(DEFAULT_SCOPE);

const withLoading = async <T>(
  action: () => Promise<T>,
  status?: string,
  scope: Scope = DEFAULT_SCOPE
) => {
  startLoading(status, scope);
  try {
    return await action();
  } finally {
    stopLoading(scope);
  }
};

export const useGlobalLoading = () => ({
  isLoading,
  loadingMessage,
  startLoading,
  stopLoading,
  withLoading,
  getScopeLoading,
  getScopeMessage,
});
