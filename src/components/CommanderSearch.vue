<template>
  <section :class="containerClasses">
    <template v-if="isMinimal">
      <CommanderSearchField
        v-model="primaryQuery"
        class="commander-search-minimal-field"
        field-id="primary-commander-search"
        label="Search commanders"
        placeholder="Search commanders"
        icon-path="M9.5 3A6.5 6.5 0 0116 9.5a6.47 6.47 0 01-1.17 3.72l5.47 5.47-1.06 1.06-5.47-5.47A6.47 6.47 0 019.5 16 6.5 6.5 0 113 9.5 6.5 6.5 0 019.5 3m0 2A4.5 4.5 0 005 9.5 4.5 4.5 0 109.5 5z"
        :results="primaryResults"
        :recent-results="primaryRecentResults"
        :loading="primaryLoading"
        :error="primaryError"
        helper-text="Type at least 2 characters to search commanders."
        :show-clear="Boolean(primaryQuery || primarySelection)"
        label-sr-only
        helper-sr-only
        @clear="clearSearch('primary')"
        @select="handleFieldSelection('primary', $event)"
      />
    </template>

    <div v-else class="space-y-4">
      <div v-if="primarySelection" class="grid gap-3">
        <div class="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-[var(--shadow-soft)]">
          <div class="flex items-start justify-between gap-3">
            <div class="grid flex-1 gap-3 sm:grid-cols-2">
              <div class="space-y-1">
                <p class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Commander
                </p>
                <p class="text-base font-semibold text-[color:var(--text)]">
                  {{ primarySelection }}
                </p>
                <p class="text-xs text-[color:var(--muted)]">
                  {{ primaryManaSummary }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Partner slot
                </p>
                <p class="text-base font-semibold text-[color:var(--text)]">
                  {{ partnerHeadline }}
                </p>
                <p class="text-xs text-[color:var(--muted)]">
                  {{ partnerSupportText }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
              aria-label="Clear commander selection"
              @click="handleResetPrimary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <CommanderSearchField
          v-model="primaryQuery"
          field-id="primary-commander-search"
          label="Primary commander"
          placeholder="Atraxa, Grand Unifier..."
          icon-path="M9.5 3A6.5 6.5 0 0116 9.5a6.47 6.47 0 01-1.17 3.72l5.47 5.47-1.06 1.06-5.47-5.47A6.47 6.47 0 019.5 16 6.5 6.5 0 113 9.5 6.5 6.5 0 019.5 3m0 2A4.5 4.5 0 005 9.5 4.5 4.5 0 109.5 5z"
          :results="primaryResults"
          :recent-results="primaryRecentResults"
          :loading="primaryLoading"
          :error="primaryError"
          helper-text="Search for the commander that anchors this deck."
          :show-clear="Boolean(primaryQuery || primarySelection)"
          @clear="clearSearch('primary')"
          @select="handleFieldSelection('primary', $event)"
        />

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <CommanderSearchField
            v-if="showPartnerField"
            v-model="partnerQuery"
            field-id="partner-commander-search"
            label="Partner commander"
            placeholder="Add a partner commander..."
            icon-path="M12 13c2.7 0 5.8 1.29 6 3.89V19H6v-2.11C6.2 14.29 9.3 13 12 13m0-2a4 4 0 114-4 4 4 0 01-4 4m0 6c-3.33 0-8 1.66-8 5v2h16v-2c0-3.34-4.67-5-8-5z"
            :results="partnerResults"
            :loading="partnerLoading"
            :error="partnerError"
            helper-text="Add a partner when the deck uses a second commander."
            :disabled="partnerDisabled"
            :warning-text="
              partnerDisabled ? 'Select a primary commander before choosing a partner.' : ''
            "
            :show-clear="Boolean((partnerQuery || partnerSelection) && !partnerDisabled)"
            @clear="clearSearch('partner')"
            @select="handleFieldSelection('partner', $event)"
          />
        </Transition>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, nextTick, toRef } from "vue";
import CommanderSearchField from "./commander-search/CommanderSearchField.vue";
import { useCommanderSearch } from "../composables/useCommanderSearch";
import type { CommanderSelection } from "../types/edhrec";

const props = withDefaults(
  defineProps<{
    selectedSlug?: string | null;
    selection?: CommanderSelection | null;
    mode?: "default" | "minimal";
  }>(),
  {
    mode: "default",
  }
);

const emit = defineEmits<{
  "commander-selected": [slug: string];
  "selection-change": [state: CommanderSelection];
  "add-partner": [];
  "edit-partner": [];
  "remove-partner": [];
  "focus-primary-search": [];
  "focus-partner-search": [];
}>();

const {
  primarySelection,
  partnerSelection,
  hasPartner,
  partnerDisabled,
  summaryManaCost,
  primaryQuery,
  primaryResults,
  primaryRecentResults,
  primaryError,
  primaryLoading,
  partnerQuery,
  partnerResults,
  partnerError,
  partnerLoading,
  handleSelection,
  clearSelection,
  clearSearch,
  selectPrimaryCommander,
} = useCommanderSearch({
  selectedSlug: toRef(props, "selectedSlug"),
  selectedSelection: toRef(props, "selection"),
  onCommanderSelected: (slug) => emit("commander-selected", slug),
  onSelectionChange: (payload) => emit("selection-change", payload),
});

const isMinimal = computed(() => props.mode === "minimal");
const showPartnerField = computed(() => !isMinimal.value && Boolean(primarySelection.value));
const primaryManaSummary = computed(() => {
  if (hasPartner.value && summaryManaCost.value) {
    return summaryManaCost.value;
  }
  return summaryManaCost.value || "Commander selected.";
});
const partnerHeadline = computed(() => {
  if (!hasPartner.value) {
    return "Optional";
  }
  return partnerSelection.value || "Select a partner";
});
const partnerSupportText = computed(() => {
  if (!hasPartner.value) {
    return "Leave this empty for single-commander decks.";
  }
  if (!partnerSelection.value) {
    return "Search for the second commander to complete the deck.";
  }
  return "Partner decks stay visible in the compare summary and results.";
});

const containerClasses = computed(() =>
  isMinimal.value
    ? "w-full"
    : "w-full"
);

const focusField = async (fieldId: string) => {
  await nextTick();
  const input = document.getElementById(fieldId);
  if (input instanceof HTMLInputElement || input instanceof HTMLElement) {
    input.focus();
  }
};

const focusPrimarySearch = async () => {
  emit("focus-primary-search");
  await focusField("primary-commander-search");
};

const focusPartnerSearch = async () => {
  emit("focus-partner-search");
  await focusField("partner-commander-search");
};

const handleFieldSelection = async (field: "primary" | "partner", commanderName: string) => {
  handleSelection(field, commanderName);
  await nextTick();
};

const handleResetPrimary = () => {
  const shouldEmitRemovePartner = hasPartner.value;
  clearSelection("primary");
  if (shouldEmitRemovePartner) {
    emit("remove-partner");
  }
  void focusPrimarySearch();
};

defineExpose({
  selectPrimaryCommander,
  startPartnerSelection: () => {
    void focusPartnerSearch();
  },
  focusPrimarySearch,
  focusPartnerSearch,
});
</script>

<style scoped>
.commander-search-minimal-field {
  margin: 0;
}
</style>
