import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  server: {
    proxy: {
      // Proxy all API requests to your backend
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false, // Only for development with self-signed certs
        rewrite: (path) => path, // do not modify the path
        headers: {
          // Ensure backend receives proper headers
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    },
    historyApiFallback: true,
    strictPort: true
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  }
})