<script setup>
import { ref, onMounted, } from 'vue';
import DataHandlingSlot from "@/components/slots/DataHandlingSlot.vue"; // The updated slot component
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridVue } from "ag-grid-vue3";
import { localeJP } from '@/utils/LocaleJP';
import { drafts } from "@/utils/CustomFilters";

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

const gridOptions = {
    rowStyle: { color: 'darkslategrey', 'font-size': '0.97em' },
    autoSizeStrategy: { type: 'fitCellContents' },
    // domLayout: 'autoHeight',
    alwaysShowVerticalScroll: true,
    // alwaysShowVerticalScroll: true,
    defaultColDef: {
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
    },
    localeText: localeJP,
    rowSelection: {
        checkboxes: false,
        mode: 'singleRow',
        enableClickSelection: true,
    },
    onRowDoubleClicked: function(event) {
        onRowSelected(event)
    }
};

const gridApi = ref(null);
const gridColumnApi = ref(null);
const mainSlot = ref(null);     // Reference to the slot component

// const dataStore = usestaffDetailStore();

// Grid ready event
function onGridReady(params) {
    gridApi.value = params.api;
    gridColumnApi.value = params.columnApi;
}

const flatData = ref([])
const orginalData = ref([])

/** for refresh/reload data */
const fetchData = async (p={}) => {
    if (!mainSlot.value?.fetchData) return

    try {
        const result = await mainSlot.value.fetchData();
        if (!result) return

        orginalData.value = result
        flatData.value =  result?.map(el => {
            if (el.content && typeof el.content === 'string') {
                el.content = JSON.parse(el.content);
            }
            let nel = { ...el }; // Spread operator to create a shallow copy
            nel = { ...nel, ...nel.content }; // Merge the object with the parsed "additinal"
            delete nel.content; // Fix typo and ensure property is deleted correctly
            delete nel.template_content; // Fix typo and ensure property is deleted correctly
            return nel;
        });
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

function onRowSelected(v) {
    if (!gridApi.value) return;

    const rows = gridApi.value.getSelectedRows()?.[0]; // Get the first selected row or undefined
    const selectedRows = orginalData.value?.find(el => el.userid === rows.userid);
    selectedRows.mode = 'edit'
    console.log()

    if (!selectedRows) return;
    
    if(selectedRows.draft_data)selectedRows.content = JSON.parse(selectedRows.draft_data)


    emit("row-selected", selectedRows)
};

function statusColor(data){
    console.log(data.value)
    if(data.value==='承認済み')return {'background-color':'#dfffb0'};
    return {'background-color':'#ff9d9d'};
}

const itemCount = computed(()=>dataStore.flatData?.length)

const sqlTags = {
    select: "load_user_master",
    insert: "save_user_update",
    update: "save_user_update",
    delete: "delete_user",
    upsert: "save_user_update",
    multiupsert: "save_user_update",
};

defineExpose({
    fetchData,
    changeFilter,
    itemCount,
});

</script>

<template>
    <div>
        <DataHandlingSlot
            ref="mainSlot"
            :data="flatData || []"
            :sqlTags="sqlTags"
            v-slot="{ data }"
        >
            <div class="grid-container">
                <ag-grid-vue
                    class="ag-theme-alpine grid-section"
                    :rowData="data"
                    :columnDefs="columns"
                    :gridOptions="gridOptions"
                    @grid-ready="onGridReady"
                    ></ag-grid-vue>
            </div>
        </DataHandlingSlot>
    </div>
</template>

<style scoped>
.grid-container {
  height: calc(50vh) ;
  overflow-y: auto;
}

.grid-section {
  width: 100%;
  height: 100%;
}
</style>
