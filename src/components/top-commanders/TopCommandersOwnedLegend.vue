<template>
  <CInline gap="md" class="text-xs">
    <CBadge tone="muted" variant="outline">
      Owned range
    </CBadge>
    <CInline gap="sm">
      <div
        class="h-2 w-40 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 shadow-[var(--shadow-soft)]"
        aria-hidden="true"
      />
      <CInline gap="sm" class="text-[0.7rem]">
        <CText tag="span" variant="helper" tone="muted">0%</CText>
        <CText tag="span" variant="helper" tone="muted">50%</CText>
        <CText tag="span" variant="helper" tone="muted">100%</CText>
      </CInline>
    </CInline>
  </CInline>
</template>

<script setup lang="ts">
import { CBadge, CInline, CText } from "../core";
</script>
