import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/unit/**/*.spec.ts"],
    setupFiles: ["tests/setup/vitest.setup.ts"],
    css: true,
    coverage: {
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "coverage/unit",
      exclude: [
        "src/components/Dashboard.vue",
        "src/components/CommanderDisplay.vue",
        "src/components/DropdownSelect.vue",
        "src/components/EdhrecReader.vue",
        "src/components/ScryfallCardRow.vue",
        "src/components/SiteNotice.vue",
        "src/components/index.ts",
        "src/components/core/index.ts",
      ],
    },
  },
});
