<template>
  <section class="surface-sheen rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
    <CommanderSearchSummary
      :has-selection="Boolean(primarySelection)"
      :summary-name="summaryName"
      :summary-mana-cost="summaryManaCost"
      @reset="clearSelection('primary')"
    />

    <div class="mt-4 space-y-4">
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="space-y-2">
          <CommanderSearchField
            v-model="primaryQuery"
            field-id="primary-commander-search"
            label="Primary commander"
            placeholder="Atraxa, Grand Unifier..."
            icon-path="M9.5 3A6.5 6.5 0 0116 9.5a6.47 6.47 0 01-1.17 3.72l5.47 5.47-1.06 1.06-5.47-5.47A6.47 6.47 0 019.5 16 6.5 6.5 0 113 9.5 6.5 6.5 0 019.5 3m0 2A4.5 4.5 0 005 9.5 4.5 4.5 0 109.5 5z"
            :results="primaryResults"
            :loading="primaryLoading"
            :error="primaryError"
            helper-text="Type at least 2 characters to search."
            :show-clear="Boolean(primaryQuery || primarySelection)"
            @clear="clearSearch('primary')"
            @select="handleSelection('primary', $event)"
          />
          <button
            v-if="primarySelection && !hasPartner"
            type="button"
            class="mt-1 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            @click="addPartner"
          >
            Add partner
          </button>
          <button
            v-if="primarySelection && hasPartner"
            type="button"
            class="mt-1 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
            @click="removePartner"
          >
            Remove partner
          </button>
        </div>

        <div v-show="hasPartner" class="space-y-2">
          <CommanderSearchField
            v-model="partnerQuery"
            field-id="partner-commander-search"
            label="Partner commander"
            placeholder="Choose a partner..."
            icon-path="M12 13c2.7 0 5.8 1.29 6 3.89V19H6v-2.11C6.2 14.29 9.3 13 12 13m0-2a4 4 0 114-4 4 4 0 01-4 4m0 6c-3.33 0-8 1.66-8 5v2h16v-2c0-3.34-4.67-5-8-5z"
            :results="partnerResults"
            :loading="partnerLoading"
            :error="partnerError"
            helper-text="Optional - add a partner for a combined decklist."
            :disabled="partnerDisabled"
            :warning-text="partnerDisabled ? 'Select a primary commander before choosing a partner.' : ''"
            :show-clear="Boolean((partnerQuery || partnerSelection) && !partnerDisabled)"
            @clear="clearSearch('partner')"
            @select="handleSelection('partner', $event)"
          />
        </div>
      </div>

      <CommanderSelectionDisplay
        :primary-selection="primarySelection"
        :partner-selection="partnerSelection"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { toRef } from "vue";
import CommanderSearchSummary from "./commander-search/CommanderSearchSummary.vue";
import CommanderSearchField from "./commander-search/CommanderSearchField.vue";
import CommanderSelectionDisplay from "./commander-search/CommanderSelectionDisplay.vue";
import { useCommanderSearch } from "../composables/useCommanderSearch";
import type { CommanderSelection } from "../types/edhrec";

const props = defineProps<{
  selectedSlug?: string | null;
}>();

const emit = defineEmits<{
  "commander-selected": [slug: string];
  "selection-change": [state: CommanderSelection];
}>();

const {
  primarySelection,
  partnerSelection,
  hasPartner,
  partnerDisabled,
  summaryName,
  summaryManaCost,
  primaryQuery,
  primaryResults,
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
  addPartner,
  removePartner,
} = useCommanderSearch({
  selectedSlug: toRef(props, "selectedSlug"),
  onCommanderSelected: (slug) => emit("commander-selected", slug),
  onSelectionChange: (payload) => emit("selection-change", payload),
});

defineExpose({
  selectPrimaryCommander,
});
</script>
