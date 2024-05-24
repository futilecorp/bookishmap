import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueMobileDetection from 'vue-mobile-detection'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VueMobileDetection,
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
