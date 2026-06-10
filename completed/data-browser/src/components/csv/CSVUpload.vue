<script setup>
import { ref, computed, reactive, } from 'vue'
import { useStorage } from '@vueuse/core'
import { ElDialog, ElButton, ElSelect, ElOption, ElInput, ElCheckbox, ElRow, ElCol, ElForm, ElFormItem, } from 'element-plus'
import { useCSVUploadStore } from  '@/components/csv/stores/CSVUploadStore'
// import { useMasterStore } from '@/stores/masters/MasterStore'

import { CloseBold,  FullScreen, Aim, UploadFilled, RefreshLeft, Upload,} from '@element-plus/icons-vue'

import iconv from 'iconv-lite';
import Papa from 'papaparse';

// import DynamicSelectBox from '@/components/conditions/DynamicSelectBox.vue'

const props = defineProps({
  data_type: {
    type: String,
    required: false
  },
})


const csvStore = useCSVUploadStore();
// const masterStore = useMasterStore()
// const { data } = toRefs(masterStore);
// const login_staff = computed(() => {
//     return data.value.fuji_salary_login_staff&&data.value.fuji_salary_login_staff.length>0?data.value.fuji_salary_login_staff[0]:{}
// })

const openCSV = ref(false)
const fullScreen = ref(false)

const csvData = ref([])
const headers = ref([])

const selectedFile = ref([])
const fileInputRef = ref(null)
const fileForm = ref(null);

let csvDataForSave = []

const init = {
    selectedEncoding: "UTF-8",
    show_company: true,
    show_comment: true,
}

const state = useStorage('file-upload-local-storage', init)

const data_type_list = [
    { label:'1: 変動項目', value: 1},
    { label:'2: デフォルト値', value: 2},
    { label:'3: 賞与', value: 3},
    { label:'4: その他', value: 4},
]

const additionals = reactive({
    company_code: '0001',
    csv_comment: '',
    data_type: props.data_type?props.data_type:'1',
    login_staff: csvStore.params.attributes.user_id
})

const currentFile = ref(null)

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentFile.value = file

    additionals.csv_comment = file.name

    // console.log(file)
    parseCsv(file)
}

function parseCsv(file) {
    const reader = new FileReader();

    reader.onload = async () => {
        const fileContent = reader.result;

        const shiftJISData = new Uint8Array(fileContent);
        const convertedData = iconv.decode(shiftJISData, state.value.selectedEncoding)

        // Use Papaparse to parse the CSV data
        Papa.parse(convertedData, {
            complete: (result) => {
                // Filter out any empty strings from headers.value
                headers.value = result.meta.fields.filter(header => header.trim() !== '');
                csvData.value = [...result.data];
                console.log(headers.value);
                // index should be start from 1, not 0
                csvDataForSave = csvData.value.map((item, index) => {
                    if (Object.prototype.hasOwnProperty.call(item, '')) {
                        delete item[''];
                    }
                    return { meta_data: item, u_index: index + 1 };
                });
            },
            header: true, // Assuming the first row contains headers
            skipEmptyLines: true
        });
    };
    reader.readAsArrayBuffer(file);
}

// toggle full screen mode
const toggleFullScreen = () => fullScreen.value = !fullScreen.value

// save upload csv file
const save = () => {
    console.log({...additionals})

    csvStore.save(csvDataForSave, {
        app_id:'salary_csv_uploader', 
        staff_id:'sysadmin', 
        company_code:additionals.company_code, 
        csv_comment: additionals.csv_comment, 
        data_type: additionals.data_type,
        login_staff: additionals.login_staff,
        }, show_import_only.value)
}

// reset upload file
const reset = () => {
    if( !fileForm.value ) 
        return

    fileForm.value.reset();
    csvData.value=[]
    headers.value = {}
    Object.assign(state.value, init)
}

// on close reset upload file while close dialog window
const closeDialog = () => {
    openCSV.value=false
    reset()
}

const newTitle = computed(() =>  {
    return `給与計算関連データのCSVアップロード`
})

const show_import_only = ref(false)

</script>

<template>
<div>
    <div style="padding-left: 12px; padding-right: 12px;">
        <el-button type="success" @click="openCSV=true" :icon="Upload" title="CSVファイルをアップロードします">CSV</el-button>
    </div>
    <el-dialog v-model="openCSV" 
        :title="newTitle"
        top="3vh"
        width="70%" :fullscreen="fullScreen" draggable 
        >
        <div class="card-header">
            <form ref="fileForm">
                <el-select v-show="false" v-model="additionals.data_type" title="アップロードデータ種類" style="width: 12em; margin-right: 8px;" placeholder="アップロードデータ種類">
                    <el-option v-for="(el, index) in data_type_list" :key="index" :value="el.value" :label="el.label"></el-option>
                </el-select>
                
                <!-- 会社選択 -->
                <!-- <el-select v-model="additionals.company_code" filterable placeholder="会社選択">
                    <el-option
                        v-for="item in masterStore.data.company"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                </el-select> -->

                <input ref="fileInputRef" 
                    type="file" 
                    :value="selectedFile" 
                    @change="handleFileUpload" 
                    accept=".csv" 
                    style="margin-top:4px;" />

                <!-- <span v-else style="color: rgb(231, 36, 111);font-size: 0.8em;">先に,会社を選びます。</span> -->
                <el-select v-model="state.selectedEncoding" title="アップロードするファイのエンコーディングを選択下さい！" style="width: 8em; margin-right: 8px;" placeholder="エンコーディング">
                    <el-option value="UTF-8">UTF-8</el-option>
                    <el-option value="Shift_JIS">Shift-JIS</el-option>
                </el-select>
                
                <el-checkbox v-model="state.show_comment" label="説明追加"/>
                <el-checkbox v-model="show_import_only" label="取込みだけ"/>
                <!-- <el-checkbox v-model="state.show_data_type" label="データ"/> -->
            </form>
            <span v-if="csvData.length>0" style="font-size: 0.9em; color:rgb(165, 42, 77)">行数：{{ csvData.length - 1 }} + 1</span>
            <el-button v-if="fullScreen" @click="toggleFullScreen" type="primary" circle :icon="Aim" title="ポップアップ画面を縮小して表示"></el-button>
            <el-button v-else @click="toggleFullScreen" type="warning" circle :icon="FullScreen" title="ポップアップ画面を全画面に表示"></el-button>
            <el-button @click="reset" type="danger" circle :icon="RefreshLeft" title="データをリセットする"></el-button>
            <el-button @click="save" :icon="UploadFilled" type="danger">保存</el-button>
            <el-button @click="closeDialog" :icon="CloseBold" type="warning" style="margin-right: 28px;">閉じる</el-button>
        </div>
        <div>
            <el-row>
                <el-col :span="12">
                    <el-form :model="form" label-width="80px">
                        <el-form-item label="コメント:" v-show="state.show_comment">
                            <el-input v-model="additionals.csv_comment"></el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <span v-if="currentFile">取込み中のCSVファイル名: <b>{{ currentFile.name }}</b></span>
                </el-col>
            </el-row>
        </div>
        <!-- <h4>{{props.title}}アップロードのCSVデータ</h4> -->
        <div v-if="csvData" class="table-responsive" style="height:calc(100vh - 400px); overflow:scroll; width: 100%; overflow-x: auto;">
            <table style="max-height:calc(100vh - 420px);overflow-y:auto ;width: 100%; white-space: nowrap;">
                <thead class="thead-fixed">
                    <tr>
                        <th v-for="(header, index) in headers" :key="index" class="header_col">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in csvData" :key="rowIndex">
                        <td v-for="(value, columnIndex) in row" :key="columnIndex" class="table_td">{{ value }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </el-dialog>
</div>
</template>

<style scoped>

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px !important;
  margin-bottom: 8px !important;
  padding: 0 0 0 0 ;
}

.card-header-title {
  margin-top: 0px !important;
  margin-bottom: 0px !important;
  padding: 0px 0px !important;
}

.waring-info {
    margin-left: 12px;
}

.header_col {
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc;
    text-align: center;
    color: #2f4f4f;
    font-weight:600;
    font-size: 0.99em;
    background-color: rgba(204, 217, 228, 0.45);
    padding: 6px 12px 6px 6px;
}

.table_td {
    text-align: center;
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc; 
    font-size: small; 
}

.help_table_td {
    text-align: left;
    /* word-wrap: break-word; */
    white-space: normal;
}

.input_field {
    background-color: transparent !important;
    border: none;
    color: #2f4f4f;
}

table {
  border-collapse: collapse;
  table-layout: auto;
}

.thead-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
}

tbody tr:nth-child(even) {
  background-color: #f8fce9; /* 偶数行の背景色 */
}

tbody tr:nth-child(odd) {
  background-color: #ffffff; /* 奇数行の背景色 */
}
</style>
