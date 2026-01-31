<template>
  <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
    <span class="font-semibold uppercase tracking-[0.24em]">Owned range</span>
    <div class="flex items-center gap-2">
      <div
        class="h-2 w-40 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 shadow-[var(--shadow-soft)]"
        aria-hidden="true"
      ></div>
      <div class="flex items-center gap-2 text-[0.7rem]">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  </div>
</template>
