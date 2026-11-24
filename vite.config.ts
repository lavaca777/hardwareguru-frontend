import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      ignored: ['**/coverage/**', '**/dist/**'],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 15_000,
    env: {
      VITE_USE_MOCKS: 'true',
      VITE_REAL_AUTH: 'false',
      VITE_REAL_CATALOG: 'false',
      VITE_REAL_SIMULATION: 'false',
      VITE_REAL_CHAT: 'false',
      VITE_REAL_ALERTS: 'false',
      VITE_API_URL: 'http://api.test',
      VITE_MOCK_DELAY_MS: '0',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/test/**',
        'src/**/*.d.ts',
        'src/api/mocks/data.ts',
      ],
    },
  },
})
