<template>
  <section
    class="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-10"
  >
    <a href="#main-content" class="skip-link">Skip to main content</a>

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
        class="pointer-events-none absolute -top-20 right-6 h-48 w-48 rounded-full bg-[color:var(--accent-soft)] blur-3xl opacity-70"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-24 left-4 h-52 w-64 rounded-full bg-[color:var(--warn-soft)] blur-3xl opacity-60"
        aria-hidden="true"
      />

      <div class="relative space-y-5">
        <CInline
          align="center"
          gap="sm"
          class="flex-wrap"
        >
          <CBadge tone="accent">Release notes</CBadge>
          <CBadge
            v-if="currentRelease"
            variant="outline"
            tone="muted"
          >
            Current {{ currentRelease.version }}
          </CBadge>
          <CBadge
            v-if="currentRelease"
            variant="outline"
            tone="muted"
          >
            {{ formatReleaseDate(currentRelease.date) }}
          </CBadge>
        </CInline>

        <div class="space-y-3">
          <CText tag="h1" variant="display">
            What changed in Commander Scout
          </CText>
          <CText tag="p" variant="body" tone="muted" class="max-w-3xl sm:text-base">
            This page is rendered from the repository changelog so the in-app release notes
            stay aligned with the tracked release history.
          </CText>
        </div>

        <CInline gap="md" class="flex-wrap">
          <CButton
            :as="RouterLink"
            to="/"
            variant="primary"
          >
            Back to dashboard
          </CButton>
          <CButton
            :as="RouterLink"
            to="/top-commanders"
            variant="secondary"
          >
            Top commanders
          </CButton>
        </CInline>
      </div>
    </CSurface>

    <main id="main-content" class="mt-8 space-y-6">
      <CNotice
        v-if="releases.length === 0"
        tone="warn"
        message="No release notes are available yet."
      />

      <article
        v-for="release in releases"
        :key="release.version"
      >
        <CSurface
          variant="panel"
          tone="default"
          size="lg"
          radius="3xl"
          shadow="soft"
          sheen
        >
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="space-y-2">
              <CInline
                align="center"
                gap="sm"
                class="flex-wrap"
              >
                <CBadge tone="accent">{{ release.version }}</CBadge>
                <CBadge variant="outline" tone="muted">
                  {{ formatReleaseDate(release.date) }}
                </CBadge>
              </CInline>
              <CText tag="h2" variant="title">
                Version {{ release.version }}
              </CText>
            </div>

            <CText tag="p" variant="helper" tone="muted">
              {{ sectionSummary(release.sections.length) }}
            </CText>
          </div>

          <div class="mt-6 grid gap-4 xl:grid-cols-2">
            <section
              v-for="section in release.sections"
              :key="`${release.version}-${section.title}`"
              class="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-[var(--shadow-soft)]"
            >
              <CText tag="h3" variant="label" tone="muted">
                {{ section.title }}
              </CText>
              <ul class="mt-3 space-y-3">
                <li
                  v-for="item in section.items"
                  :key="item"
                  class="flex items-start gap-3"
                >
                  <span
                    class="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[color:var(--accent)]"
                    aria-hidden="true"
                  />
                  <span class="text-sm leading-relaxed text-[color:var(--text)]">
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
        </CSurface>
      </article>
    </main>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import changelogSource from "../../CHANGELOG.md?raw";
import { CBadge, CButton, CInline, CNotice, CSurface, CText } from "./core";
import {
  formatReleaseDate,
  parseChangelog,
  splitChangelogReferences,
} from "../utils/changelog";

const releases = parseChangelog(changelogSource);
const currentRelease = releases[0] ?? null;

const sectionSummary = (count: number) =>
  `${count} update section${count === 1 ? "" : "s"}`;
</script>
