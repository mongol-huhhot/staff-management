// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/components/top-page.ce.vue'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import { ja } from 'vuetify/locale'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// staff_apply と同じテーマ (デザイン統一 2026-08-07)
const myCustomTheme = {
  dark: false,
  colors: {
    primary: '#00A0E9',
    secondary: '#0068B7',
    accent: '#8c9eff',
    success: '#00B9EF',
    warning: '#6E60A8',
    error: '#E6003E',
    info: '#003894',
  },
}

const customJa = {
  ...ja,

  input: {
    ...ja.input,

    // clearable の警告対策
    clear: 'クリア',

    // 念のため不足しやすいキーも追加
    appendAction: '追加アクション',
    prependAction: '前アクション',
  },

  open: '開く',
  close: '閉じる',
}

const vuetify = createVuetify({
  components: { ...components, },
  directives,

  theme: {
    defaultTheme: 'myCustomTheme',
    themes: {
      myCustomTheme,
    },
  },

  locale: {
    locale: 'ja',
    fallback: 'en',
    messages: {
      ja: customJa,
    },
  },
})

const app = createApp(App)

app.use(vuetify)
app.use(createPinia())

app.mount('#app')
