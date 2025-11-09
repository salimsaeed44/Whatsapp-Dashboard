import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy for development - not needed in production (Render)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Use esbuild (default, faster) instead of terser
    // If you need terser, install it: npm install --save-dev terser
    minify: 'esbuild', // or 'terser' if terser is installed
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          axios: ['axios']
        }
      }
    }
  }
})
