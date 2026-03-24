<template>
  <CStack as="div" gap="lg" class="w-full text-[color:var(--text)] lg:max-w-xl">
    <CFieldShell
      label="Collection CSV"
      label-for="collection-csv-upload"
      helper="Your deck data stays in this browser session only and clears automatically on refresh."
    />

    <CFieldShell label="Use this CSV for" label-as="div">
      <CGrid
        variant="halves"
        gap="sm"
        role="radiogroup"
        aria-label="CSV usage mode"
      >
        <CSurface
          v-for="option in modeOptions"
          :key="option.value"
          as="button"
          type="button"
          role="radio"
          size="sm"
          radius="xl"
          class="text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          :background="mode === option.value ? 'bg-[color:var(--accent-soft)]' : 'bg-[color:var(--surface)]'"
          :border="mode === option.value ? 'border border-[color:var(--accent)]' : 'border border-[color:var(--border)]'"
          :aria-checked="mode === option.value"
          @click="setMode(option.value)"
        >
          <CStack gap="xs">
            <CText tag="p" variant="body" weight="semibold">
              {{ option.label }}
            </CText>
            <CText tag="p" variant="helper" tone="muted">
              {{ option.description }}
            </CText>
          </CStack>
        </CSurface>
      </CGrid>
    </CFieldShell>

    <CSurface
      as="div"
      variant="dashed"
      size="none"
      radius="3xl"
      shadow="base"
      class="group flex cursor-pointer flex-col items-center justify-center gap-4 p-6 text-center transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] sm:p-8 lg:p-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
      :role="file ? undefined : 'button'"
      :tabindex="file ? undefined : 0"
      :aria-label="file ? undefined : 'Upload collection CSV'"
      @click="triggerFileInput"
      @keydown="handleCardKeydown"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <input
        id="collection-csv-upload"
        ref="fileInput"
        type="file"
        accept=".csv"
        class="sr-only"
        aria-label="Collection CSV"
        aria-describedby="csv-upload-helper"
        @change="handleFileSelect"
      />

      <CStack v-if="!file" gap="xs">
        <CText tag="p" variant="title" class="text-lg">
          Upload your collection
        </CText>
        <CText id="csv-upload-helper" tag="p" variant="body" tone="muted">
          Drag and drop or click to browse files. CSV only.
        </CText>
      </CStack>

      <CSurface
        v-else
        size="sm"
        radius="xl"
        class="flex w-full flex-col items-center gap-3 text-left sm:flex-row sm:justify-between"
      >
        <CText id="csv-upload-helper" tag="p" variant="helper" class="sr-only">
          Click to replace the uploaded CSV file.
        </CText>

        <CStack gap="xs">
          <CText tag="p" variant="body" weight="semibold">
            {{ file.name }}
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            {{ csvRows.length }} rows detected
          </CText>
        </CStack>

        <CButton
          type="button"
          variant="secondary"
          size="sm"
          aria-label="Remove uploaded CSV file"
          @click.stop="removeFile"
        >
          Remove
        </CButton>
      </CSurface>
    </CSurface>

    <GlobalLoadingBanner
      v-if="csvLoading"
      scope="csv-upload"
      inline
      placement-class="upload-progress w-full text-center text-sm"
    >
      Processing CSV data...
    </GlobalLoadingBanner>

    <Transition name="success-checkmark">
      <CNotice
        v-if="validationSummary"
        tone="success"
        title="Valid CSV"
        :message="validationSummary"
      >
        <template #icon>
          <div class="success-indicator text-[color:var(--accent)]" aria-hidden="true">
            <svg class="checkmark" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path class="checkmark-check" d="M14 27l7.5 7.5L38 18" fill="none" />
            </svg>
          </div>
        </template>
      </CNotice>
    </Transition>

    <CNotice
      v-if="validationResult?.warnings.length"
      tone="warn"
      title="Warnings"
    >
      <template #default>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li
            v-for="(warning, index) in validationResult?.warnings"
            :key="`${warning}-${index}`"
          >
            {{ warning }}
          </li>
        </ul>
      </template>
    </CNotice>

    <CNotice
      v-if="validationResult?.errors.length"
      tone="danger"
      title="Errors"
      aria-live="assertive"
    >
      <template #default>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li
            v-for="(error, index) in validationResult?.errors"
            :key="`${error}-${index}`"
          >
            {{ error }}
          </li>
        </ul>
      </template>
    </CNotice>

    <CNotice
      v-if="errorMessage"
      tone="danger"
      :message="errorMessage"
      role="alert"
      aria-live="assertive"
    />

    <CStack gap="md">
      <details class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-left">
        <summary class="cursor-pointer text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          CSV format
        </summary>
        <CStack gap="md" class="mt-3 text-sm text-[color:var(--muted)]">
          <CStack gap="xs">
            <CText tag="p" variant="body" weight="semibold">
              Required column
            </CText>
            <CText tag="p" variant="body" tone="muted">
              Name (or Card Name) - the card name we match against EDHREC lists.
            </CText>
          </CStack>

          <CStack gap="xs">
            <CText tag="p" variant="body" weight="semibold">
              Optional columns
            </CText>
            <ul class="mt-1 list-disc space-y-1 pl-5">
              <li>Quantity - number of copies</li>
              <li>Foil - Yes/No</li>
              <li>Set - three-letter set code</li>
              <li>Any other columns (ignored but kept in the CSV)</li>
            </ul>
          </CStack>

          <CStack gap="xs">
            <CText tag="p" variant="body" weight="semibold">
              Example
            </CText>
            <pre class="mt-2 rounded-2xl bg-[color:var(--surface-muted)] p-3 text-xs font-mono text-[color:var(--text)]">Name,Quantity,Foil,Set
Sol Ring,1,No,C21
Lightning Greaves,1,Yes,M19</pre>
          </CStack>

          <CSurface
            variant="dashed"
            size="none"
            radius="xl"
            class="flex flex-wrap items-center gap-2 px-3 py-2 text-[0.75rem] text-[color:var(--muted)]"
          >
            <CText tag="span" variant="body" weight="semibold">
              Need an example?
            </CText>
            <CButton
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Load sample inventory CSV"
              @click="loadSampleInventory"
            >
              Use mine
            </CButton>
            <a
              :href="templateCsvUrl"
              download="inventory-template.csv"
              class="rounded-full border border-transparent px-3 py-1 font-semibold text-[color:var(--text)] underline decoration-dotted decoration-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Download template
            </a>
            <a
              :href="sampleCsvUrl"
              download="inventory.csv"
              class="rounded-full border border-transparent px-3 py-1 font-semibold text-[color:var(--text)] underline decoration-dotted decoration-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Download full sample
            </a>
          </CSurface>
        </CStack>
      </details>
    </CStack>
  </CStack>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import GlobalLoadingBanner from "./GlobalLoadingBanner.vue";
import {
  CButton,
  CFieldShell,
  CGrid,
  CNotice,
  CStack,
  CSurface,
  CText,
} from "./core";
import { useGlobalLoading } from "../composables/useGlobalLoading";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useCsvUploadMode, type CsvUploadMode } from "../composables/useCsvUploadMode";
import { useGlobalNotices } from "../composables/useGlobalNotices";
import { handleError } from "../utils/errorHandler";
import { validateCsv, type CsvValidationResult } from "../utils/csvValidator";

const fileInput = ref<HTMLInputElement>();
const file = ref<File | null>(null);
const errorMessage = ref<string | null>(null);
const { rows: csvRows, headers: csvHeaders, setCsvData, clearCsvData } = useCsvUpload();
const { mode, setMode } = useCsvUploadMode();
const csvScope = "csv-upload";

const { withLoading, getScopeLoading } = useGlobalLoading();
const csvLoading = getScopeLoading(csvScope);
const { notifyError, notifySuccess } = useGlobalNotices();
const validationResult = ref<CsvValidationResult | null>(null);
const importedCardCount = ref(0);

const invalidCsvMessage = "We couldn't process that CSV. Fix the errors below and try again.";

const modeOptions: Array<{ value: CsvUploadMode; label: string; description: string }> = [
  {
    value: "compare",
    label: "Compare commander decks",
    description: "Use owned/unowned filters against any EDHREC commander.",
  },
  {
    value: "top-50",
    label: "Top 50 scan",
    description: "Match your collection against average decks for top commanders.",
  },
];

const emit = defineEmits<{
  upload: [data: string[][], headers: string[]];
  "file-uploaded": [data: string[][], headers: string[]];
}>();

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleCardKeydown = (event: KeyboardEvent) => {
  if (file.value) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    triggerFileInput();
  }
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
  GlobalLoadingBanner,
  csvLoading,
  triggerFileInput,
  handleCardKeydown,
  handleFileSelect,
  handleDrop,
  removeFile,
  loadSampleInventory,
};
void __templateBindings;
</script>
