<template>
  <header
    class="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]/95"
  >
    <div class="mx-auto flex min-h-14 w-full max-w-[90rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
      <RouterLink
        to="/"
        class="flex min-w-0 items-center gap-2 rounded-lg py-1 pr-1 text-[color:var(--text)] transition hover:text-[color:var(--accent)]"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-sm font-semibold"
        >
          CS
        </span>
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold">Commander Scout</span>
          <span class="hidden truncate text-xs text-[color:var(--muted)] lg:block">
            Compare collections against commander data
          </span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
        <RouterLink
          v-for="link in primaryNavLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-semibold transition"
          :class="isActiveLink(link.activeNames) ? activeNavClass : inactiveNavClass"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex min-w-0 items-center justify-end gap-2">
        <CBadge
          :tone="hasCsvData ? 'success' : 'muted'"
          variant="soft"
          size="sm"
          text-case="normal"
          class="hidden lg:inline-flex"
        >
          {{ collectionStatus }}
        </CBadge>

        <CButton
          type="button"
          size="sm"
          :variant="hasCsvData ? 'secondary' : 'primary'"
          @click="openUploadModal"
        >
          {{ hasCsvData ? "Collection" : "Upload" }}
        </CButton>

        <div class="hidden md:block">
          <AppUtilityMenu />
        </div>

        <details class="relative md:hidden">
          <summary
            class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-3 text-sm font-semibold text-[color:var(--text)] transition hover:border-[color:var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          >
            Menu
          </summary>
          <div
            class="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-1rem))] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2 shadow-[var(--shadow-soft)]"
          >
            <RouterLink
              v-for="link in mobileMenuLinks"
              :key="link.to"
              :to="link.to"
              class="block rounded-lg px-3 py-2 text-sm font-semibold text-[color:var(--text)] hover:bg-[color:var(--surface-muted)]"
            >
              {{ link.label }}
            </RouterLink>
            <div class="mt-2 border-t border-[color:var(--border)] pt-2">
              <AppUtilityMenu />
            </div>
          </div>
        </details>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useUploadModal } from "../composables/useUploadModal";
import AppUtilityMenu from "./AppUtilityMenu.vue";
import { CBadge, CButton } from "./core";

const route = useRoute();
const { rows } = useCsvUpload();
const { openUploadModal } = useUploadModal();

const primaryNavLinks = [
  { label: "Find a Commander", to: "/", activeNames: ["home", "commander"] },
  { label: "Top Commanders", to: "/top-commanders", activeNames: ["top-commanders"] },
] as const;

const mobileMenuLinks = [
  ...primaryNavLinks,
  { label: "Release Notes", to: "/changelog", activeNames: ["changelog"] },
] as const;

const activeNavClass = "bg-[color:var(--accent)] text-[color:var(--accent-contrast)]";
const inactiveNavClass =
  "text-[color:var(--muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text)]";

const hasCsvData = computed(() => rows.value.length > 0);
const collectionStatus = computed(() => {
  if (!hasCsvData.value) {
    return "No collection uploaded";
  }
  const count = rows.value.length;
  return `${count} card${count === 1 ? "" : "s"} loaded`;
});

const isActiveLink = (names: readonly string[]) => {
  const currentName = typeof route.name === "string" ? route.name : "";
  return names.includes(currentName);
};
</script>

<style scoped>
summary {
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}
</style>
