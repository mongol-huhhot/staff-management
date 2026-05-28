<script setup>
import { ref, onMounted, } from 'vue';
// import DataHandlingSlot from "@/components/slots/DataHandlingSlot.vue"; // The updated slot component
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
// import { AgGridVue } from "ag-grid-vue3";
// import { localeJP } from '@/utils/LocaleJP';
import { useDataStore } from "@/stores/DataStore";
import { drafts } from "@/utils/CustomFilters";
import AgGridPro from '@/components/helper/AgGridPro.vue';

const componentName = import.meta.url
  .split('/') // Split the URL by '/'
  .pop() // Get the last part (file name with extension and query parameters)
  .split('?')[0] // Remove query parameters (everything after '?')
  .replace('.vue', ''); // Remove the .vue extension

console.log(componentName); // Outputs the file name without the .vue extension

const statusList = [
    { value: 'draft',  label: '作成中' ,},
    { value: 'pending', label: '登録申請' ,},
    { value: 'returned', label: '差戻し' ,},
    { value: 'approved', label: '承認済み' ,},
    { value: 'rejected', label: '拒絶' ,},
    { value: 'confirmed', label: '承諾' ,},
]

const columns = [
    { field: 'draft_status', headerName:'状態',filter:drafts,valueGetter:params=>statusList.find(el=>el.value==params.data.draft_status).label,cellStyle:statusColor},
    // { field: 'department_name', headerName: '所属部門' ,valueGetter:params=>params.data.department_name || '未定'},
    { field: 'userid', headerName: 'ユーザID' },
    { field: 'email', headerName: 'メール' },
    { field: 'fullname', headerName: 'お名前' },
    { field: 'gentle', headerName: '性別' },
    // { field: 'job_name', headerName: '職種・権限' },
    // { field: 'employment_name', headerName: '雇用区分'},
    // { field: 'gender', headerName: '性別' },
    { field: 'bithday', headerName: '生年月日' },
    { field: 'address', headerName: '住所' },
    { field: 'created_at', headerName: '作成日' },
    { field: 'updated_at', headerName: '更新日' },
];

const emit = defineEmits(["row-selected"]); // Define the event in the parent

// const gridOptions = {
//     rowStyle: { color: 'darkslategrey', 'font-size': '0.97em' },
//     autoSizeStrategy: { type: 'fitCellContents' },
//     // domLayout: 'autoHeight',
//     alwaysShowVerticalScroll: true,
//     // alwaysShowVerticalScroll: true,
//     defaultColDef: {
//         flex: 1,
//         resizable: true,
//         sortable: true,
//         filter: true,
//     },
//     localeText: localeJP,
//     rowSelection: {
//         checkboxes: false,
//         mode: 'singleRow',
//         enableClickSelection: true,
//     },
// };

// const gridApi = ref(null);
// const gridColumnApi = ref(null);
// const mainSlot = ref(null);     // Reference to the slot component

const dataStore = useDataStore();

// Grid ready event
// function onGridReady(params) {
//     gridApi.value = params.api;
//     gridColumnApi.value = params.columnApi;
// }

/** for refresh/reload data */
const fetchData = async (p={}) => {
    // if (!mainSlot.value?.fetchData) return
    try {
        const result = await dataStore.userlist(p);
        if (!result) return
        // store to global storage to share among components
        dataStore.data.userlist = result
    } catch (error) {
        console.error("Error loading data on mount:", error);
    }
}

const changeFilter = async(list) =>{
    console.log("ll----------",gridApi.value)
    let draft_status = await gridApi.value.getColumnFilterInstance('draft_status')

    statusList.forEach(el => {
        draft_status[el.value].checked = false;
    });
    list.forEach(el=>{
        draft_status[el].checked = true;
    })
    await draft_status.filterChangedCallback()
    console.log('setFilter',draft_status)
}

// Load data on mounted
onMounted(async () => {
    await fetchData()
});

function statusColor(data){
    console.log(data.value)
    if(data.value==='承認済み')return {'background-color':'#dfffb0'};
    return {'background-color':'#ff9d9d'};
}

const itemCount = computed(()=>dataStore.flatData?.length)

defineExpose({
    fetchData,
    changeFilter,
    itemCount,
});

</script>

<template>
    <div>
        <ag-grid-pro
            ref="agGridHandler"
            v-if="data"
            :rowData="data"
            :columns="columns"
            height="calc(100vh - 310px)"
            @row-click="handleRowClick"
        />
    </div>
</template>

<style scoped>
.grid-container {
  height: calc(100vh - 190px) ;
  overflow-y: auto;
}

.grid-section {
  width: 100%;
  height: 100%;
}
</style>
