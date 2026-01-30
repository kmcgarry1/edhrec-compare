<template>
  <Teleport to="body">
    <div
      v-if="hoveredCardImage && isFullscreenPreview"
      class="fixed inset-0 z-[60] flex flex-col bg-black/80 px-4 py-6 text-white backdrop-blur"
      @click.self="emit('close-preview')"
    >
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/20"
          @click="emit('close-preview')"
        >
          Close
        </button>
      </div>
      <div class="flex flex-1 items-center justify-center">
        <img
          :src="hoveredCardImage"
          alt="Card preview"
          class="max-h-[80vh] w-auto rounded-2xl shadow-2xl shadow-black/60"
        />
      </div>
    </div>
    <Card
      v-else-if="hoveredCardImage"
      as="div"
      padding="p-1.5"
      rounded="rounded-xl"
      border="border border-[color:var(--border)]"
      background="bg-[color:var(--surface)]"
      shadow="shadow-[var(--shadow)]"
      class="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-[color:var(--text)]"
      :fullWidth="false"
      :style="{ left: imagePosition.x + 'px', top: imagePosition.y + 'px' }"
    >
      <img
        :src="hoveredCardImage"
        alt="Card preview"
        class="w-56 rounded-lg shadow-[var(--shadow-soft)]"
      />
    </Card>
  </Teleport>
  <Teleport to="body">
    <div
      v-if="isMobileModalOpen"
      class="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 px-4 py-8 backdrop-blur-sm sm:items-center"
      @click.self="emit('close-modal')"
    >
      <Card
        as="div"
        padding="p-4 sm:p-6"
        rounded="rounded-3xl"
        border="border border-[color:var(--border)]"
        background="bg-[color:var(--surface)]"
        shadow="shadow-[var(--shadow)]"
        class="relative w-full max-w-md space-y-4 text-[color:var(--text)]"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">
              Card Preview
            </p>
            <h3 class="text-xl font-semibold text-[color:var(--text)]">
              {{ modalCard?.name }}
            </h3>
            <p class="text-sm text-[color:var(--muted)]">
              {{ modalCard?.type_line }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <a
              v-if="scryfallLink"
              :href="scryfallLink"
              target="_blank"
              rel="noreferrer"
              role="button"
              class="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              View on Scryfall
            </a>
            <button
              type="button"
              class="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
              @click="emit('close-modal')"
            >
              Close
            </button>
          </div>
        </div>
        <div class="pointer-events-none flex justify-center">
          <div
            v-if="modalLoading"
            class="h-64 w-44 animate-pulse rounded-2xl bg-[color:var(--surface-muted)]"
          ></div>
          <img
            v-else-if="modalImageUrl"
            :src="modalImageUrl"
            :alt="modalCard?.name ?? 'Card'"
            class="w-44 rounded-2xl shadow-[var(--shadow-soft)]"
          />
          <div
            v-else
            class="h-64 w-44 rounded-2xl border border-dashed border-[color:var(--border)] p-4 text-center text-xs text-[color:var(--muted)]"
          >
            Image unavailable
          </div>
        </div>
        <div class="pointer-events-none space-y-1 text-xs text-[color:var(--muted)]">
          <p>
            <span class="font-semibold">Set:</span>
            {{ (modalCard?.set || '').toUpperCase() || '—' }}
          </p>
          <p>
            <span class="font-semibold">Prices:</span>
            ${{ modalCard?.prices?.usd ?? '—' }} / €{{ modalCard?.prices?.eur ?? '—' }}
          </p>
        </div>
      </Card>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Card from "../Card.vue";
import type { DisplayCard } from "../../types/cards";

defineProps<{
  hoveredCardImage: string | null;
  isFullscreenPreview: boolean;
  imagePosition: { x: number; y: number };
  isMobileModalOpen: boolean;
  modalImageUrl: string | null;
  modalLoading: boolean;
  modalCard: DisplayCard | null;
  scryfallLink: string | null;
}>();

const emit = defineEmits<{
  "close-preview": [];
  "close-modal": [];
}>();
</script>
