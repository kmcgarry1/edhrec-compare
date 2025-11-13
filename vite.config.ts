import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-router': fileURLToPath(new URL('./src/stubs/vue-router.ts', import.meta.url)),
    },
  },
})
