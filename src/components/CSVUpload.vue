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
      <input ref="fileInput" type="file" accept=".csv" class="sr-only" @change="handleFileSelect" />
      <div v-if="!file" class="space-y-2">
        <p class="text-lg font-semibold text-slate-900 dark:text-white">Upload your collection</p>
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
          class="rounded-full border border-slate-300 px-4 py-1 text-sm font-medium text-slate-700 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-600 dark:text-slate-200 dark:hover:text-rose-200"
          aria-label="Remove uploaded CSV file"
          @click.stop="removeFile"
        >
          Remove
        </button>
      </Card>
    </Card>

    <GlobalLoadingBanner
      v-if="csvLoading"
      scope="csv-upload"
      inline
      placement-class="upload-progress w-full text-center text-sm"
    >
      Processing CSV data...
    </GlobalLoadingBanner>

    <div
      v-if="validationSummary"
      class="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 shadow-sm shadow-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-100"
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" class="text-lg">✅</span>
      <div class="text-left">
        <p class="font-semibold">Valid CSV</p>
        <p>{{ validationSummary }}</p>
      </div>
    </div>

    <div
      v-if="validationResult?.warnings.length"
      class="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 shadow-sm shadow-amber-100 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100"
      role="status"
      aria-live="polite"
    >
      <p class="flex items-center gap-2 font-semibold">
        <span aria-hidden="true">⚠️</span>
        <span>Warnings</span>
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li v-for="(warning, index) in validationResult?.warnings" :key="`${warning}-${index}`">
          {{ warning }}
        </li>
      </ul>
    </div>

    <div
      v-if="validationResult?.errors.length"
      class="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-sm text-rose-900 shadow-sm shadow-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100"
      role="status"
      aria-live="assertive"
    >
      <p class="flex items-center gap-2 font-semibold">
        <span aria-hidden="true">❌</span>
        <span>Errors</span>
      </p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li v-for="(error, index) in validationResult?.errors" :key="`${error}-${index}`">
          {{ error }}
        </li>
      </ul>
    </div>

    <p
      v-if="errorMessage"
      class="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-2 text-sm font-medium text-rose-700 shadow-sm shadow-rose-100 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100"
    >
      {{ errorMessage }}
    </p>

    <div class="flex flex-col gap-4 text-xs text-slate-500 dark:text-slate-400">
      <p>Your deck data stays in this browser session only and clears automatically on refresh.</p>
      <div
        class="rounded-3xl border border-slate-200/60 bg-white/80 p-4 text-left text-slate-600 shadow-sm shadow-slate-100 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300"
      >
        <p class="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
          CSV format
        </p>
        <div class="mt-3 space-y-3 text-sm">
          <div>
            <p class="font-semibold text-slate-800 dark:text-white">Required column</p>
            <p>Name (or Card Name) — the card name we match against EDHREC lists.</p>
          </div>
          <div>
            <p class="font-semibold text-slate-800 dark:text-white">Optional columns</p>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>Quantity — number of copies</li>
              <li>Foil — Yes/No</li>
              <li>Set — three-letter set code</li>
              <li>Any other columns (ignored but kept in the CSV)</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-slate-800 dark:text-white">Example</p>
            <pre
              class="mt-2 rounded-2xl bg-slate-900/90 p-3 text-xs font-mono text-emerald-100 dark:bg-slate-900/80"
            >Name,Quantity,Foil,Set
Sol Ring,1,No,C21
Lightning Greaves,1,Yes,M19</pre>
          </div>
          <div
            class="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-emerald-300/60 px-3 py-2 text-[0.75rem] text-slate-600 dark:border-emerald-400/40 dark:text-slate-300"
          >
            <span class="font-semibold text-emerald-600 dark:text-emerald-300">Need an example?</span>
            <button
              type="button"
              class="rounded-full border border-emerald-500 px-3 py-1 font-semibold text-emerald-700 transition hover:bg-emerald-500/10 dark:border-emerald-300 dark:text-emerald-200 dark:hover:bg-emerald-300/10"
              aria-label="Load sample inventory CSV"
              @click="loadSampleInventory"
            >
              Use mine
            </button>
            <a
              :href="templateCsvUrl"
              download="inventory-template.csv"
              class="rounded-full border border-transparent px-3 py-1 font-semibold text-emerald-600 underline decoration-dotted decoration-emerald-400 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100"
            >
              Download template
            </a>
            <a
              :href="sampleCsvUrl"
              download="inventory.csv"
              class="rounded-full border border-transparent px-3 py-1 font-semibold text-emerald-600 underline decoration-dotted decoration-emerald-400 hover:text-emerald-800 dark:text-emerald-200 dark:hover:text-emerald-100"
            >
              Download full sample
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Card, GlobalLoadingBanner } from ".";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useGlobalNotices } from "../composables/useGlobalNotices";
import { handleError } from "../utils/errorHandler";
import { validateCsv, type CsvValidationResult } from "../utils/csvValidator";

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const errorMessage = ref<string | null>(null);
const { rows: csvRows, headers: csvHeaders, setCsvData, clearCsvData } = useCsvUpload();
const csvScope = "csv-upload";

const { withLoading, getScopeLoading } = useGlobalLoading();
const csvLoading = getScopeLoading(csvScope);
const { notifyError, notifySuccess } = useGlobalNotices();
const validationResult = ref<CsvValidationResult | null>(null);
const importedCardCount = ref(0);

const invalidCsvMessage = "We couldn't process that CSV. Fix the errors below and try again.";

const emit = defineEmits<{
  upload: [data: string[][], headers: string[]];
  "file-uploaded": [data: string[][], headers: string[]];
}>();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const invalidFileMessage = "Please select a valid CSV file";

const isCsvFile = (candidate: File) =>
  candidate.type === "text/csv" || candidate.name.toLowerCase().endsWith(".csv");

const markInvalidFile = () => {
  errorMessage.value = invalidFileMessage;
  notifyError(invalidFileMessage);
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFile = target.files?.[0];
  if (selectedFile) {
    if (!isCsvFile(selectedFile)) {
      markInvalidFile();
      target.value = "";
      return;
    }
    processFile(selectedFile);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  const droppedFile = event.dataTransfer?.files[0];
  if (!droppedFile) {
    return;
  }

  if (isCsvFile(droppedFile)) {
    processFile(droppedFile);
  } else {
    markInvalidFile();
  }
};

const processFile = (selectedFile: File) => {
  errorMessage.value = null;
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
          notifyError("We couldn't read that CSV. Please try again.");
          resolve();
        };
        reader.readAsText(selectedFile);
      }),
    "Processing CSV upload...",
    csvScope
  );
};

const sampleCsvUrl = new URL("../assets/inventory.csv", import.meta.url).href;
const templateCsvUrl = new URL("../assets/inventory-template.csv", import.meta.url).href;

const resetValidation = () => {
  validationResult.value = null;
  importedCardCount.value = 0;
};

const formatCardCount = (count: number) => {
  const pluralized = count === 1 ? "card" : "cards";
  return `Found ${count} ${pluralized}`;
};

const validationSummary = computed(() => {
  if (!validationResult.value || validationResult.value.errors.length) {
    return null;
  }
  return formatCardCount(importedCardCount.value);
});

const parseCSV = (csv: string) => {
  resetValidation();
  errorMessage.value = null;
  const data = parseCSVContent(csv);

  if (!data.length || !data[0] || !data[0].length) {
    const message = "That CSV doesn't appear to contain any card rows.";
    errorMessage.value = message;
    notifyError(message);
    clearCsvData();
    return;
  }

  const headerRow = data[0];
  const rawRows = data.slice(1);
  const validation = validateCsv(headerRow, rawRows);
  validationResult.value = validation;

  if (!validation.valid) {
    errorMessage.value = invalidCsvMessage;
    notifyError("CSV validation failed. Check the errors below.");
    clearCsvData();
    return;
  }

  const usableRows = rawRows.filter((row) => row.some((cell) => (cell ?? "").trim().length > 0));
  if (!usableRows.length) {
    validationResult.value = {
      ...validation,
      valid: false,
      errors: [...validation.errors, "No usable card rows detected after filtering blanks."],
    };
    errorMessage.value = invalidCsvMessage;
    notifyError("CSV validation failed. Check the errors below.");
    clearCsvData();
    return;
  }
  importedCardCount.value = usableRows.length;
  setCsvData(usableRows, headerRow);
  emit("upload", csvRows.value, csvHeaders.value);
  emit("file-uploaded", csvRows.value, csvHeaders.value);
  notifySuccess(formatCardCount(importedCardCount.value));
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
    if (currentRow.length > 0) {
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
  errorMessage.value = null;
  clearCsvData();
  resetValidation();
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const loadSampleInventory = async () => {
  try {
    await withLoading(
      async () => {
        const response = await fetch(sampleCsvUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
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
    handleError(error, {
      notify: true,
      fallbackMessage: "Unable to load the sample inventory. Please try again.",
      context: "Sample inventory",
    });
  }
};

const __templateBindings = {
  Card,
  GlobalLoadingBanner,
  csvLoading,
  triggerFileInput,
  handleFileSelect,
  handleDrop,
  removeFile,
  loadSampleInventory,
};
void __templateBindings;
</script>
