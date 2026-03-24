<template>
  <Teleport to="body">
    <CStack
      as="div"
      gap="md"
      class="fixed inset-x-0 top-5 z-[9998] items-center px-4 sm:items-end sm:px-6"
    >
      <TransitionGroup name="notice">
        <CNotice
          v-for="notice in notices"
          :key="notice.id"
          tone="info"
          :title="notice.title"
          :message="notice.message"
          dismissible
          dismiss-label="Close"
          :aria-live="notice.type === 'error' ? 'assertive' : 'polite'"
          :class="noticeClass(notice.type)"
          @dismiss="dismissNotice(notice.id)"
        >
          <template #icon>
            <CText tag="span" variant="title" weight="bold" tone="inherit">
              {{ iconForType(notice.type) }}
            </CText>
          </template>
        </CNotice>
      </TransitionGroup>
    </CStack>
  </Teleport>
</template>

<script setup lang="ts">
import { useGlobalNotices } from "../composables/useGlobalNotices";
import { CNotice, CStack, CText } from "./core";

const { notices, dismissNotice } = useGlobalNotices();

const noticeClass = (type: "info" | "success" | "error") => {
  if (type === "success") {
    return "max-w-sm bg-[color:var(--accent-soft)] border-[color:var(--accent)]";
  }
  if (type === "error") {
    return "max-w-sm bg-[color:var(--danger-soft)] border-[color:var(--danger)] text-[color:var(--danger)]";
  }
  return "max-w-sm";
};

const iconForType = (type: "info" | "success" | "error") => {
  if (type === "success") {
    return "OK";
  }
  if (type === "error") {
    return "!";
  }
  return "i";
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
