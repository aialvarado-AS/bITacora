import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/static/app/' : '/',
  server: {
    port: 5187,
    proxy: {
      '/api': {
        target: 'http://localhost:5012',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
}))
