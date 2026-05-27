import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import AutoImport from 'unplugin-auto-import/vite'
import { createHash } from 'crypto';  // Ensure you import createHash from crypto

export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
      ],
    }),
    vuetify({ autoImport: true }), // Enable auto-import of Vuetify components
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy:{
      "^/(.*)/dataEngine/v1/.*": {
        target: 'https://surupas-run.native365.net',
        changeOrigin: true,
        secure:false
      },
      "/tools/": {
        target: 'https://surupas-run.native365.net'
      },
      "/human_resources/": {
        target: 'https://surupas-run.native365.net'
      }
  }
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
    chunkSizeWarningLimit: 10000 // Adjust as needed
  }
});
