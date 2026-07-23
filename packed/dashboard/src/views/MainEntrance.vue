<script setup>
import { ref, onBeforeMount,  } from "vue";
import Dashboard from "./Dashboard.vue";
// import Dashboard from "./AttendanceDashboard.vue";
// import Dashboard from "./AttendanceDashboard2.vue";
// import IdentityFrom from "./UserForm.vue";
// import 'splitpanes/dist/splitpanes.css';
import { useDataStore } from "@/stores/DataStore";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from 'qrcode.vue'
import i18n from '@/i18n'

// import UserAuth from "@/components/UserAuth.vue";

//UserFormで@changeが動くとここに書いてある項目が全てリセットされるのでコメントアウト
const selectedRowData = ref({
  // 'userid': '',
  // 'password': '',
  'is_active': true,
  content: {}
})

const dataStore = useDataStore()

// ログイン完了までDashboardを描画しない
const loginReady = ref(false)

// ユーザー登録のためのログイン処理
// ローカルホストでのみ実行されるようにしている
// 本番環境では、ユーザー登録は別の方法で行うことを想定している
// ここでは、デモ用のユーザー登録を行う
// <%user%>と<%password%>は、実際のユーザー名とパスワードに置き換える必要がある
async function login() {
  // 既に有効なトークンがあればそのまま利用
  if (await dataStore.verify()) return true

  if (import.meta.env.VITE_APP_MODE !== 'development') {
    console.warn('有効なトークンがありません。ホスト側でログインしてください。')
    return false
  }
  // select * from user_schema.check_user(<%user%>, <%password%>)
  const ret = await dataStore.login(
    {
      user: 'its@janga.co.jp',
      password: 'janga1',
    },
    {
      persist: true,
      loading: true,
    }
  )

  return !!ret?.token
}

onBeforeMount(async () => {
  loginReady.value = await login()
})

// <%user%>, <%password%>
// onMounted(async () => {
  // const sqltag = 'login'
  // const params = {'user': 'demo3@janga.co.jp', password:'demo3'}
  // const ret = await dataStore.login(sqltag, params)
  // if(!ret) return 

  // if(ret.status === 'success')
  //   localStorage.setItem('token', ret.data.token);

  // console.log("ret====", ret)
// })

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
    <!-- <UserAuth /> -->
    <Dashboard v-if="loginReady" />
  </v-container>
</template>
