import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The app is served from https://devhashaam.github.io/savora/
export default defineConfig({
  base: '/savora/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
