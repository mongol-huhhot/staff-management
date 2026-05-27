<!-- LanguageSwitcher.vue -->
<script setup>
import { computed, watch, } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/utils/loadLocaleMessages'
// import i18n from '@/i18n'

const { locale } = useI18n()
// This component allows users to switch between different languages in the application.
// It uses Vue I18n for internationalization and provides a dropdown to select the language.  
const locales = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'ja', name: '日本語', flag: 'jp' },
  { code: 'zh', name: '中文', flag: 'cn' },
  { code: 'ko', name: '한국어', flag: 'kr' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'vn' }
]

const selectedLocale = computed({
  get: () => locale.value,
  set: async (val) => {
    await loadLocaleMessages(val)
    locale.value = val
    localStorage.setItem('lang', val)
  }
})

// Load current locale on component mount
const initialLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en'
if (locales.map(l => l.code).includes(initialLang)) {
  selectedLocale.value = initialLang
}

watch(
  () => selectedLocale,
  async (newLocale) => {
    await loadLocaleMessages(newLocale);
    console.log("newLocale===", newLocale)
  }
);

// In all iframe apps, add this:
// window.addEventListener('storage', async (e) => {
//   if (e.key === 'lang' && e.newValue) {
//     const locale = e.newValue
//     await loadLocaleMessages(locale)
//     i18n.global.locale.value = locale
//   }
// })

</script>

<template>
  <v-select
    v-model="selectedLocale"
    :items="locales"
    item-title="name"
    item-value="code"
    :label="$t('common.selectLang')"
    variant="outlined"
    density="compact"
    hide-details
    class="lang-select"
    :menu-props="{ maxHeight: '300' }"
    style="max-width: 160px;"
  >
    <template #item="{ item, props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <span class="fi" :class="`fi-${item.raw.flag}`" style="margin-right: 8px;"></span>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>
