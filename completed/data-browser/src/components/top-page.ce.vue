<script setup>
import jaJP from 'element-plus/dist/locale/ja.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/display.css'
import { watch,} from 'vue'
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

watch( ()=>props.j, async (newVal) => {
    if(!newVal)  return
    let p = props.j
    try {
        if( props.j && typeof props.j == 'string' )
            p = JSON.parse(props.j.replace(/&quot;/g, '"'))
    } catch(e) {
        console.log(e)
    }
    dataStore.params.attributes = p
    // await dataStore.load('salary_login_staff', p)

}, {deep:true, immediate: true} ) 

</script>

<template>
    <el-config-provider :locale="jaJP">
        <div v-if="props.j" class="common-layout">
            <DataBrowser></DataBrowser>
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
