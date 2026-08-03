import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { createHash } from 'crypto';  // Ensure you import createHash from crypto

export default defineConfig({
  base: './',

  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '^/[^/]+/dataEngine/.*': {
        target: 'https://surupas-dev.native365.net',
        changeOrigin: true,
        secure: false
      }
    }
    // },
  },

  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          const code = chunkInfo.code || '';
          const hash = createHash('md5').update(code).digest('hex').slice(0, 8);
          return `assets/[name]-${hash}.js`;
        },
        entryFileNames: (chunkInfo) => {
          const code = chunkInfo.code || '';
          const hash = createHash('md5').update(code).digest('hex').slice(0, 8);
          return `assets/[name]-${hash}.js`;
        },
        assetFileNames: (assetInfo) => {
          const source = assetInfo.source || '';
          const ext = assetInfo.name.split('.').pop();
          const hash = createHash('md5').update(source).digest('hex').slice(0, 8);
          return `assets/[name]-${hash}.${ext}`;
        }
      }
    },
    chunkSizeWarningLimit: 10000,
  },
})