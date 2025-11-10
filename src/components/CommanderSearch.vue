<template>
  <div role="search">
    <input
      type="text"
      placeholder="Search Commanders..."
      v-model="searchQuery"
      class="search-input"
      aria-label="Search Commanders"
    />
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else class="commander-list">
      <ul>
        <li
          v-for="commander in filteredCommanders"
          :key="commander.id"
          @click="emitUpName(commander.name)"
          class="commander-item"
          tabindex="0"
          @keydown.enter="emitUpName(commander.name)"
          @keydown.space="emitUpName(commander.name)"
        >
          {{ commander.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { searchCardNames } from "../api/scryfallApi";

const searchQuery = ref("");
const filteredCommanders = ref<Array<{ id: string; name: string }>>([]);
const loading = ref(false);
const error = ref("");

const emit = defineEmits(["commanderSelected"]);

const debouncedSearch = useDebounceFn(async (query: string) => {
  if (query.length <= 3) {
    filteredCommanders.value = [];
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const commanders = await searchCardNames(query);
    filteredCommanders.value = commanders
      .slice(0, 20)
      .map((name, index) => ({ id: `${index}-${name}`, name }));
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to fetch commanders";
    filteredCommanders.value = [];
  } finally {
    loading.value = false;
  }
}, 300);

watch(searchQuery, (newQuery) => {
  debouncedSearch(newQuery);
});

function emitUpName(name: string) {
  emit("commanderSelected", name);
}
</script>

<style scoped>
.commander-list {
  max-height: 300px;
  overflow-y: auto;
  border-radius: 4px;
  margin-top: 10px;
}
.commander-item {
  padding: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.commander-item:hover {
  background-color: #a5a5a5;
}
</style>
