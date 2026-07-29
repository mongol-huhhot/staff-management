<script setup>
import jaJP from 'element-plus/dist/locale/ja.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import { ref, watch,} from 'vue'
import { ElConfigProvider,} from 'element-plus';
import DataBrowser from './DataBrowser.vue';
import { useDataBrowserStore } from '@/stores/DataBrowserStore'

/** json string */
const props = defineProps({
    j: {
        type: String,
        required: true
    },
})

// create store and load master data
const dataStore = useDataBrowserStore()

// ログイン完了までDataBrowserを描画しない
const loginReady = ref(false)

const isLocalDev = () => {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1'
}

// ローカル開発時のみ使うログイン処理（本番はホストの全体ログインに頼る）
async function devLogin() {
    return await dataStore.login(
        {
            user: process.env.VUE_APP_DEV_LOGIN_USER || 'its@janga.co.jp',
            password: process.env.VUE_APP_DEV_LOGIN_PASSWORD || 'janga1',
        },
        {
            persist: true,
            loading: true,
        }
    )
}

watch( ()=>props.j, async (newVal) => {
    loginReady.value = false

    if(!newVal)  return
    let p = props.j
    try {
        if( props.j && typeof props.j == 'string' )
            p = JSON.parse(props.j.replace(/&quot;/g, '"'))
    } catch(e) {
        console.log(e)
        return
    }
    dataStore.params.attributes = p
    // await dataStore.load('salary_login_staff', p)

    if( isLocalDev() ) {
        const result = await devLogin()
        loginReady.value = result?.code === 0 &&
            !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
        return
    }

    // 通常環境：全体ログインに頼る
    const verified = await dataStore.verify({ loading: false })
    loginReady.value = !!verified

}, {deep:true, immediate: true} )

</script>

<template>
    <el-config-provider :locale="jaJP">
        <div v-if="props.j && loginReady" class="common-layout">
            <DataBrowser></DataBrowser>
        </div>
        <div v-else-if="props.j">
            認証確認中です...
        </div>
        <div v-else >
            <h4 style="color: brown;">必要なパラメータが設定されてない！</h4>
        </div>
    </el-config-provider>
</template>

<style scoped>
.common-layout {
    text-align: center;
    justify-content: center;
    background-color: #fefefe;
}
</style>
