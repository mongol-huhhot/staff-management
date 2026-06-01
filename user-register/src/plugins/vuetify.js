import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import ja from 'vuetify/lib/locale/ja'; 
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// const myCustomTheme = {
//   dark: false,
//   colors: {
//     primary: '#1976D2', // Blue
//     secondary: '#424242', // Grey
//     accent: '#82B1FF', // Light Blue
//     error: '#FF5252', // Red
//     info: '#2196F3', // Light Blue
//     success: '#4CAF50', // Green
//     warning: '#FB8C00', // Orange
//   },
// };

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
  components,
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

export default vuetify;
