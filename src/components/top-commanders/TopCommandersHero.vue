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
    <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_20rem]">
      <CStack gap="lg" class="max-w-3xl">
        <CStack gap="md">
          <CInline gap="sm" class="flex-wrap">
            <CBadge tone="default" variant="outline" size="md" text-case="normal">
              Ranking dashboard
            </CBadge>
            <CBadge
              :tone="hasCsvData ? 'success' : 'muted'"
              variant="soft"
              size="sm"
              text-case="normal"
            >
              {{ csvStatus }}
            </CBadge>
          </CInline>
          <CText tag="p" variant="eyebrow" tone="muted">
            Collection Insights
          </CText>
          <CText tag="h1" variant="display" class="text-balance">
            Top commanders scan
          </CText>
          <CText tag="p" variant="body" tone="muted" class="max-w-2xl sm:text-base">
            Browse EDHREC&apos;s top commanders and see what percentage of each average deck you
            already own, then jump straight into a commander route when a rank looks promising.
          </CText>
        </CStack>

        <CInline gap="md" class="relative flex-wrap">
          <CButton
            :as="RouterLink"
            to="/"
            variant="secondary"
          >
            Back to dashboard
          </CButton>
          <CButton
            type="button"
            variant="primary"
            @click="emit('upload')"
          >
            Upload CSV
          </CButton>
        </CInline>
      </CStack>

      <CSurface variant="utility" size="md" class="xl:self-end">
        <CStack gap="md">
          <CText tag="p" variant="overline" tone="muted">
            Scan focus
          </CText>
          <div class="grid gap-3">
            <CSurface variant="content" size="sm">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  Rank coverage
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Compare the current top range and sort by rank or by highest owned overlap.
                </CText>
              </CStack>
            </CSurface>
            <CSurface variant="content" size="sm">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  CSV insight
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Ownership percentages stay muted until a collection upload is available.
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
import { computed } from "vue";
import { CBadge, CButton, CInline, CStack, CSurface, CText } from "../core";

const props = defineProps<{
  hasCsvData: boolean;
  csvCount: number;
}>();

const emit = defineEmits<{
  upload: [];
}>();

const csvStatus = computed(() => {
  if (!props.hasCsvData) {
    return "CSV pending";
  }
  return `${props.csvCount} cards loaded`;
});
</script>
