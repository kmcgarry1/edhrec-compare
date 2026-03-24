<template>
  <CSurface
    as="header"
    variant="masthead"
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

    <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_22rem]">
      <CStack gap="lg" class="max-w-3xl">
        <CStack gap="md">
          <CText tag="p" variant="eyebrow" tone="muted">
            Commander Scout
          </CText>
          <CText tag="h1" variant="display" class="max-w-3xl text-balance">
            Compare EDHREC decklists against your collection
          </CText>
          <CText tag="p" variant="body" tone="muted" class="max-w-2xl sm:text-base">
            Search a commander, bring in your CSV, and move from browsing to export without
            losing context between filters, ownership, and card previews.
          </CText>
        </CStack>

        <CInline gap="md" class="relative flex-wrap">
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
            type="button"
            variant="secondary"
            @click="emit('jump', 'collection')"
          >
            Prepare collection
          </CButton>
        </CInline>
      </CStack>

      <CSurface
        variant="utility"
        size="md"
        class="xl:self-end"
      >
        <CStack gap="md">
          <CText tag="p" variant="overline" tone="muted">
            Quick start
          </CText>
          <div class="grid gap-3">
            <CSurface variant="content" size="sm">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  1. Search commanders
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Use EDHREC filters to open the exact deck family you want to compare.
                </CText>
              </CStack>
            </CSurface>
            <CSurface variant="content" size="sm">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  2. Match your CSV
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Owned and unowned filters update instantly once the inventory is loaded.
                </CText>
              </CStack>
            </CSurface>
            <CSurface variant="content" size="sm">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  3. Export the list
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Copy or download the filtered decklist for your next build session.
                </CText>
              </CStack>
            </CSurface>
          </div>
        </CStack>
      </CSurface>
    </div>
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
