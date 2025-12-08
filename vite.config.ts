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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vue framework separate chunk
          if (id.includes("node_modules/vue/")) {
            return "vue-vendor";
          }

          // VueUse composables (used throughout)
          if (id.includes("node_modules/@vueuse/core")) {
            return "vueuse-vendor";
          }

          // Large third-party libraries - icons
          if (id.includes("node_modules/@mdi/js")) {
            return "vendor-icons";
          }

          // Analytics separate (non-critical)
          if (
            id.includes("node_modules/@vercel/analytics") ||
            id.includes("node_modules/@vercel/speed-insights") ||
            id.includes("node_modules/@sentry/vue")
          ) {
            return "vendor-analytics";
          }

          // Virtual scrolling library
          if (id.includes("node_modules/@tanstack/vue-virtual")) {
            return "vendor-virtual";
          }
        },
      },
    },
  },
});
