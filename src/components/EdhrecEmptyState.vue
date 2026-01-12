<template>
  <Card
    as="article"
    padding="p-6 sm:p-10"
    rounded="rounded-2xl"
    border="border border-[color:var(--border)]"
    background="bg-[color:var(--surface)]"
    shadow="shadow-[var(--shadow-soft)]"
    class="relative overflow-hidden"
  >
    <div class="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
      <div class="space-y-6 text-center lg:text-left">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)] ring-1 ring-[color:var(--border)] lg:mx-0">
          <svg viewBox="0 0 24 24" class="h-8 w-8" fill="currentColor" aria-hidden="true">
            <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.8.4l-2.9-2.17a1 1 0 0 0-.6-.2H6a2 2 0 0 1-2-2z" />
            <path d="M7.5 9.5h9v1h-9zm0 3h6v1h-6z" class="text-[color:var(--accent)]" />
          </svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-bold text-[color:var(--text)]">
            Find your next commander deck
          </h3>
          <p class="text-sm text-[color:var(--muted)] max-w-2xl mx-auto lg:mx-0">
            Search for a commander above to see EDHREC recommendations, live Scryfall pricing, and instantly highlight the cards you already own.
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-left shadow-[var(--shadow-soft)]">
            <span class="mt-1 text-[color:var(--accent)]">✨</span>
            <div>
              <p class="text-sm font-semibold text-[color:var(--text)]">Compare recommendations</p>
              <p class="text-xs text-[color:var(--muted)]">EDHREC picks side-by-side with your owned cards.</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-left shadow-[var(--shadow-soft)]">
            <span class="mt-1 text-[color:var(--accent)]">📊</span>
            <div>
              <p class="text-sm font-semibold text-[color:var(--text)]">See live prices</p>
              <p class="text-xs text-[color:var(--muted)]">USD/EUR pricing pulled straight from Scryfall.</p>
            </div>
          </div>
        </div>
        <div class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            Popular commanders
          </p>
          <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
            <button
              v-for="commander in popular"
              :key="commander.name"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent-soft)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent-strong)] hover:shadow-[var(--shadow-soft)]"
              @click="emit('select', commander.name)"
            >
              <span class="text-[color:var(--accent)]">▶</span>
              {{ commander.name }}
            </button>
          </div>
        </div>
        <p class="flex items-center justify-center gap-2 text-xs text-[color:var(--muted)] lg:justify-start">
          <span aria-hidden="true">💡</span>
          Upload a CSV to automatically spotlight cards you own.
        </p>
      </div>

      <div class="relative mx-auto w-full max-w-md">
        <div class="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent)] flex items-center justify-center">
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
                  <path d="M12 2 3 6l9 4 9-4z" />
                  <path d="m3 10 9 4 9-4" class="text-[color:var(--accent)]" />
                  <path d="m3 14 9 4 9-4" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-[color:var(--text)]">Results preview</p>
                <p class="text-xs text-[color:var(--muted)]">Your recommendations will appear here.</p>
              </div>
            </div>
            <div class="space-y-3">
              <div
                v-for="placeholder in 3"
                :key="placeholder"
                class="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-2 shadow-[var(--shadow-soft)]"
              >
                <div class="flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full bg-[color:var(--accent)]"></span>
                  <div>
                    <div class="h-3 w-28 rounded bg-[color:var(--surface-strong)]"></div>
                    <div class="mt-1 h-2.5 w-20 rounded bg-[color:var(--surface-strong)]"></div>
                  </div>
                </div>
                <div class="h-3 w-12 rounded bg-[color:var(--accent-soft)]"></div>
              </div>
            </div>
            <div class="flex items-center justify-between rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[color:var(--text)]">
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
