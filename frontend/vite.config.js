import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend port
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Backend port 4000
        changeOrigin: true,
        secure: false,
      }
    }
  }
})