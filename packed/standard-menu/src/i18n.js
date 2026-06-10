// src/i18n.js
import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    welcome: 'Welcome',
    selectLang: 'Language'
  },
  ja: {
    welcome: 'ようこそ',
    selectLang: '言語'
  },
  zh: {
    welcome: '欢迎',
    selectLang: '语言'
  },
  ko: {
    welcome: '환영합니다',
    selectLang: '언어'
  },
  vi: {
    welcome: 'Chào mừng',
    selectLang: 'Ngôn ngữ'
  }
}

// Determine initial locale
const savedLang = localStorage.getItem('lang')
const browserLang = navigator.language.split('-')[0]

const supportedLocales = ['en', 'ja', 'zh', 'ko', 'vi']
const initialLocale = savedLang || supportedLocales.includes(browserLang) ? browserLang : 'en'

// Save fallback to localStorage if needed
if (!savedLang && supportedLocales.includes(initialLocale)) {
  localStorage.setItem('lang', initialLocale)
}

export default createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: {
    'ja': ['en'],
    default: ['en']
  },
  warnHtmlInMessage: false,
  messages: {}
})
