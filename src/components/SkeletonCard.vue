<template>
  <div class="skeleton-card animate-pulse" role="status" aria-label="Loading card data">
    <div class="flex gap-4">
      <!-- Card image placeholder -->
      <div class="h-32 w-24 flex-shrink-0 rounded bg-[color:var(--surface-muted)]" />

      <!-- Card details placeholder -->
      <div class="flex flex-1 flex-col justify-center space-y-3">
        <div class="h-4 w-3/4 rounded bg-[color:var(--surface-muted)]" />
        <div class="h-3 w-1/2 rounded bg-[color:var(--surface-muted)]" />
        <div class="h-3 w-2/3 rounded bg-[color:var(--surface-muted)]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Skeleton loading component for card data
</script>
