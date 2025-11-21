import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "EDHREC Compare",
        short_name: "EDHREC",
        description: "Compare MTG Commander collections with EDHREC",
        theme_color: "#10b981",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "scryfall-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/json\.edhrec\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "edhrec-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
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
});
