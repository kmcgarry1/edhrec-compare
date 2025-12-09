<template>
  <Card
    as="article"
    padding="p-6 sm:p-10"
    rounded="rounded-2xl"
    border="border border-slate-200/80 dark:border-slate-800/70"
    background="bg-white/95 dark:bg-slate-900/70"
    shadow="shadow-xl shadow-slate-900/5 dark:shadow-black/40"
    class="relative overflow-hidden"
  >
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-slate-50/60 blur-3xl dark:from-emerald-500/10 dark:to-slate-900/40" aria-hidden="true"></div>
    <div class="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
      <div class="space-y-6 text-center lg:text-left">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/30 lg:mx-0">
          <svg viewBox="0 0 24 24" class="h-8 w-8" fill="currentColor" aria-hidden="true">
            <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.8.4l-2.9-2.17a1 1 0 0 0-.6-.2H6a2 2 0 0 1-2-2z" />
            <path d="M7.5 9.5h9v1h-9zm0 3h6v1h-6z" class="text-emerald-400" />
          </svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Find your next commander deck
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
            Search for a commander above to see EDHREC recommendations, live Scryfall pricing, and instantly highlight the cards you already own.
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 text-left shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
            <span class="mt-1 text-emerald-500">✨</span>
            <div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">Compare recommendations</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">EDHREC picks side-by-side with your owned cards.</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 text-left shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
            <span class="mt-1 text-emerald-500">📊</span>
            <div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">See live prices</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">USD/EUR pricing pulled straight from Scryfall.</p>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Popular commanders
          </p>
          <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
            <button
              v-for="commander in popular"
              :key="commander.name"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
              @click="emit('select', commander.name)"
            >
              <span class="text-emerald-400">▶</span>
              {{ commander.name }}
            </button>
          </div>
        </div>
        <p class="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 lg:justify-start">
          <span aria-hidden="true">💡</span>
          Upload a CSV to automatically spotlight cards you own.
        </p>
      </div>

      <div class="relative mx-auto w-full max-w-md">
        <div class="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-6 shadow-2xl shadow-slate-900/5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/80 dark:to-emerald-950/30 dark:shadow-black/50">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 3 6l9 4 9-4z" />
                  <path d="m3 10 9 4 9-4" class="text-emerald-400" />
                  <path d="m3 14 9 4 9-4" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">Results preview</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Your recommendations will appear here.</p>
              </div>
            </div>
            <div class="space-y-3">
              <div
                v-for="placeholder in 3"
                :key="placeholder"
                class="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70"
              >
                <div class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full bg-emerald-400/70"></span>
                  <div>
                    <div class="h-3 w-28 rounded bg-slate-200/80 dark:bg-slate-700/80"></div>
                    <div class="mt-1 h-2.5 w-20 rounded bg-slate-200/60 dark:bg-slate-700/70"></div>
                  </div>
                </div>
                <div class="h-3 w-12 rounded bg-emerald-200/80 dark:bg-emerald-500/40"></div>
              </div>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-dashed border-emerald-200/80 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-100">
              <span>Owned cards highlighted automatically</span>
              <span aria-hidden="true">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from "./Card.vue";

const props = withDefaults(
  defineProps<{
    popular?: Array<{ name: string }>;
  }>(),
  {
    popular: () => [
      { name: "Atraxa, Grand Unifier" },
      { name: "The Ur-Dragon" },
      { name: "Miirym, Sentinel Wyrm" },
    ],
  }
);

const emit = defineEmits<{
  select: [name: string];
}>();

const popular = props.popular;
</script>
