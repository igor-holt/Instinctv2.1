import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // Using custom domain, so base path is root
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        outDir: 'docs', // GitHub Pages can serve from docs/ folder
        emptyOutDir: true,
        sourcemap: false, // Disable sourcemaps for production
        rollupOptions: {
          output: {
            manualChunks: undefined, // Keep simple for CDN-based app
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.WORKER_ENDPOINT': JSON.stringify(env.WORKER_ENDPOINT || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
