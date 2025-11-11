import { computed, reactive, ref } from "vue";

type Scope = string;

const pendingRequests = ref(0);
const message = ref<string | null>(null);
const scopeCounts = reactive<Record<Scope, number>>({});

const adjustScopeCount = (scope: Scope, delta: number) => {
  scopeCounts[scope] = (scopeCounts[scope] ?? 0) + delta;
  if (scopeCounts[scope] <= 0) {
    delete scopeCounts[scope];
  }
};

const startLoading = (status?: string, scope: Scope = "global") => {
  pendingRequests.value += 1;
  adjustScopeCount(scope, 1);
  if (status) {
    message.value = status;
  } else if (!message.value) {
    message.value = "Loading...";
  }
};

const stopLoading = (scope: Scope = "global") => {
  if (pendingRequests.value > 0) {
    pendingRequests.value -= 1;
  }
  adjustScopeCount(scope, -1);
  if (pendingRequests.value === 0) {
    message.value = null;
  }
};

const isLoading = computed(() => pendingRequests.value > 0);
const loadingMessage = computed(() => message.value ?? "Loading...");

const getScopeLoading = (scope: Scope) =>
  computed(() => (scopeCounts[scope] ?? 0) > 0);

const withLoading = async <T>(
  action: () => Promise<T>,
  status?: string,
  scope: Scope = "global"
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
});
