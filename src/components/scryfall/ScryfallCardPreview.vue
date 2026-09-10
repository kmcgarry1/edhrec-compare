<template>
  <Teleport to="body">
    <div
      v-if="hoveredCardImage && isFullscreenPreview"
      class="fixed inset-0 z-[60] flex flex-col bg-black/88 px-4 py-6 text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Card artwork preview"
      @click.self="emit('close-preview')"
    >
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/20"
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
      class="pointer-events-none z-50 text-[color:var(--text)]"
      :fullWidth="false"
      :style="{
        position: 'fixed',
        left: imagePosition.x + 'px',
        top: imagePosition.y + 'px',
      }"
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
      class="fixed inset-0 z-[70] flex items-end justify-center bg-black/82 px-4 py-8 sm:items-center"
      @click.self="emit('close-modal')"
    >
      <section
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="modalTitleId"
        class="w-full max-w-md"
        @escape-pressed="emit('close-modal')"
      >
        <Card
          as="div"
          padding="p-4 sm:p-6"
          rounded="rounded-2xl"
          border="border border-[color:var(--border)]"
          background="bg-[color:var(--surface)]"
          shadow="shadow-[var(--shadow)]"
          class="relative max-h-[calc(100dvh-4rem)] space-y-4 overflow-y-auto text-[color:var(--text)]"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold text-[color:var(--accent)]">Card preview</p>
              <h3 :id="modalTitleId" class="text-xl font-semibold text-[color:var(--text)]">
                {{ modalCard?.name ?? "Card preview" }}
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
                class="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              >
                Scryfall
              </a>
              <button
                type="button"
                class="min-h-11 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--text)] shadow-[var(--shadow-soft)] hover:border-[color:var(--danger)] hover:text-[color:var(--danger)]"
                @click="emit('close-modal')"
              >
                Close
              </button>
            </div>
          </div>

          <div class="pointer-events-none flex justify-center">
            <div
              v-if="modalLoading"
              class="h-64 w-44 rounded-2xl bg-[color:var(--surface-muted)]"
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
              {{ (modalCard?.set || "").toUpperCase() || "-" }}
            </p>
            <p>
              <span class="font-semibold">Prices:</span>
              ${{ modalCard?.prices?.usd ?? "-" }} / EUR {{ modalCard?.prices?.eur ?? "-" }}
            </p>
          </div>
        </Card>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from "vue";
import Card from "../Card.vue";
import { useFocusTrap } from "../../composables/useFocusTrap";
import type { DisplayCard } from "../../types/cards";

const props = defineProps<{
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

const modalRef = ref<HTMLElement | null>(null);
const modalActive = toRef(props, "isMobileModalOpen");
const modalTitleId = `card-preview-${Math.random().toString(36).slice(2, 9)}-title`;
const { activate, deactivate } = useFocusTrap(modalRef, modalActive);
const isOpen = computed(() => props.isMobileModalOpen);

watch(isOpen, async (open) => {
  if (!open) {
    deactivate();
    return;
  }
  await nextTick();
  activate();
});
</script>
