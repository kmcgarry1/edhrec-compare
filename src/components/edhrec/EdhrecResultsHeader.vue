<template>
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div class="space-y-1">
      <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
        Results
      </p>
      <h2 class="text-lg font-semibold text-[color:var(--text)]">Cardlists</h2>
    </div>
    <div class="flex flex-wrap items-center gap-3 text-xs text-[color:var(--muted)]">
      <span>{{ listCount }} lists</span>
      <span>{{ cardCount }} cards</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";

const props = defineProps<{
  listCount: number;
  cardCount: number;
}>();

const { listCount, cardCount } = toRefs(props);
</script>
