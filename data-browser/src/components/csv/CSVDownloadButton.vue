<script setup>
import { ElButton, ElNotification, } from 'element-plus'
import { Download, } from '@element-plus/icons-vue'
import dayjs from "dayjs"
import { downloadCSV } from '@/components/csv/stores/ObjectArrayToCSV'

const props = defineProps({
    data: Array,
    columns: Array,
    title: String,
    download_file: String,
    filters: Array,
})

function csvDownload() {
    const dt = dayjs().format('YYYYMMHHmmss');
    const filename = props.download_file?props.download_file+'-' + dt + '.csv':'csv_data_' + dt + '.csv'
    if( !props.data ) {
        ElNotification({
            title: '注意：',
            message: 'ダウンロードデータはありません。',
            type: 'error',
        })
        return
    }

    downloadCSV( props.data, props.columns, filename, props.filters)
}
const mytitle = props.title?props.title:'CSVデータダウンロード'

</script>
<template>
    <el-button type="warning"
        circle
        :icon="Download" 
        @click="csvDownload"
        :title="mytitle"
        style="margin-left: 12px;"
        >
    </el-button>
</template>
