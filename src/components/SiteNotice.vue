<template>
  <Card
    as="footer"
    padding="p-2.5 sm:p-3.5"
    rounded="rounded-2xl"
    background="bg-slate-50/80 dark:bg-slate-900/60"
    shadow="shadow-md shadow-slate-900/5 dark:shadow-black/40"
    class="text-sm text-slate-600 dark:text-slate-300"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
          Independent hobby project
        </p>
        <p class="text-[0.8rem] text-slate-600 dark:text-slate-300">
          EDHREC CSV Compare is a personal experiment, not affiliated with EDHREC, Space Cow Media, or Scryfall.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[0.75rem] font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200 dark:hover:text-emerald-200"
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
      <div v-if="expanded" class="mt-3 space-y-2 text-xs leading-relaxed">
        <p>
          Commander recommendations are fetched live from public EDHREC JSON endpoints and card details/images come from the Scryfall API. Usage of EDHREC data should follow their
          <a
            href="https://edhrec.com/terms-of-use"
            class="text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-300"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Use
          </a>
          and
          <a
            href="https://edhrec.com/privacy"
            class="text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-300"
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
