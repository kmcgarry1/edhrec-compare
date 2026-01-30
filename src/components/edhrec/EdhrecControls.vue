<template>
  <div class="space-y-4">
    <CommanderSearch
      ref="commanderSearchRef"
      :selected-slug="selectedSlug"
      @commander-selected="emit('commander-selected', $event)"
      @selection-change="emit('selection-change', $event)"
    />
    <Card padding="p-4 sm:p-5" class="space-y-3">
      <CommanderFilters
        :bracket="bracket"
        :modifier="modifier"
        :page-type="pageType"
        :companion="companion"
        @update:bracket="emit('update:bracket', $event)"
        @update:modifier="emit('update:modifier', $event)"
        @update:page-type="emit('update:page-type', $event)"
        @update:companion="emit('update:companion', $event)"
      />
      <p class="text-xs text-[color:var(--muted)]">
        Filters update the EDHREC source URL and sync to the current route.
      </p>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Card from "../Card.vue";
import CommanderFilters from "../CommanderFilters.vue";
import CommanderSearch from "../CommanderSearch.vue";
import type { CommanderSelection } from "../../types/edhrec";

defineProps<{
  selectedSlug?: string | null;
  bracket: string;
  modifier: string;
  pageType: string;
  companion: string;
}>();

const emit = defineEmits<{
  "commander-selected": [slug: string];
  "selection-change": [payload: CommanderSelection];
  "update:bracket": [value: string | number];
  "update:modifier": [value: string | number];
  "update:page-type": [value: string | number];
  "update:companion": [value: string | number];
}>();

const commanderSearchRef = ref<InstanceType<typeof CommanderSearch> | null>(null);

const selectPrimaryCommander = (name: string) => {
  commanderSearchRef.value?.selectPrimaryCommander(name);
};

defineExpose({
  selectPrimaryCommander,
});
</script>
