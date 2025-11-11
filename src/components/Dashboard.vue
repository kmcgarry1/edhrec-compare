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
        <div
          class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        >
          <div class="space-y-2 max-w-3xl">
            <p class="text-xs uppercase tracking-[0.5em] text-emerald-500/80">
              Toolkit
            </p>
            <h1 class="text-3xl font-semibold text-slate-900 dark:text-white">
              Commander Scout
            </h1>
            <p class="text-base text-slate-600 dark:text-slate-300">
              Feed in a CSV of your collection, call up EDHREC commanders, and
              instantly spot the recommendations you already own.
            </p>
          </div>
          <div class="flex items-center justify-start lg:justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:text-emerald-200"
              :aria-pressed="theme === 'dark'"
              @click="toggleTheme"
            >
              <span class="text-lg" aria-hidden="true">
                {{ theme === "dark" ? "☀️" : "🌙" }}
              </span>
              <span>{{ theme === "dark" ? "Light mode" : "Dark mode" }}</span>
            </button>
          </div>
        </div>
        <div class="w-full">
          <CSVUpload />
        </div>
      </div>
    </Card>

    <EdhrecReader />

    <SiteNotice />
  </section>
</template>
<script setup lang="ts">
import {
  Card,
  EdhrecReader,
  CSVUpload,
  GlobalLoadingBanner,
  SiteNotice,
} from "../components";
import { useTheme } from "../composables/useTheme";

const { theme, toggleTheme } = useTheme();
</script>
