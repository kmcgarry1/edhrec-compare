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
    },
  },
});
