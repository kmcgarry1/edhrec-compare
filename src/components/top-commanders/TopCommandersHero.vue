<template>
  <CSurface
    as="header"
    variant="masthead"
    tone="default"
    size="lg"
    radius="3xl"
    shadow="base"
    sheen
    class="top-commanders-hero overflow-hidden"
  >
    <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_21rem] xl:items-start">
      <CStack gap="lg" class="max-w-3xl">
        <CStack gap="md">
          <CInline gap="sm" class="flex-wrap">
            <CBadge tone="muted" variant="outline" size="md" text-case="normal">
              Ranking route
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
            Ranking workflow
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
      </CStack>

      <CSurface variant="utility" size="md" radius="2xl" class="top-commanders-brief xl:self-stretch">
        <CStack gap="md">
          <CText tag="p" variant="overline" tone="muted">
            Editorial brief
          </CText>
          <CText tag="p" variant="title">
            Scan the field first
          </CText>
          <CText tag="p" variant="helper" tone="muted">
            Keep the masthead focused on route identity, then use the command deck below to adjust
            range, sort mode, and color scope.
          </CText>
          <div class="grid gap-3">
            <CSurface variant="dense" size="sm" radius="2xl">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  Range + sorting
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Browse the active top range, then pivot to highest owned when collection overlap
                  matters more than rank order.
                </CText>
              </CStack>
            </CSurface>
            <CSurface variant="dense" size="sm" radius="2xl">
              <CStack gap="xs">
                <CText tag="p" variant="title">
                  CSV overlay
                </CText>
                <CText tag="p" variant="helper" tone="muted">
                  Ownership percentages stay intentionally quiet until a collection upload gives the
                  ranking real context.
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

<style scoped>
.top-commanders-hero::after {
  content: "";
  position: absolute;
  inset: auto 10% -4rem 48%;
  height: 7rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent-soft) 68%, transparent),
    color-mix(in srgb, var(--warn-soft) 76%, transparent)
  );
  filter: blur(42px);
  opacity: 0.8;
  pointer-events: none;
}

.top-commanders-brief {
  background-image:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--surface-strong) 94%, transparent),
      color-mix(in srgb, var(--surface-muted) 74%, transparent)
    ),
    radial-gradient(circle at top right, var(--accent-glow), transparent 46%);
}
</style>
