<template>
  <CSurface
    as="header"
    variant="masthead"
    tone="default"
    size="md"
    radius="3xl"
    shadow="base"
    sheen
    class="overflow-hidden"
  >
    <div class="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-end">
      <CStack gap="md" class="max-w-3xl">
        <CInline gap="sm" class="flex-wrap">
          <CBadge tone="default" variant="outline" size="sm" text-case="normal">
            Collection-first workspace
          </CBadge>
          <CBadge tone="accent" variant="soft" size="sm" text-case="normal">
            Live EDHREC + Scryfall
          </CBadge>
        </CInline>
        <CStack gap="sm">
          <CText tag="p" variant="eyebrow" tone="muted"> Commander Scout </CText>
          <CText tag="h1" variant="display" class="max-w-3xl text-balance">
            Compare commander cardlists against the collection you actually own
          </CText>
          <CText tag="p" variant="body" tone="muted" class="max-w-2xl sm:text-base">
            The dashboard now behaves like a centered comparison workspace: browse commanders,
            change the EDHREC route, and keep your ownership lens and export actions in view.
          </CText>
        </CStack>

        <CInline gap="sm" class="flex-wrap">
          <CButton type="button" variant="primary" @click="emit('browse')">
            Browse commanders
          </CButton>
          <CButton type="button" variant="secondary" @click="emit('upload')">
            Upload collection
          </CButton>
          <CButton :as="RouterLink" to="/top-commanders" variant="secondary">
            Top commanders
          </CButton>
          <CButton :as="RouterLink" to="/changelog" variant="soft">
            Release notes
          </CButton>
        </CInline>
      </CStack>

      <CSurface variant="dense" size="md" class="space-y-3 xl:self-stretch">
        <CText tag="p" variant="eyebrow" tone="muted"> Workspace focus </CText>
        <div class="grid gap-2">
          <div
            class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
          >
            <CText tag="p" variant="title">Browse commanders</CText>
            <CText tag="p" variant="helper" tone="muted">
              Search EDHREC routes without losing your collection context.
            </CText>
          </div>
          <div
            class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
          >
            <CText tag="p" variant="title">Match ownership</CText>
            <CText tag="p" variant="helper" tone="muted">
              Flip instantly between owned, unowned, and full cardlist views.
            </CText>
          </div>
          <div
            class="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
          >
            <CText tag="p" variant="title">Export when ready</CText>
            <CText tag="p" variant="helper" tone="muted">
              Copy or download the current ownership lens in one step.
            </CText>
          </div>
        </div>
      </CSurface>
    </div>
  </CSurface>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { CBadge, CButton, CInline, CStack, CSurface, CText } from "../core";

const emit = defineEmits<{
  browse: [];
  upload: [];
}>();
</script>
