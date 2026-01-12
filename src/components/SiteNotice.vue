<template>
  <Card
    as="footer"
    padding="p-2.5 sm:p-3.5"
    rounded="rounded-2xl"
    background="bg-[color:var(--surface)]"
    shadow="shadow-[var(--shadow-soft)]"
    class="text-sm text-[color:var(--muted)]"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Independent hobby project
        </p>
        <p class="text-[0.8rem] text-[color:var(--muted)]">
          EDHREC CSV Compare is a personal experiment, not affiliated with EDHREC, Space Cow Media, or Scryfall.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] px-2.5 py-1 text-[0.75rem] font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        <span>{{ expanded ? "Hide" : "Learn more" }}</span>
        <span aria-hidden="true">{{ expanded ? "▲" : "▼" }}</span>
      </button>
    </div>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="expanded" class="mt-3 space-y-2 text-xs leading-relaxed text-[color:var(--muted)]">
        <p>
          Commander recommendations are fetched live from public EDHREC JSON endpoints and card details/images come from the Scryfall API. Usage of EDHREC data should follow their
          <a
            href="https://edhrec.com/terms-of-use"
            class="text-[color:var(--accent)] underline hover:text-[color:var(--accent-strong)]"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Use
          </a>
          and
          <a
            href="https://edhrec.com/privacy"
            class="text-[color:var(--accent)] underline hover:text-[color:var(--accent-strong)]"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a
          >.
        </p>
        <ul class="space-y-1">
          <li>
            • Deck CSVs and fetched commander data stay in-memory for the current browser session only and clear on refresh.
          </li>
          <li>
            • Please avoid excessive automated requests; this tool simply visualizes data you request interactively.
          </li>
          <li>
            • EDHREC, Space Cow Media, and Scryfall retain all respective trademarks, copyrights, and content rights.
          </li>
        </ul>
      </div>
    </transition>
  </Card>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { Card } from ".";

const expanded = ref(false);
</script>
