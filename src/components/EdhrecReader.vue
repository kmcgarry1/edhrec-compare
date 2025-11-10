<template>
  <div>
    <div v-if="loading">Loading commander data...</div>
    <div v-else-if="error">Error: {{ error }}</div>

    <div>
      <commander-search @commanderSelected="searchCommander" />
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
          @mouseenter="handleCardHover(card.name, $event)"
          @mouseleave="hideCardImage"
          @mousemove="updateImagePosition($event)"
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

    <div
      v-if="hoveredCardImage"
      class="card-hover-image"
      :style="{ left: imagePosition.x + 'px', top: imagePosition.y + 'px' }"
    >
      <img :src="hoveredCardImage" alt="Card preview" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useLocalStorage, useDebounceFn } from "@vueuse/core";
import { getCardImage } from "../api/scryfallApi";
import { CommanderSearch } from ".";

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

const normalizeCardName = (value: string) => value.trim().toLowerCase();

const uploadedCardNameSet = computed(() => {
  if (!uploadedRows.value.length) {
    return new Set<string>();
  }

  const idx = uploadedNameIndex.value;

  return new Set(
    uploadedRows.value
      .map((row) => row[idx] ?? row[0] ?? "")
      .map((value) => normalizeCardName(value))
      .filter((value) => value.length > 0)
  );
});

const isCardInUpload = (cardName: string) => {
  if (!cardName) {
    return false;
  }

  return uploadedCardNameSet.value.has(normalizeCardName(cardName));
};

const hoveredCardImage = ref<string | null>(null);
const imagePosition = ref({ x: 0, y: 0 });
const pendingImageKey = ref<string | null>(null);
const imageCache = new Map<string, string>();

const updateImagePosition = (event: MouseEvent) => {
  imagePosition.value = {
    x: event.clientX + 20,
    y: event.clientY + 20,
  };
};

const handleCardHover = async (cardName: string, event: MouseEvent) => {
  const normalized = normalizeCardName(cardName);
  pendingImageKey.value = normalized;
  updateImagePosition(event);

  if (imageCache.has(normalized)) {
    hoveredCardImage.value = imageCache.get(normalized) ?? null;
    return;
  }

  hoveredCardImage.value = null;
  try {
    const imageUrl = await getCardImage(cardName);
    if (imageUrl) {
      imageCache.set(normalized, imageUrl);
      if (pendingImageKey.value === normalized) {
        hoveredCardImage.value = imageUrl;
      }
    }
  } catch (err) {
    console.error("Unable to fetch card image:", err);
  }
};

const hideCardImage = () => {
  pendingImageKey.value = null;
  hoveredCardImage.value = null;
};

const searchCommander = useDebounceFn((query: string) => {
  const formattedQuery = query.toLowerCase().replace(/[\s,]+/g, "-");
  const removeApostrophes = formattedQuery.replace(/'/g, "");
  fetchJsonData(
    `https://json.edhrec.com/pages/commanders/${removeApostrophes}.json`
  );
}, 300);

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

.search-input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
  margin-bottom: 1rem;
}

.card-hover-image {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  background: rgba(0, 0, 0, 0.85);
  padding: 0.35rem;
}

.card-hover-image img {
  width: 220px;
  height: auto;
  display: block;
  border-radius: 6px;
}
</style>
