<template>
  <header
    class="surface-sheen relative overflow-hidden rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)] sm:p-7"
  >
    <div
      class="pointer-events-none absolute -top-24 right-6 h-48 w-48 rounded-full bg-[color:var(--accent-soft)] blur-3xl opacity-70"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-24 left-4 h-52 w-64 rounded-full bg-[color:var(--warn-soft)] blur-3xl opacity-60"
      aria-hidden="true"
    ></div>
    <div class="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-3">
        <p
          class="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
        >
          Collection Insights
        </p>
        <h1 class="text-3xl font-semibold text-[color:var(--text)] sm:text-4xl">
          Top commanders scan
        </h1>
        <p class="max-w-2xl text-sm text-[color:var(--muted)] sm:text-base">
          Browse EDHREC's top commanders and see what percentage of each average deck
          you already own.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        >
          Back to dashboard
        </RouterLink>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-strong)] hover:brightness-105"
          @click="emit('upload')"
        >
          Upload CSV
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  upload: [];
}>();
</script>
