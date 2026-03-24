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
          Collection Insights
        </CText>
        <CText tag="h1" variant="display">
          Top commanders scan
        </CText>
        <CText tag="p" variant="body" tone="muted" class="sm:text-base">
          Browse EDHREC's top commanders and see what percentage of each average deck
          you already own.
        </CText>
      </CStack>

      <CInline gap="md" class="relative">
        <CButton
          :as="RouterLink"
          to="/"
          variant="secondary"
        >
          Back to dashboard
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
          variant="primary"
          @click="emit('upload')"
        >
          Upload CSV
        </CButton>
      </CInline>
    </CInline>
  </CSurface>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { CButton, CInline, CStack, CSurface, CText } from "../core";

const emit = defineEmits<{
  upload: [];
}>();
</script>
