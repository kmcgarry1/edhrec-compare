<template>
  <div class="skeleton-card animate-pulse" role="status" aria-label="Loading card data">
    <div class="flex gap-4">
      <!-- Card image placeholder -->
      <div class="h-32 w-24 flex-shrink-0 rounded bg-slate-200 dark:bg-slate-700" />

      <!-- Card details placeholder -->
      <div class="flex flex-1 flex-col justify-center space-y-3">
        <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div class="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        <div class="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Skeleton loading component for card data
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
