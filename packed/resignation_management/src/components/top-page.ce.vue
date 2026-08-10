<!-- top-page.ce.vue -->
<script setup>
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ref, watch } from 'vue'
import MainLayout from '@/components/MainLayout.vue'
import { useDataStore } from '@/stores/DataStore'
import Snackbar from "@/utils/SnackBar.vue";

const props = defineProps({
  j: {
    type: String,
    required: false,
    default: JSON.stringify({
      user_id: import.meta.env.VITE_DEV_USER_ID || 'dev_user',
      tid: import.meta.env.VITE_DEV_TENANT_ID || 'showcase',
    }),
  },
})

const dataStore = useDataStore()

const loginReady = ref(false)

const isLocalDev = () => {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1'
}

async function checkLogin() {
    // ログインチェック
    if ( isLocalDev() ) {
      const result = await devLogin()
      console.log('Dev login result:', result)
      loginReady.value = result?.code === 0 && !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
    }
    
    // 通常環境：全体ログインに頼る
    const verified = await dataStore.verify({
      loading: false,
    })
    loginReady.value = !!verified

    return loginReady.value
}

async function devLogin() {
  return await dataStore.login(
    {
      user: import.meta.env.VITE_DEV_LOGIN_USER || 'its@janga.co.jp',
      password: import.meta.env.VITE_DEV_LOGIN_PASSWORD || 'janga1',
    },
    {
      persist: true,
      loading: true,
    }
  )
}

watch(
  () => props.j,
  async () => {
    if (!props.j) return

    let p = props.j

    try {
      if (props.j && typeof props.j === 'string') {
        p = JSON.parse(props.j.replace(/&quot;/g, '"'))
      }
    } catch (e) {
      console.log(e)
      return
    }

    dataStore.params.attributes = p

    const ok = await checkLogin()
    if (!ok) return

    await dataStore.get_user_register({
       user_id: p.user_id,
    })
  },
  {
    deep: true,
    immediate: true,
  }
)

</script>

<template>
  <v-locale-provider locale="ja">
    <div v-if="props.j && loginReady">
      <Snackbar/>
      <MainLayout />
    </div>

    <div v-else-if="props.j && !loginReady" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else>
      <h4 style="color: brown;">
        必要なパラメータが設定されてない！
      </h4>
    </div>
  </v-locale-provider>
</template>
