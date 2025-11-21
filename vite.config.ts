import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: "coverage/bundle-report.html",
            title: "Commander Scout Bundle",
            template: "treemap",
            gzipSize: true,
            brotliSize: true,
          }),
          visualizer({
            filename: "coverage/bundle-report.json",
            template: "raw-data",
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "vue-router": fileURLToPath(new URL("./src/stubs/vue-router.ts", import.meta.url)),
    },
  },
  build: {
    // Generate source maps for Sentry error tracking
    sourcemap: true,
  },
});
