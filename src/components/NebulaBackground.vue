<template>
  <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div class="absolute inset-0 opacity-60" :style="patternStyle" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
const patternStyle = {
  backgroundImage: [
    "linear-gradient(to right, var(--pattern-line) 1px, transparent 1px)",
    "linear-gradient(to bottom, var(--pattern-line) 1px, transparent 1px)",
    "radial-gradient(circle at 20% 18%, var(--accent-glow-strong), transparent 45%)",
    "radial-gradient(circle at 82% 8%, var(--accent-glow), transparent 35%)",
  ].join(", "),
  backgroundSize: "120px 120px, 120px 120px, 100% 100%, 100% 100%",
  backgroundPosition: "center, center, center, center",
};
</script>
