<template>
  <div>
    <h2>EdhrecReader Component</h2>
    <p>This is the EdhrecReader component.</p>
    <div>
      <input
        type="text"
        placeholder="Search commanders..."
        class="search-input"
        v-model="searchQuery"
        @input="searchCommander(searchQuery)"
      />
    </div>
    <div
      class="cardlists"
      v-for="cardlist in cardlists"
      :key="cardlist.header"
      style="margin-bottom: 20px"
    >
      <h2>{{ cardlist.header }}</h2>

      <div class="cardviews">
        <label
          v-for="card in cardlist.cardviews"
          :key="card.id"
          class="card-entry"
          :class="{ 'card-entry--present': isCardInUpload(card.name) }"
        >
          <input
            type="checkbox"
            :checked="isCardInUpload(card.name)"
            disabled
            :aria-checked="isCardInUpload(card.name)"
            aria-label="Card present in uploaded list"
          />
          <span>{{ card.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";

interface EdhrecData {
  container?: {
    json_dict?: {
      cardlists?: {
        header: string;
        cardviews: { id: string; name: string }[];
      }[];
    };
  };
}

const data = ref<EdhrecData | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref("");

const fetchJsonData = async (url: string) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    data.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "An error occurred";
  } finally {
    loading.value = false;
  }
};

const cardlists = computed(
  () => data.value?.container?.json_dict?.cardlists || []
);

const uploadedRows = useLocalStorage<string[][]>("csv-upload-data", []);
const uploadedHeaders = useLocalStorage<string[]>("csv-upload-headers", []);

const uploadedNameIndex = computed(() => {
  const headers = uploadedHeaders.value;
  const idx = headers.findIndex(
    (header) => header.trim().toLowerCase() === "name"
  );
  return idx >= 0 ? idx : 0;
});

const uploadedCardNameSet = computed(() => {
  if (!uploadedRows.value.length) {
    return new Set<string>();
  }

  const idx = uploadedNameIndex.value;

  return new Set(
    uploadedRows.value
      .map((row) => row[idx] ?? row[0] ?? "")
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0)
  );
});

const isCardInUpload = (cardName: string) => {
  if (!cardName) {
    return false;
  }

  return uploadedCardNameSet.value.has(cardName.trim().toLowerCase());
};

const searchCommander = (query: string) => {
  const formattedQuery = query.toLowerCase().replace(/[\s,]+/g, "-");
  const removeApostraphes = formattedQuery.replace(/'/g, "");
  fetchJsonData(
    `https://json.edhrec.com/pages/commanders/${removeApostraphes}.json`
  );
};

onMounted(() => {
  fetchJsonData("https://json.edhrec.com/pages/commanders/teysa-karlov.json");
});
</script>
<style scoped>
.cardlists {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.cardviews {
  width: 50vw;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-direction: row;
  margin-left: 20px;
}
.card-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #818181;
  border-radius: 4px;
  background-color: #414141;
}
.card-entry input {
  pointer-events: none;
}

.card-entry--present {
  border-color: #4caf50;
  background-color: #2e7d32;
}
</style>
