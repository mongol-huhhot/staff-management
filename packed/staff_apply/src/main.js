// main.js
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import wrapper from 'vue3-webcomponent-wrapper'
import WebComponent from '@/components/top-page.ce.vue'
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import { ja } from 'vuetify/locale'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDateInput } from 'vuetify/labs/VDateInput'
import ImageUploader from '@/components/forms/fields/ImageUploader.vue'

const myCustomTheme = {
    dark: false,
    colors: {
        primary: '#00A0E9',     // Replace with your desired primary color
        secondary: '#0068B7',   // Replace with your desired secondary color
        accent: '#8c9eff',      // Replace with your desired accent color
        success: '#00B9EF',     // Replace with your desired success color
        warning: '#6E60A8',     // Replace with your desired warning color
        error: '#E6003E',       // Replace with your desired error color
        info: '#003894',        // Replace with your desired info color
    },
};


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
  components: { ...components, VDateInput,ImageUploader },
  directives,
  theme: {
    defaultTheme: 'myCustomTheme',
    themes: {
      myCustomTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
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

const WebComponentInner = (component) => {
  const app = createApp(component)

  app.use(vuetify)
  app.use(createPinia())

  return app
}

const webComponent = wrapper(WebComponent, WebComponentInner, h)

if (!customElements.get('generic-master-system')) {
  customElements.define('generic-master-system', webComponent)
}
