<template>
  <Teleport to="body">
    <div
      class="fixed inset-x-0 top-5 z-[9998] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
    >
      <TransitionGroup name="notice">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="w-full max-w-sm rounded-2xl border bg-white/95 p-4 shadow-xl shadow-slate-900/15 ring-1 ring-slate-900/5 dark:bg-slate-900/90 dark:ring-slate-50/10"
          :class="noticeClass(notice.type)"
          role="status"
        >
          <div class="flex items-start gap-3">
            <div class="text-xl" aria-hidden="true">
              {{ iconForType(notice.type) }}
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-semibold">
                {{ notice.title }}
              </p>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {{ notice.message }}
              </p>
            </div>
            <button
              type="button"
              class="text-xs font-semibold text-slate-500 transition hover:text-rose-500 dark:text-slate-400"
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
    return "border-emerald-200 text-emerald-900 dark:border-emerald-400/40 dark:text-emerald-100";
  }
  if (type === "error") {
    return "border-rose-200 text-rose-900 dark:border-rose-400/40 dark:text-rose-100";
  }
  return "border-slate-200 text-slate-800 dark:border-slate-600/60 dark:text-slate-100";
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
.notice-enter-active,
.notice-leave-active {
  transition: all 0.2s ease;
}
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
