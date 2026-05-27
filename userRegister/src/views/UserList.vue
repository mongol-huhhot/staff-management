<script setup>
import { ref, onMounted, } from 'vue';
import DataHandlingSlot from "@/components/slots/DataHandlingSlot.vue"; // The updated slot component
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridVue } from "ag-grid-vue3";
import { localeJP } from '@/utils/LocaleJP';
import { useDataStore } from "@/stores/DataStore";

const componentName = import.meta.url
  .split('/') // Split the URL by '/'
  .pop() // Get the last part (file name with extension and query parameters)
  .split('?')[0] // Remove query parameters (everything after '?')
  .replace('.vue', ''); // Remove the .vue extension

console.log(componentName); // Outputs the file name without the .vue extension

const columns = [
    { field: 'userid', headerName: 'ユーザID' },
    { field: 'email', headerName: 'メール' },
    { field: 'fullName', headerName: 'お名前' },
    { field: 'department_name', headerName: '所属部門' },
    // { field: 'gender', headerName: '性別' },
    { field: 'address', headerName: '住所' },
];

const emit = defineEmits(["row-selected"]); // Define the event in the parent

const gridOptions = {
    rowStyle: { color: 'darkslategrey', 'font-size': '0.97em' },
    autoSizeStrategy: { type: 'fitCellContents' },
    domLayout: 'autoHeight',
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
};

const gridApi = ref(null);
const gridColumnApi = ref(null);
const mainSlot = ref(null);     // Reference to the slot component

const dataStore = useDataStore();

// Grid ready event
function onGridReady(params) {
    gridApi.value = params.api;
    gridColumnApi.value = params.columnApi;
}

/** for refresh/reload data */
const fetchData = async (p={}) => {
    if (!mainSlot.value?.fetchData) return

    try {
        const result = await mainSlot.value.fetchData();
        if (!result) return
        // store to global storage to share among components
        dataStore.data.userlist = result
    } catch (error) {
        console.error("Error loading data on mount:", error);
    }
}

// Load data on mounted
onMounted(async () => {
    await fetchData()
});

const onRowSelected = (v) => {
    if (!gridApi.value) return;

    const rows = gridApi.value.getSelectedRows()?.[0]; // Get the first selected row or undefined
    const selectedRows = dataStore.data?.userlist?.find(el => el.userid === rows.userid);
    console.log()

    if (!selectedRows) return;


    emit("row-selected", selectedRows)
};

defineExpose({
    fetchData,
});

</script>

<template>
    <div>
        <DataHandlingSlot
            ref="mainSlot"
            :data="dataStore.flatData || []"
            :sqlTags="dataStore.sqlTags"
            v-slot="{ data }"
        >
            <ag-grid-vue
                class="ag-theme-alpine grid-section"
                :rowData="data"
                :columnDefs="columns"
                :gridOptions="gridOptions"
                @grid-ready="onGridReady"
                @rowSelected="onRowSelected"
            ></ag-grid-vue>
        </DataHandlingSlot>
    </div>
</template>
