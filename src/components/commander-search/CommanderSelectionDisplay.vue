<template>
  <div v-if="primarySelection" class="grid gap-4 lg:grid-cols-2">
    <CommanderDisplay
      :commanderName="primarySelection"
      label="Primary Commander"
    />
    <CommanderDisplay
      v-if="partnerSelection"
      :commanderName="partnerSelection"
      label="Partner Commander"
    />
  </div>
</template>

<script setup lang="ts">
import CommanderDisplay from "../CommanderDisplay.vue";

defineProps<{
  primarySelection: string;
  partnerSelection: string;
}>();
</script>
