<template>
  <Card
    as="footer"
    padding="p-4 sm:p-6"
    rounded="rounded-2xl"
    background="bg-slate-50/80 dark:bg-slate-900/60"
    shadow="shadow-md shadow-slate-900/5 dark:shadow-black/40"
    class="text-sm text-slate-600 dark:text-slate-300"
    title="Independent hobby project"
  >
    <p>
      EDHREC CSV Compare is a personal portfolio experiment and is not
      affiliated with or endorsed by EDHREC, Space Cow Media, or Scryfall.
      Commander recommendations are fetched live from public EDHREC JSON
      endpoints and card details/images come from the Scryfall API. Usage of
      EDHREC data should follow their
      <a
        href="https://edhrec.com/terms-of-use"
        class="text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-300"
        target="_blank"
        rel="noreferrer"
      >
        Terms of Use
      </a>
      and
      <a
        href="https://edhrec.com/privacy"
        class="text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-300"
        target="_blank"
        rel="noreferrer"
      >
        Privacy Policy
      </a
      >.
    </p>
    <ul class="mt-3 space-y-1 text-xs">
      <li>
        • Deck CSVs and fetched commander data stay in-memory for the current
        browser session only and clear on refresh.
      </li>
      <li>
        • Please avoid excessive automated requests; this tool simply visualizes
        data you request interactively.
      </li>
      <li>
        • EDHREC, Space Cow Media, and Scryfall retain all respective
        trademarks, copyrights, and content rights.
      </li>
    </ul>
  </Card>
</template>
<script setup lang="ts">
import { Card } from ".";
</script>
