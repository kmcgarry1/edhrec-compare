<template>
  <h2>Dashboard Component</h2>
  <p>Welcome to the dashboard!</p>
  <div class="app">
    <edhrec-reader />
    <CSVUpload />
  </div>
</template>
<script setup lang="ts">
import { EdhrecReader, CSVUpload } from "../components";
</script>
<style scoped>
.app {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
</style>
