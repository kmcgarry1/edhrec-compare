<template>
  <CSurface
    as="header"
    variant="panel"
    tone="default"
    size="lg"
    radius="3xl"
    shadow="base"
    sheen
    class="overflow-hidden"
  >
    <div
      class="pointer-events-none absolute -top-24 right-6 h-48 w-48 rounded-full bg-[color:var(--accent-soft)] blur-3xl opacity-70"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-24 left-4 h-52 w-64 rounded-full bg-[color:var(--warn-soft)] blur-3xl opacity-60"
      aria-hidden="true"
    />

    <CInline
      align="end"
      justify="between"
      gap="xl"
      class="relative flex-col lg:flex-row"
    >
      <CStack gap="md" class="max-w-2xl">
        <CText tag="p" variant="eyebrow" tone="muted">
          Commander Scout
        </CText>
        <CText tag="h1" variant="display">
          Compare EDHREC decklists to your collection
        </CText>
        <CText tag="p" variant="body" tone="muted" class="sm:text-base">
          Choose a commander, upload your collection CSV, and export an owned or
          unowned list in minutes.
        </CText>
      </CStack>

      <CInline gap="md" class="relative">
        <CButton
          type="button"
          variant="primary"
          @click="emit('jump', 'search')"
        >
          Start with a commander
        </CButton>
        <CButton
          :as="RouterLink"
          to="/top-commanders"
          variant="secondary"
        >
          Top commanders
        </CButton>
        <CButton
          :as="RouterLink"
          to="/changelog"
          variant="soft"
        >
          Release notes
        </CButton>
        <CButton
          type="button"
          variant="secondary"
          @click="emit('jump', 'collection')"
        >
          Jump to collection
        </CButton>
      </CInline>
    </CInline>
  </CSurface>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { DashboardTab } from "../../types/dashboard";
import { CButton, CInline, CStack, CSurface, CText } from "../core";

const emit = defineEmits<{
  jump: [tab: DashboardTab];
}>();
</script>
