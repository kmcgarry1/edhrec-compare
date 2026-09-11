<template>
  <section class="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
    <header class="max-w-3xl space-y-2">
      <CText tag="h1" variant="display">Release Notes</CText>
      <CText tag="p" variant="body" tone="muted">
        User-visible changes from the project changelog.
      </CText>
    </header>

    <main id="main-content" class="mt-6 space-y-3">
      <CNotice
        v-if="releases.length === 0"
        tone="warn"
        message="No release notes are available yet."
      />

      <details
        v-for="(release, releaseIndex) in releases"
        :key="release.version"
        class="rounded border border-[color:var(--border)] bg-[color:var(--surface-strong)]"
        :open="releaseIndex === 0"
      >
        <summary class="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-3">
          <span class="min-w-0">
            <span class="block text-base font-semibold text-[color:var(--text)]">
              Version {{ release.version }}
            </span>
            <span class="block text-xs text-[color:var(--muted)]">
              {{ formatReleaseDate(release.date) }} | {{ sectionSummary(release.sections.length) }}
            </span>
          </span>
          <span class="text-sm font-semibold text-[color:var(--accent)]">Details</span>
        </summary>

        <div class="border-t border-[color:var(--border)] px-4 py-4">
          <div class="space-y-5">
            <section
              v-for="section in release.sections"
              :key="`${release.version}-${section.title}`"
              class="space-y-2"
            >
              <CText tag="h2" variant="label" tone="muted">
                {{ section.title }}
              </CText>
              <ul class="space-y-2">
                <li
                  v-for="item in section.items"
                  :key="item"
                  class="flex items-start gap-3 text-sm leading-relaxed text-[color:var(--text)]"
                >
                  <span
                    class="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--accent)]"
                    aria-hidden="true"
                  />
                  <span>
                    <template
                      v-for="(segment, index) in splitChangelogReferences(item)"
                      :key="`${release.version}-${section.title}-${item}-${index}`"
                    >
                      <a
                        v-if="segment.href"
                        :href="segment.href"
                        class="font-semibold text-[color:var(--accent)] underline underline-offset-2 hover:text-[color:var(--accent-strong)]"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {{ segment.text }}
                      </a>
                      <template v-else>{{ segment.text }}</template>
                    </template>
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </details>
    </main>
  </section>
</template>

<script setup lang="ts">
import changelogSource from "../../CHANGELOG.md?raw";
import { CNotice, CText } from "./core";
import { formatReleaseDate, parseChangelog, splitChangelogReferences } from "../utils/changelog";

const releases = parseChangelog(changelogSource);

const sectionSummary = (count: number) => `${count} update section${count === 1 ? "" : "s"}`;
</script>

<style scoped>
summary {
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}
</style>
