import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  base: '/',
  
  server: {
    proxy: {
      // Proxy all API requests to your backend
      '/api': {
        target: 'https://hifachama-backend.onrender.com',
        changeOrigin: true,
        secure: false, // Only for development with self-signed certs
        rewrite: (path) => path.replace(/^\/api/, ''),
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
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
})