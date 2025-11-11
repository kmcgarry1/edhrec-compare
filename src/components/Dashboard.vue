<template>
  <section
    class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8"
  >
    <GlobalLoadingBanner />
    <Card
      as="header"
      padding="p-5 sm:p-8"
      shadow="shadow-2xl shadow-slate-900/10 dark:shadow-black/50"
    >
      <div class="flex flex-col gap-6">
        <div class="space-y-2">
          <p class="text-sm uppercase tracking-[0.4em] text-emerald-500/80">
            Toolkit
          </p>
          <h1
            class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white"
          >
            EDHREC CSV Compare
          </h1>
          <p class="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            Search commanders, inspect EDHREC recommendations, and highlight
            which cards you already own by uploading a deck CSV.
          </p>
        </div>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200 sm:w-auto sm:justify-start"
            :aria-pressed="theme === 'dark'"
            @click="toggleTheme"
          >
            <span class="text-lg" aria-hidden="true">
              {{ theme === "dark" ? "☀️" : "🌙" }}
            </span>
            <span>{{ theme === "dark" ? "Light mode" : "Dark mode" }}</span>
          </button>
          <div class="w-full flex-1">
            <CSVUpload />
          </div>
        </div>
      </div>
    </Card>

    <EdhrecReader />
  </section>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import {
  Card,
  EdhrecReader,
  CSVUpload,
  GlobalLoadingBanner,
} from "../components";
import { useTheme } from "../composables/useTheme";

import { getAllSymbols } from "../api/scryfallApi";

const { theme, toggleTheme } = useTheme();
</script>
