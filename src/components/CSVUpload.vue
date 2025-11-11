<template>
  <div class="w-full max-w-xl space-y-4 text-slate-900 dark:text-slate-100">
    <div
      class="group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-2xl shadow-slate-900/5 transition hover:border-emerald-400/70 hover:bg-emerald-50/50 dark:border-slate-600/80 dark:bg-slate-900/50 dark:text-slate-100 dark:shadow-black/40 dark:hover:bg-slate-900/70"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <input
        ref="fileInput"
        type="file"
        accept=".csv"
        class="sr-only"
        @change="handleFileSelect"
      />
      <div v-if="!file" class="space-y-2">
        <p class="text-lg font-semibold text-slate-900 dark:text-white">
          Upload your deck CSV
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Drag and drop or click to browse files. CSV only.
        </p>
      </div>
      <div
        v-else
        class="flex w-full flex-col items-center gap-3 rounded-2xl bg-white/80 p-4 text-left text-slate-700 shadow-inner shadow-slate-900/5 dark:bg-slate-900/80 dark:text-slate-200 sm:flex-row sm:justify-between"
      >
        <div>
          <p class="font-semibold">{{ file.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ csvData.length }} rows detected
          </p>
        </div>
        <button
          type="button"
          @click.stop="removeFile"
          class="rounded-full border border-slate-300 px-4 py-1 text-sm font-medium text-slate-700 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-600 dark:text-slate-200 dark:hover:text-rose-200"
        >
          Remove
        </button>
      </div>
    </div>

    <p class="text-xs text-slate-500 dark:text-slate-400">
      We only store your data in local storage for quick comparisons—refresh to
      clear it anytime.
    </p>
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
