<script setup>
import { computed, } from 'vue';
import { ElButton, ElNotification, } from 'element-plus'
import { Minus, Download, } from '@element-plus/icons-vue'
import dayjs from "dayjs";
import { downloadCSV } from '@/components/csv/stores/ObjectArrayToCSV'

const MODULE_ID = 'GridDataBrowser'
console.log(MODULE_ID)

/**
 * parameters set from outside
 * 
 */
const props = defineProps({
    data: Array,
    columns: Array,
    show_op: Boolean,
    title: String,
    download_file: String,
    filters: Array,
    // back_color: String,
})

const emits = defineEmits(['row-click', 'trans-cancel'])

const headers = computed(() => {
    if( props.columns ) return props.columns

    if (props.data && props.data.length > 0) {
        return Object.keys(props.data[0]).map(el => ({field: el, headerName:el, style:{}, click:false }));
    }
    return [];
});

const minusClicked = (row, rowIndex) => {
    emits('trans-cancel', { value: row, index:rowIndex });
}

const rowClicked = (row) => {
    emits('row-click', { value: row });
};

function csvDownload() {
    const dt = dayjs().format('YYYYMMHHmmss');
    const filename = props.download_file?props.download_file+'-' + dt + '.csv':'GridDataBrowser_Download' + dt + '.csv'
    if( !props.data ) {
        ElNotification({
            title: '注意：',
            message: 'ダウンロードデータはありません。',
            type: 'error',
        })
        return
    }
    downloadCSV( props.data, filename, props.filters)
}

</script>

<template>
    <!-- <div v-if="props.data">{{ props.data }}</div> -->
    <slot name="title">
        <h4 v-if="props.title">{{ props.title }}</h4>
    </slot> 
    <slot name="content" v-if="props.data&&props.data.length > 0">
        <table style="max-height:95vh;overflow-y:auto ;width: 99%; white-space: nowrap;" >
            <thead class="thead-fixed">
                <tr>
                    <th class="fixed-column header_col">
                        <el-button type="primary"
                            :icon="Download"
                            circle
                            @click="csvDownload"
                            title="一覧中のデータをCSVフォーマットで出力します"
                            size="small"
                            >
                        </el-button>
                    </th>
                    <th v-if="props.show_op" class="header_col">操作</th>
                    <template v-for="(header, index) in headers" :key="index">
                        <th v-if="header.click" class="fixed-column header_col" >【{{ header.headerName }}】</th>
                        <th v-else class="fixed-column header_col">{{ header.headerName }}</th>
                    </template>
                </tr>
            </thead>
            <tbody class="">
                <tr v-for="(row, rowIndex) in props.data" :key="rowIndex">
                    <td class="table_td fixed-column">{{ rowIndex + 1 }}</td>
                    <td v-if="props.show_op" class="table_td">
                        <el-button 
                            circle type="danger" 
                            :icon="Minus" 
                            size="small"
                            @click="minusClicked(row, rowIndex)" 
                            title="このデータを取り消しします"/>
                    </td>
                    <template v-for="(item, columnIndex) in headers" :key="columnIndex">
                        <td v-if="item.click" class="table_td click-td" :style="item.cellStyle" @click="rowClicked(row)">{{ row[item.field] }}</td>
                        <td v-else class="table_td" :style="item.cellStyle">{{ row[item.field]}}</td>
                    </template>
                </tr>
            </tbody>
        </table>
    </slot>
    <div v-else style="">データはありません。</div>
</template>

<style scoped>

h4 {
    padding: 0; 
    margin: 0 0 8px 0; 
    color: #239179;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0px !important;
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
    font-weight:500;
    font-size: 0.93em;
    background-color: rgba(204, 217, 228, 0.45);
    padding: 4px 12px 4px 6px;
}

.table_td {
    text-align: center;
    border-bottom: 1px solid #ccc;
    border-right: 1px solid #ccc; 
    font-size: small; 
}

.click-td:hover {
  background-color: rgba(255, 165, 0, 0.3 );
  color: red;
  text-decoration: underline;
  transform: scale(1.01);
  cursor: pointer;
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
  position: -webkit-sticky;
  top: 0;
  z-index: 1000;
  background-color: rgba(233, 238, 241, 1);
}

tbody tr:nth-child(even) {
  background-color: #f8fce9; /* 偶数行の背景色 */
}

tbody tr:nth-child(odd) {
  background-color: #ffffff; /* 奇数行の背景色 */
}

.fixed-column {
    position: -webkit-sticky;
    position: sticky;
    left: 0;
    background-color: rgba(233, 238, 241, 1);
    z-index: 1000;
}
</style>
