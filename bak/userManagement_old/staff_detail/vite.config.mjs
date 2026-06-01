// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    Layouts(),
    Vue({
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    Fonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
      ],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
  ],
  base:'./',
  define: { 'process.env': {}, 'window.global': {} },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/[name].js', // Control the name of the entry files
        chunkFileNames: 'assets/js/[name].js', // Control the name of the chunk files
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').pop();
          if (extType === 'css') {
            return 'assets/css/[name].[ext]'; // Control the name of CSS files
          }
          return 'assets/[ext]/[name].[ext]'; // Other assets
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
    proxy:{
      "^/(.*)/dataEngine/v1/.*": {
        target: 'https://surupas-dev.native365.net',
        changeOrigin: true,
        secure:false
      },
      "/tools/": {
        target: 'https://surupas-dev.native365.net'
      },
      "/human_resources/": {
        target: 'https://surupas-dev.native365.net'
      },
      "/jwtr250558/": {
        target: 'https://surupas-dev.native365.net',
        changeOrigin: true,
        secure:false
      }
  }
  },
})
