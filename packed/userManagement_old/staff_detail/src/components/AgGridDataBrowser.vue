<script setup>
import { ref, computed, watch, } from 'vue';
import { AgGridVue } from "ag-grid-vue3";
import { useAgGridStore } from '@/stores/AgGridStore'
import { localeJP } from '@/stores/LocaleJP'

const aggridStore = useAgGridStore()
const MODULE_ID = 'AgGridDataBrowser'
console.log(MODULE_ID)

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: () => ([])
    },
    columns: {
        type: Array,
        required: false,
        default: null,
    },
    show_csv_dnld: {
        type: Boolean,
        required: false,
        default: true,
    },
    download_file: {
        type: String,
        required: false,
        default: null,
    },
    filters: {
        type: Array,
        required: false,
        default: null,
    }
})

const gridApi = ref(null);
const gridColumnApi = ref(null);
const doResize = ref(true);

function captureFilteredData() {
    const rowData = [];
    gridApi.value.forEachNodeAfterFilter((node) => {
        rowData.push(node.data);
    });
    aggridStore.params.FilteredData = rowData;
    aggridStore.params.filteredCount = aggridStore.params.FilteredData?.length;
}

function onGridReady(params) {
    console.log()
    gridApi.value = params.api;
    gridColumnApi.value = params.columnApi;

    gridApi.value.addEventListener('filterChanged', () => {
        captureFilteredData()
        // aggridStore.params.FilteredData = [];
        // gridApi.value.forEachNodeAfterFilter((node) => {
        //     aggridStore.params.FilteredData.push(node.data);
        // });

        // aggridStore.params.filteredCount = aggridStore.params.FilteredData?.length;
    });

    autoSizeAllColumns();
}

const gridOptions = {
    rowStyle: {"color": "darkslategrey", "font-size": "0.97em" },
    autoSizeStrategy: {type: 'fitCellContents'},
    defaultColDef: {
        flex: 1,
        resizable: true,
        sortable: true,
        filter: true,
    },
    localeText: localeJP
}



watch(() => props.data, () => {
    console.log("watch--0---", gridApi.value )
    if( !gridApi.value ) return

    aggridStore.params.FilteredData = [];

    gridApi.value.forEachNodeAfterFilter((node) => {
        aggridStore.params.FilteredData.push(node.data);
    });

    aggridStore.params.filteredCount = aggridStore.params.FilteredData?.length;
    
    doResize.value = false;
}, {deep: true, immediate: true})

// Process columns to add valueGetter
const processedColumns = computed(() => {
    if (props.columns) {
        return props.columns.map(col => ({
            ...col,
            valueGetter: params => params.data[col.field] 
        }));
    }
    return [];
});

defineExpose({
    gridApi,
    gridColumnApi,
})

const rowDataUpdated = () => {
    autoSizeAllColumns();
}

function autoSizeAllColumns() {


    if (!gridApi.value) {
        return;
    }
    if(doResize.value) return;
    

    gridApi.value.sizeColumnsToFit({
        defaultMinWidth: 100
    });
    doResize.value = true;
    // // Check if getAllColumns exists
    // if (typeof gridColumnApi.value.getAllColumns === 'function') {
    //     const allColumnIds = [];
    //     gridColumnApi.value.getAllColumns().forEach((column) => {
    //         allColumnIds.push(column.getId());
    //     });
    //     gridColumnApi.value.autoSizeColumns(allColumnIds);
    // } else if (typeof gridColumnApi.value.getAllGridColumns === 'function') {
    //     // Use getAllGridColumns if getAllColumns is not available
    //     const allColumnIds = [];
    //     gridColumnApi.value.getAllGridColumns().forEach((column) => {
    //         allColumnIds.push(column.getId());
    //     });
    //     gridColumnApi.value.autoSizeColumns(allColumnIds);
    // } else {
    //     console.error("The grid API does not have getAllColumns or getAllGridColumns methods.");
    // }
}

</script>

<template>
    <div v-if="props.columns" >
        <ag-grid-vue
            v-if="props.data"
            style="height: 80vh;"
            class="ag-theme-alpine grid-section ag-grid"
            :columnDefs="processedColumns"
            :grid-options="gridOptions"
            :rowData="props.data"
            :pagination="false"
            @stateUpdated="rowDataUpdated"
            @grid-ready="onGridReady">
        </ag-grid-vue>
        <div v-else style="">データはありません。</div>
    </div>
</template>

<style scoped>
.ag-grid {
    width: 100%; 
    height: var(--aggrid_height)
}

</style>
