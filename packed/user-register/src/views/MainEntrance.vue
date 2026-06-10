<script setup>
import { ref, onBeforeMount,  } from "vue";
import userFrom from "./UserForm.vue";
// import 'splitpanes/dist/splitpanes.css';
import { useDataStore } from "@/stores/DataStore";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from 'qrcode.vue'
import i18n from '@/i18n'

const dataStore = useDataStore()

//UserFormで@changeが動くとここに書いてある項目が全てリセットされるのでコメントアウト
const selectedRowData = ref({
  // 'userid': '',
  // 'password': '',
  'is_active': true,
  content: {}
})

// ユーザー登録のためのログイン処理
// ローカルホストでのみ実行されるようにしている
// 本番環境では、ユーザー登録は別の方法で行うことを想定している
// ここでは、デモ用のユーザー登録を行う
// <%user%>と<%password%>は、実際のユーザー名とパスワードに置き換える必要がある
async function login() {
  const result = await dataStore.login({
    user: 'its@janga.co.jp',
    password: 'janga1',
  },{remember: false})

  console.log('Login result:', result)
  return result
}

onBeforeMount(async () => {
  if(! await login() ) return
})

async function handleDataSaved(result) {
  console.log('保存しました。有難うございました。')
  // alert('保存しました。有難うございました。')
};

const currentURI = ref(window?.location?.href)

const jangaAdvertisement = ref('JangaAdvertisement.html')
const descriptionFileName = ref('JangaDescription.html')

const noteUri = computed(() => {
  const Lang = i18n.global.locale.value || localStorage.getItem('lang') || 'ja'
  if (!Lang) {
    console.warn('No language set, defaulting to "ja"')
    return `notes/ja/${descriptionFileName.value}`
  }
  console.log("Lang===", Lang)
  console.log("descriptionFileName.value===", descriptionFileName.value)
  return `notes/${Lang}/${descriptionFileName.value}` 
})

const jangaAdvertisementUri = computed(() => {
  const Lang = i18n.global.locale.value || localStorage.getItem('lang') || 'ja' 
  if (!Lang) {
    console.warn('No language set, defaulting to "ja"')
    return `notes/ja/${jangaAdvertisement.value}`
  }
  console.log("Lang===", Lang)
  console.log("jangaAdvertisement.value===", jangaAdvertisement.value)
  return `notes/${Lang}/${jangaAdvertisement.value}` 
})

// In all iframe apps, add this:
// window.addEventListener('storage', async (e) => {
//   if (e.key === 'lang' && e.newValue) {
//     const locale = e.newValue
//     await loadLocaleMessages(locale)
//     i18n.global.locale.value = locale
//   }
// })

const props = defineProps({
  logoSrc:      String,
  logoWidth:    Number,
  logoHeight:   Number
})

const logo = {
  src   : props.logoSrc   || 'surupas-sms.png',
  width : props.logoWidth || 300,
  height: props.logoHeight|| 80
}
</script>

<template>
  <v-container fluid class="pa-0 ma-0 fill-height" style="width: 100vw;">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="6" class="fill-height" style="overflow-y: auto;">
        <v-img
          :src="logo.src"
          max-width="300"
          contain
          class="mb-4"
        />
        <div
          style="
            max-width: 800px;
            margin: 0 auto;
            padding: 14px;
            border: 2px solid #00B9ef;
            background-color: white;
          "
        >
          <!-- 翻訳 -->
          <div style="color: #00B9ef;">
            <LanguageSwitcher
              :showFlag="true"
              :showName="true"
              :showSelect="true"
              :showIcon="true"
              :showLabel="true"
              :showTooltip="true"
              :showMenu="true"
              :showMenuIcon="true"
              :showMenuLabel="true"
              :showMenuTooltip="true"
              :showMenuSelect="true"
            />
          </div>
          <!-- ユーザー情報登録 -->
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              color: #00B9ef;
              font-weight: bold;
              font-size: 30px;"
          >
            {{ $t('common.mainTitle') }}
          </div>
          <!-- 説明用iframe -->
          <div>
            <iframe
              :src="noteUri"
              style="width: 100%; height: 90px; border: none;"
            ></iframe>
          </div>

          <v-card-text style="padding: 0;">
            <userFrom
              @data-saved="handleDataSaved"
              :data="selectedRowData || {}"
            />
          </v-card-text>

          <!-- 仕切り線 -->
          <div
            style="
            display: flex;
            align-items: center;
            text-align: center;"
          >
            <div style="flex: 1; border-top: 1px solid #00b9ef"></div>
              <span style="padding: 0 12px; color: #00b9ef; font-weight: 500;">または</span>
            <div style="flex: 1; border-top: 1px solid #00b9ef;"></div>
          </div>

          <!-- QRコード -->
          <div
            style="
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            margin-top: 5px;"
          >
            {{ $t('common.mobileQrCode') }}
            <QrcodeVue :value="registerUserURI" :size="100" class="ma-2" />
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6" class="fill-height" style="background-color: #f5f5f5;">
        <iframe
          :src="jangaAdvertisementUri"
          style="width: 100%; height: 100%; border: none;"
        ></iframe>
      </v-col>
    </v-row>
  </v-container>
</template>
