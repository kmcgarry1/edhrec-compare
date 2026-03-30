<template>
  <header class="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8 2xl:px-10">
    <div class="mx-auto w-full max-w-[104rem]">
      <CSurface
        as="div"
        variant="toolbar"
        size="none"
        radius="3xl"
        shadow="base"
        class="border border-[color:var(--border)]/80 px-4 py-3 backdrop-blur"
      >
        <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
            <RouterLink
              to="/"
              class="flex items-center gap-3 rounded-2xl px-1 py-1 text-[color:var(--text)] transition hover:text-[color:var(--accent)]"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-sm font-semibold">
                CS
              </div>
              <div class="space-y-0.5">
                <CText tag="p" variant="eyebrow" tone="muted"> Commander Scout </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Compare collections against live commander data
                </CText>
              </div>
            </RouterLink>

            <nav class="flex flex-wrap items-center gap-2" aria-label="Primary">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold transition"
                :class="isActiveLink(link.activeNames) ? activeNavClass : inactiveNavClass"
              >
                {{ link.label }}
              </RouterLink>
            </nav>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <CBadge
              :tone="hasCsvData ? 'success' : 'muted'"
              variant="soft"
              size="sm"
              text-case="normal"
            >
              {{ collectionStatus }}
            </CBadge>

            <CButton type="button" size="sm" variant="primary" @click="openUploadModal">
              Upload Collection
            </CButton>

            <AppUtilityMenu />
          </div>
        </div>
      </CSurface>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useCsvUpload } from "../composables/useCsvUpload";
import { useUploadModal } from "../composables/useUploadModal";
import AppUtilityMenu from "./AppUtilityMenu.vue";
import { CBadge, CButton, CSurface, CText } from "./core";

const route = useRoute();
const { rows } = useCsvUpload();
const { openUploadModal } = useUploadModal();

const navLinks = [
  { label: "Dashboard", to: "/", activeNames: ["home", "commander"] },
  { label: "Top Commanders", to: "/top-commanders", activeNames: ["top-commanders"] },
  { label: "Release Notes", to: "/changelog", activeNames: ["changelog"] },
] as const;

const activeNavClass =
  "border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--text)] shadow-[var(--shadow-soft)]";
const inactiveNavClass =
  "border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]";

const hasCsvData = computed(() => rows.value.length > 0);
const collectionStatus = computed(() => {
  if (!hasCsvData.value) {
    return "Collection pending";
  }
  const count = rows.value.length;
  return `${count} card${count === 1 ? "" : "s"} ready`;
});

const isActiveLink = (names: readonly string[]) => {
  const currentName = typeof route.name === "string" ? route.name : "";
  return names.includes(currentName);
};
</script>
