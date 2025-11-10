<template>
  <div class="csv-upload">
    <div
      class="upload-area"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        @change="handleFileSelect"
        style="display: none"
      />
      <div v-if="!file" class="upload-placeholder">
        <p>Click to upload or drag and drop a CSV file</p>
      </div>
      <div v-else class="file-info">
        <p>{{ file.name }}</p>
        <button @click.stop="removeFile">Remove</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLocalStorage } from "@vueuse/core";

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const csvData = useLocalStorage<string[][]>("csv-upload-data", []);
const headers = useLocalStorage<string[]>("csv-upload-headers", []);

const emit = defineEmits<{
  upload: [data: string[][], headers: string[]];
}>();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  if (selectedFile) {
    processFile(selectedFile);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const droppedFile = event.dataTransfer?.files[0];
  if (
    droppedFile &&
    (droppedFile.type === "text/csv" ||
      droppedFile.name.toLowerCase().endsWith(".csv"))
  ) {
    processFile(droppedFile);
  }
};

const processFile = (selectedFile: File) => {
  file.value = selectedFile;
  const reader = new FileReader();
  reader.onload = (e) => {
    const csv = e.target?.result as string;
    parseCSV(csv);
  };
  reader.readAsText(selectedFile);
};

const parseCSV = (csv: string) => {
  const data = parseCSVContent(csv);

  if (data.length > 0 && data[0]) {
    headers.value = data[0];
    csvData.value = data.slice(1);
    emit("upload", csvData.value, headers.value);
  }
};

// Lightweight CSV parser that respects quoted fields and escaped quotes.
const parseCSVContent = (csv: string): string[][] => {
  const sanitized = csv.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let currentValue = "";
  let currentRow: string[] = [];
  let inQuotes = false;
  let wasQuoted = false;

  const pushValue = () => {
    const value = wasQuoted ? currentValue : currentValue.trim();
    currentRow.push(value);
    currentValue = "";
    wasQuoted = false;
  };

  const pushRow = () => {
    if (currentRow.length > 0 && currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
    currentRow = [];
  };

  for (let i = 0; i < sanitized.length; i += 1) {
    const char = sanitized[i];

    if (char === '"') {
      if (inQuotes && sanitized[i + 1] === '"') {
        currentValue += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
        if (inQuotes && currentValue === "") {
          wasQuoted = true;
        }
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      pushValue();
      continue;
    }

    if (char === "\n" && !inQuotes) {
      pushValue();
      pushRow();
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || wasQuoted || currentRow.length > 0) {
    pushValue();
  }

  if (currentRow.length > 0) {
    pushRow();
  }

  return rows;
};

const removeFile = () => {
  file.value = null;
  csvData.value = [];
  headers.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};
</script>

<style scoped>
.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #007bff;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.preview {
  margin-top: 1rem;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.clear-button {
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-button:hover {
  background-color: #f5f5f5;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

th {
  background-color: #f5f5f5;
}
</style>
