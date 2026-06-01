import { createApp } from 'vue';
// import './style.css'
import App from './App.vue';
import ja from 'vuetify/lib/locale/ja'; 
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css'; // Optional if using icons
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createPinia } from 'pinia'
// import { VTreeview } from 'vuetify/labs/VTreeview'
import i18n from './i18n'
import 'vuetify/styles';
import 'flag-icons/css/flag-icons.min.css'

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
  
const vuetify = createVuetify({
  components:{
    // VTreeview,
    ...components,
  },
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
    locale: 'ja', // デフォルトを日本語に設定
    messages: { ja }, // 日本語のメッセージを登録
  },  
});

const app = createApp(App);
app.use(createPinia())
app.use(vuetify);
app.use(i18n);
app.mount('#app');

// Listen for lang changes from other frames
window.addEventListener('storage', (e) => {
  if (e.key === 'lang' && e.newValue !== i18n.global.locale.value) {
    i18n.global.locale.value = e.newValue
  }
})
