<template>
  <Teleport to="body">
    <div
      class="fixed inset-x-0 top-5 z-[9998] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
    >
      <TransitionGroup name="notice">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="surface-sheen w-full max-w-sm rounded-2xl border bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)] ring-1 ring-black/5"
          :class="noticeClass(notice.type)"
          role="status"
          :aria-live="notice.type === 'error' ? 'assertive' : 'polite'"
        >
          <div class="flex items-start gap-3">
            <div class="text-xl" aria-hidden="true">
              {{ iconForType(notice.type) }}
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-semibold">
                {{ notice.title }}
              </p>
              <p class="mt-1 text-sm text-[color:var(--muted)]">
                {{ notice.message }}
              </p>
            </div>
            <button
              type="button"
              class="text-xs font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--accent)]"
              aria-label="Dismiss notification"
              @click="dismissNotice(notice.id)"
            >
              Close
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
<script setup lang="ts">
import { useGlobalNotices } from "../composables/useGlobalNotices";

const { notices, dismissNotice } = useGlobalNotices();

const noticeClass = (type: "info" | "success" | "error") => {
  if (type === "success") {
    return "border-[color:var(--accent)] text-[color:var(--text)]";
  }
  if (type === "error") {
    return "border-[color:var(--danger)] text-[color:var(--danger)]";
  }
  return "border-[color:var(--border)] text-[color:var(--text)]";
};

const iconForType = (type: "info" | "success" | "error") => {
  if (type === "success") {
    return "✅";
  }
  if (type === "error") {
    return "⚠️";
  }
  return "ℹ️";
};
</script>
<style scoped>
.notice-enter-active {
  animation: slide-in-bounce 0.5s var(--ease-bounce);
}

.notice-leave-active {
  animation: slide-out 0.3s var(--ease-accelerate);
}

.notice-move {
  transition: transform 0.3s var(--ease-standard);
}
</style>
