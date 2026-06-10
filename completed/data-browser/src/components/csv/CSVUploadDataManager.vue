<script setup>
// import { onMounted, ref, watch, computed, } from 'vue';
import { onMounted, ref, watch, } from 'vue';
import { useCSVUploadStore } from  '@/components/csv/stores/CSVUploadStore'
import CSVUpload from '@/components/csv/CSVUpload.vue'
import GridDataBrowser from '@/components/helper/AgGridPro.vue'
// import GridDataBrowser from '@/components/csv/GridDataBrowser.vue'
import CSVDownloadButton from '@/components/csv/CSVDownloadButton.vue'
import BlinkMessages from '@/components/csv/BlinkMessages.vue'

import { Grid, Menu, Aim, FullScreen } from '@element-plus/icons-vue'
import { ElButton, ElDatePicker,ElDialog } from 'element-plus'
import dayjs from 'dayjs'

// import HistoryList from '@/components/tools/CSVUpload/HistoryList.vue'

const uploadHistroyListColumns = [
    { field: 'csv_comment', headerName: 'コメント', cellStyle:{"text-align":"left", "padding": "4px"}, click:true },
    { field: 'transaction_id', headerName: '取込み番号', cellStyle:{"text-align":"left", "padding": "4px"} },
    { field: 'created_date', headerName: '取込み日時	', cellStyle:{"text-align":"center", "padding": "4px"} },
    { field: 'created_user', headerName: '取込み者', cellStyle:{"text-align":"left", "padding": "4px"} },
]

const errLogColumns = [
    { field: 'error_code', headerName: 'エラー番号', cellStyle:{"text-align":"center", "padding": "4px"} },
    { field: 'error_msg', headerName: 'エラーメッセージ', cellStyle:{"text-align":"left", "padding": "4px"} },
    { field: 'error_info', headerName: 'エラー詳細', cellStyle:{"text-align":"left", "padding": "4px"} },
    { field: 'app_id', headerName: '取引番号', cellStyle:{"text-align":"center", "padding": "4px"} },
    { field: 'log_time', headerName: '時刻', cellStyle:{"text-align":"left", "padding": "4px"} },
]

const csvStore = useCSVUploadStore();

const histList = ref([])
const histData = ref([])
// const errLog = computed(() => csvStore.dataContainer.get_error_log?csvStore.dataContainer.get_error_log:[] )
const yearmonth = ref(dayjs().format('YYYY-MM-DD'))

onMounted(async () => {
    histList.value = await csvStore.loadHistList()
})

watch(() => csvStore.saveResult, async() => {
    histList.value = await csvStore.loadHistList()
}, { deep:true })

const selectedRow = ref(null)

const rowClicked = async (event) => {
    console.log(event.data)
    selectedRow.value = event.data;
    // csvStore.loadErrorLog(event.data['transaction_id'])
    const dt = await csvStore.loadHistData({transaction_id: event.data['transaction_id']})
    histData.value = dt.map(el => { 
        const d = JSON.parse(el.meta_data); 
        if(Object.prototype.hasOwnProperty.call(d,'')){ 
            delete d['']; 
        }
        return d 
    })
    console.log("histData.value======================", histData.value)
}

const cancelClicked = async(event) => {
    console.log(event.value)
    await csvStore.remove(event.value.transaction_id)
    histList.value = await csvStore.loadHistList()
}

/**
 * データを月次給与計算項目の値として適用する
 */
const showDialog = ref(false)  
// const selectedAction = ref(null) 
const adoptToMonthlySalaryCal = () => {
    const p = {transaction_id: selectedRow.value['transaction_id'], login_staff: csvStore.params.attributes.user_id, yearmonth: dayjs(yearmonth.value).format('YYYYMM'),salCal: '1'}
    csvStore.adoptToValues(p)
}

const adoptToMonthlySalary = () => {
    const p = {transaction_id: selectedRow.value['transaction_id'], login_staff: csvStore.params.attributes.user_id, yearmonth: dayjs(yearmonth.value).format('YYYYMM'),salCal:'0'}
    csvStore.adoptToValues(p)
}

const handleButtonClick = () => {
    showDialog.value = true 
}

const handleYesClick = () => {
    adoptToMonthlySalaryCal()
    showDialog.value = false
}

const handleJustAdoptClick = () => {
    adoptToMonthlySalary()
    showDialog.value = false 
}

const handleCancelClick = () => {
    showDialog.value = false 
}
/**
 * データを計算項目の賞与として適用する
 */
 const adoptToBonusSalary = () => {
    const p = {transaction_id: selectedRow.value['transaction_id'], login_staff: csvStore.params.attributes.user_id, yearmonth: dayjs(yearmonth.value).format('YYYYMM')}
    csvStore.adoptToBonus(p)
}

/**
 * データを計算項目のデフォルト値として適用する
 */
// const adoptToDefaultSalary = () => {
//     const p = {transaction_id: selectedRow.value['transaction_id'], login_staff: csvStore.params.attributes.user_id,}
//     csvStore.adoptToDefault(p)
// }

/**
 * データを計算項目の賞与として適用する
 */
// const adoptToResidentTax = () => {
//     const p = {transaction_id: selectedRow.value['transaction_id'], user_id: csvStore.params.attributes.user_id, yearmnoth: dayjs(yearmnoth.value).format('YYYY')}
//     csvStore.adoptToResident( p )
// }

const showTop = ref(true)
const data_style = ref({})

const ToggleTop = () => {
    showTop.value = !showTop.value

    if( showTop.value )
        data_style.value = {"height": "calc(50vh - 60px)"}
    else 
        data_style.value = {"height": "calc(100vh - 190px)"}
}

const sample_data = [
    {"staff_id":"スタッフID", "salarymonth":"給与月", "js089":"月給","js002":"職務手当", 'etc':"..." },
    {"staff_id":"1213", "salarymonth":"202312", "js089":"200000","js002":"5000", 'etc':"..." },
    {"staff_id":"上からの一番目の行は給与計算項目記号。二番目の行は給与計算項目名称。項目数は制限なし。記号ではない項目は除外する", salarymonth:'',js089:'',js002:'','etc':''},
]

function onDeleteRow(event) {
    console.log('delete row', event.data)
    // csvStore.deleteHistData(event.data.id)
    // histData.value = histData.value.filter(el => el.id !== event.data.id)
}

</script>

<template>
    <div style="margin: 8px;">
        <div v-show="showTop" style="display: flex; justify-content: space-between; height:calc(36vh); width:100%">
            <div style="width: calc(100vw);">
                <div style="display: flex; justify-content: space-between; width:98%; margin-bottom: 6px;">
                    <h4>【CSVアップロード履歴】
                        <!-- <span style="font-size: 0.7em;">注意：すでに適用されたアップロードデータは取り消しすることはできません！</span> -->
                    </h4>
                    <CSVUpload ></CSVUpload>
                    <BlinkMessages>
                        <CSVDownloadButton
                            :data="sample_data"
                            title="取込み用給与計算データのサンプルCSV"
                            download_file="取込み用給与計算データのサンプルCSV"
                            >
                        </CSVDownloadButton>
                    </BlinkMessages>
                </div>
                <!-- upper left list of uploaded csv files -->
                <div class="table-responsive" style="height:calc(30vh); overflow:scroll; width: 100%; overflow-x: auto;">
                    <GridDataBrowser 
                        :rowData="histList" 
                        :columns="uploadHistroyListColumns" 
                        height="96%"
                        @row-click="rowClicked" 
                        :show_op="true"
                        @trans-cancel="cancelClicked"
                        @delete-row="onDeleteRow"
                    ></GridDataBrowser>
                    <!-- @row-delete="onDeleteRow" -->
                </div>
            </div>
            <div style="text-align: left; margin-left: 6px;margin-top: 0px; width:40%">
                <div style="display: flex; justify-content: space-between; width:60%; margin-bottom: 4px;">
                    <h4 style="min-width: 160px;margin-top: 2px;">【アップロード結果】</h4>
                    <span v-if="errLog" style="font-size: 0.7em; margin-left: 20px;padding-top: 8px;">件数：{{ errLog.length }}</span>
                </div>
                <div class="table-responsive" style="height:calc(30vh); width: 100%; overflow: auto;margin-right: 12px; overflow-x: auto;">
                                            <!-- :show_op="true" -->
                    <GridDataBrowser 
                        :rowData="errLog" 
                        :columns="errLogColumns">
                    </GridDataBrowser>
                </div>
            </div>
        </div>
        <hr  v-show="selectedRow"/>
        <div v-show="selectedRow">
            <h4>【アップロードしたデータ】
                <span v-if="histData"> 件数: {{ histData.length }}</span>
                <span v-if="selectedRow" style="font-size: .7em; color:darkslategray; margin-left: 20px;margin-bottom: 0px;">{{ `${selectedRow.csv_comment}, ${selectedRow.transaction_id}`}}</span>
            </h4>
            <div style="display: flex; justify-content:left ; width:100%; padding-bottom: 8px;">
                <el-date-picker v-model="yearmonth" type="month" placeholder="適用する給与・賞与年月" format="YYYYMM" value-format="YYYY-MM-DD" style="width: 14em; margin-right: 12px;"></el-date-picker>
                <el-button 
                    type="success" 
                    :icon="Grid" 
                    @click="handleButtonClick" 
                    title="今月の給与計算値として反映します"
                >
                    給与に適用
                </el-button>
                <el-button v-if="true" type="warning" :icon="Menu" @click="adoptToBonusSalary" title="賞与の反映します">賞与に適用</el-button>
                <!-- <el-button v-if="true" type="danger" :icon="Menu" @click="adoptToDefaultSalary" title="デフォルト値の反映します">固定値に適用</el-button> -->
                <!-- <el-button v-if="true" type="primary" :icon="Menu" @click="adoptToResidentTax" title="住民データ設定の反映します">住民税に適用</el-button> -->

                <el-button v-if="showTop" 
                    @click="ToggleTop"
                    :icon="FullScreen" 
                    type="success"
                    title="上部の表を隠します">
                </el-button>
                <el-button v-if="!showTop" 
                    @click="ToggleTop"
                    :icon="Aim" 
                    type="warning"
                    title="上部の表を表示します">
                </el-button>
                <span style="font-size: .7em; margin-left: 20px;padding-top: 6px;">
                    ★ 同CSVデータアップローダーは項目を識別して値を適用しますが、項目の値についてはチェックやバリデーションは一切しないため項目の値は担当者様がちゃんとご確認ください!</span>
            </div>
            <!-- {{ histData }} -->
            <div class="table-responsive" 
                style="height:calc(50vh - 60px); overflow:auto; width: 100%;display: block; overflow-x: auto;"
                :style="data_style">
                <GridDataBrowser 
                    height="96%"
                    :rowData="histData">
                </GridDataBrowser>
            </div>
        </div>
        <el-dialog 
            v-model="showDialog" 
            title="適用要確認" 
            width="30%" 
            :before-close="handleCancelClick"
            custom-class="centered-dialog">
            <span>給与データを適用し給与計算作業を行いますか？</span>
            <template #footer>
                <el-button type="primary" @click="handleYesClick">給与計算を行う</el-button>
                <el-button type="success" @click="handleJustAdoptClick">データ取り込み</el-button>
                <el-button @click="handleCancelClick">キャンセルする</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped>
h4 {
    padding: 0; 
    margin: 0 0 8px 0; 
}
.centered-dialog .el-dialog {
  margin-top: 0px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  padding: 0px !important;
}

</style>
