import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: true,
      }
    },
    historyApiFallback: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Handle SPA routing
  preview: {
    port: 5173,
    historyApiFallback: true
  }
})
