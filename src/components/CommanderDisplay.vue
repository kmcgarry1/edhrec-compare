<template>
  <Card
    v-if="cardImageUrl || isLoading"
    as="div"
    padding="p-4"
    rounded="rounded-2xl"
    class="w-full bg-white/70 text-slate-900 dark:bg-slate-900/70 dark:text-slate-100"
  >
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex-1">
        <p class="text-xs uppercase tracking-[0.3em] text-emerald-500/80">
          {{ label }}
        </p>
        <h3 class="mt-1 text-xl font-semibold">
          {{ commanderName || "Commander pending" }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ description }}
        </p>
      </div>
      <div class="flex items-center justify-center">
        <template v-if="isLoading">
          <div
            class="h-40 w-28 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/50"
          ></div>
        </template>
        <img
          v-else-if="cardImageUrl"
          :src="cardImageUrl"
          :alt="commanderName"
          class="h-80 w-auto rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-black/40"
        />
      </div>
    </div>
  </Card>
</template>
<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { getCardImage } from "../api/scryfallApi";
import { Card } from ".";

const props = defineProps<{
  commanderName: string;
  label?: string;
  description?: string;
}>();

const cardImageUrl = ref<string>("");
const isLoading = ref(false);

const label = computed(() => props.label ?? "Commander Preview");
const description = computed(
  () =>
    props.description ??
    "Preview pulled from Scryfall when you pick a commander."
);

const loadImage = async () => {
  if (!props.commanderName) {
    cardImageUrl.value = "";
    return;
  }
  isLoading.value = true;
  try {
    const imageUrl = await getCardImage(props.commanderName);
    cardImageUrl.value = imageUrl ?? "";
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.commanderName,
  () => {
    void loadImage();
  },
  { immediate: true }
);
</script>
