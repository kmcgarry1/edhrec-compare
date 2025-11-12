<template>
  <div class="w-full space-y-4 text-slate-900 dark:text-slate-100 lg:max-w-xl">
    <Card
      as="div"
      padding="p-6 sm:p-8 lg:p-10"
      rounded="rounded-3xl"
      border="border-2 border-dashed border-slate-300 dark:border-slate-600/80"
      background="bg-white/90 dark:bg-slate-900/50"
      shadow="shadow-2xl shadow-slate-900/5 dark:shadow-black/40"
      class="group flex cursor-pointer flex-col items-center justify-center gap-4 text-center transition hover:border-emerald-400/70 hover:bg-emerald-50/50 dark:text-slate-100 dark:hover:bg-slate-900/70"
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
          Upload your collection CSV
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Drag and drop or click to browse files. CSV only.
        </p>
      </div>
      <Card
        v-else
        as="div"
        padding="p-4"
        rounded="rounded-2xl"
        border="border border-slate-200/50 dark:border-slate-700/70"
        background="bg-white/80 dark:bg-slate-900/80"
        shadow="shadow-inner shadow-slate-900/5"
        class="flex w-full flex-col items-center gap-3 text-left text-slate-700 dark:text-slate-200 sm:flex-row sm:justify-between"
      >
        <div>
          <p class="font-semibold">{{ file.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ csvRows.length }} rows detected
          </p>
        </div>
        <button
          type="button"
          @click.stop="removeFile"
          class="rounded-full border border-slate-300 px-4 py-1 text-sm font-medium text-slate-700 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-600 dark:text-slate-200 dark:hover:text-rose-200"
        >
          Remove
        </button>
      </Card>
    </Card>

    <GlobalLoadingBanner
      v-if="csvLoading"
      scope="csv-upload"
      inline
      placementClass="w-full text-center text-sm"
    >
      Processing CSV data...
    </GlobalLoadingBanner>

    <div class="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
      <p>
        Your deck data stays in this browser session only and clears
        automatically on refresh.
      </p>
      <div
        class="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-emerald-300/60 px-3 py-2 text-[0.75rem] text-slate-600 dark:border-emerald-400/40 dark:text-slate-300"
      >
        <span class="font-semibold text-emerald-600 dark:text-emerald-300">
          Don't have one?
        </span>
        <button
          type="button"
          class="rounded-full border border-emerald-500 px-3 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-500/10 dark:border-emerald-300 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
          @click="loadSampleInventory"
        >
          Use mine
        </button>
        <a
          :href="sampleCsvUrl"
          download="inventory.csv"
          class="rounded-full border border-transparent px-3 py-1 font-semibold text-emerald-600 underline decoration-dotted decoration-emerald-400 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100"
        >
          Download sample CSV
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { Card, GlobalLoadingBanner } from ".";
import { useCsvUpload } from "../composables/useCsvUpload";

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const {
  rows: csvRows,
  headers: csvHeaders,
  setCsvData,
  clearCsvData,
} = useCsvUpload();
const csvScope = "csv-upload";

const { withLoading, getScopeLoading } = useGlobalLoading();
const csvLoading = getScopeLoading(csvScope);

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
  void withLoading(
    () =>
      new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csv = e.target?.result as string;
          parseCSV(csv);
          resolve();
        };
        reader.onerror = () => {
          console.error("Unable to read CSV file");
          resolve();
        };
        reader.readAsText(selectedFile);
      }),
    "Processing CSV upload...",
    csvScope
  );
};

const sampleCsvUrl = new URL("../assets/inventory.csv", import.meta.url).href;

const parseCSV = (csv: string) => {
  const data = parseCSVContent(csv);

  if (data.length > 0 && data[0]) {
    setCsvData(data.slice(1), data[0]);
    emit("upload", csvRows.value, csvHeaders.value);
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
  clearCsvData();
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const loadSampleInventory = async () => {
  try {
    await withLoading(
      async () => {
        const response = await fetch(sampleCsvUrl);
        const csv = await response.text();
        parseCSV(csv);
        if (typeof File !== "undefined") {
          file.value = new File([csv], "inventory.csv", { type: "text/csv" });
        } else {
          file.value = null;
        }
      },
      "Loading sample CSV...",
      csvScope
    );
  } catch (error) {
    console.error("Unable to load sample inventory:", error);
  }
};
</script>
