<script setup>
import { ref, computed, reactive } from 'vue'
import { useStorage } from '@vueuse/core'
import { useCSVUploadStore } from '@/components/csv/stores/CSVUploadStore'
import Papa from 'papaparse'
import Encoding from 'encoding-japanese'

const props = defineProps({
  data_type: {
    type: String,
    required: false
  },
})

const csvStore = useCSVUploadStore()

const openCSV = ref(false)
const fullScreen = ref(false)

const csvData = ref([])
const headers = ref([])

const selectedFile = ref([])
const fileInputRef = ref(null)
const fileForm = ref(null)

let csvDataForSave = []

const init = {
  selectedEncoding: "SJIS",
  show_company: true,
  show_comment: true,
}

const state = useStorage('file-upload-local-storage', init)

const data_type_list = [
  { label: '1: 変動項目', value: 1 },
  { label: '2: デフォルト値', value: 2 },
  { label: '3: 賞与', value: 3 },
  { label: '4: その他', value: 4 },
]

const additionals = reactive({
  company_code: '',
  csv_comment: '',
  data_type: props.data_type ? props.data_type : '1',
})

const currentFile = ref(null)

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  currentFile.value = file
  additionals.csv_comment = file.name

  parseCsv(file)
}

function parseCsv(file) {
  const reader = new FileReader()

  reader.onload = async () => {
    const fileContent = reader.result

    const shiftJISData = new Uint8Array(fileContent);

    const convertedData = Encoding.convert(shiftJISData, {
      to: 'UNICODE',
      from: state.value.selectedEncoding,
      type: 'string'
    })

    Papa.parse(convertedData, {    
      complete: (result) => {
        headers.value = result.meta.fields.filter(header => header.trim() !== '')
        csvData.value = [...result.data]
        csvDataForSave = csvData.value.map((item, index) => {
          if (Object.prototype.hasOwnProperty.call(item, '')) {
            delete item['']
          }
          return { meta_data: item, u_index: index + 1 }
        })
      },
      header: true, // Assuming the first row contains headers
    })
  }
  reader.readAsArrayBuffer(file)
}

const toggleFullScreen = () => fullScreen.value = !fullScreen.value

const save = async () => {
  const transaction_id = await csvStore.save(csvDataForSave, {
    app_id: 'salary_csv_uploader',
    staff_id: 'sysadmin',
    company_code: additionals.company_code,
    csv_comment: additionals.csv_comment,
    data_type: additionals.data_type,
  })
  
  const ret = await csvStore.adopt_evaluation_system_csv_process({transaction_id: transaction_id})
  console.log("ret=====", ret)
}

const reset = () => {
  if (!fileForm.value) return

  fileForm.value.reset()
  csvData.value = []
  headers.value = {}
  Object.assign(state.value, init)
}

const closeDialog = () => {
  openCSV.value = false
  reset()
}

const newTitle = computed(() => {
  return `CSVデータ取り込み`
})
</script>

<template>
  <div style="padding-left: 12px; padding-right: 12px; margin: 0;">
    <v-btn
      class="text-center mb-4 ma-2" color="warning" 
      title="CSVファイルを取り込みします"
      @click="openCSV=true">
      <v-icon left>mdi-upload</v-icon>
      CSV
    </v-btn>
 
    <!-- <v-btn @click="openCSV=true" class="text-center mb-4 ma-2" color="warning" title="CSVファイルをアップロードします">CSV</v-btn> -->
  </div>
  <v-dialog v-model="openCSV" :fullscreen="fullScreen" max-width="70%">
    <v-card>
      <v-card-title>
        {{ newTitle }}
        <v-spacer></v-spacer>
        <v-btn icon @click="toggleFullScreen" small class="mx-2">
          <v-icon v-if="fullScreen">mdi-arrow-collapse</v-icon>
          <v-icon v-else>mdi-arrow-expand</v-icon>
        </v-btn>
        <v-btn icon @click="reset" color="red" small class="mx-2">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn icon @click="save" color="warning" class="mx-2">
          <v-icon>mdi-upload</v-icon>
        </v-btn>
        <v-btn icon @click="closeDialog" color="orange" style="margin-right: 28px;" class="mx-2">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-subtitle>
        <v-form ref="fileForm" style="display: flex;text-align: left;">
          <v-file-input ref="fileInputRef" 
            v-model="selectedFile" label="CSVファイルを選択" 
            accept=".csv" prepend-icon="mdi-upload"
             @change="handleFileUpload" 
             show-size dropzone style="width: 20em; margin: 0px 8px;">
            </v-file-input>
          <v-select v-model="state.selectedEncoding" 
            :items="[{ title: 'UTF-8', value: 'UTF8' }, { title: 'Shift_JIS', value: 'SJIS' }]" 
            label="エンコーディング" style="width: 10em; margin-right: 8px;">
            </v-select>
        </v-form>

        <v-row>
          <v-col cols="16" sm="6">
            <v-text-field v-model="additionals.csv_comment" label="コメント" v-show="state.show_comment"></v-text-field>
          </v-col>
          <v-col cols="8" sm="6">
            <span v-if="csvData.length > 0" style="color:rgb(165, 42, 77)">行数：{{ csvData.length - 1 }} + 1</span>
          </v-col>
        </v-row>
      </v-card-subtitle>
      <v-card-text>
        <div v-if="csvData" class="table-responsive" style="height:calc(100vh - 400px); overflow:scroll; width: 100%; overflow-x: auto;">
          <table>
              <thead>
                <tr>
                  <th v-for="(header, index) in headers" :key="index" class="fixed-column header_col" >{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in csvData" :key="rowIndex">
                  <td v-for="(value, columnIndex) in row" :key="columnIndex" class="table_td">{{ value }}</td>
                </tr>
              </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.header_col {
  border-bottom: 1px solid #ccc;
  border-right: 1px solid #ccc;
  text-align: center;
  color: #2f4f4f;
  font-weight: 600;
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
  white-space: normal;
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
  background-color: #f8fce9;
}

tbody tr:nth-child(odd) {
  background-color: #ffffff;
}
</style>
