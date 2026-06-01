<template>
    <div>
      <ag-grid-vue
        class="ag-theme-alpine"
        style="width: 100%; height: 600px;"
        :gridOptions="gridOptions"
        :rowData="rowData"
        :columnDefs="columnDefs"
        @grid-ready="handleGridReady"
        @rowClicked="handleRowClicked"
        @first-data-rendered="sizeColumnsToFit"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  // import { defineProps, defineEmits } from 'vue';
  import { AgGridVue } from 'ag-grid-vue3';
  import 'ag-grid-community/styles/ag-grid.css';
  import 'ag-grid-community/styles/ag-theme-alpine.css';
  import CustomHeader from '@/utils/CustomHeader';
  
  const props = defineProps({
    apiUrl: {
      type: String,
      required: true
    },
    apiParams: {
      type: Object,
      default: () => ({})
    },
    piniaStore: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['gridReady', 'rowClicked']);
  
  const gridOptions = ref({
    defaultColDef: {
      flex: 1,
      resizable: true,
      sortable: true,
      filter: true,
      headerComponent: 'customHeader'
    },
    rowStyle: { color: 'darkslategrey', fontSize: '0.97em' },
    frameworkComponents: {
        customHeader: CustomHeader
    },
    onGridReady: handleGridReady,
    onCellContextMenu: handleContextMenu,
    components: {
      customHeader: CustomHeader
    },
    frameworkComponents: {
      customHeader: CustomHeader
    }
  });
  
  const columnDefs = ref([]);
  const rowData = ref([]);
  const gridApi = ref(null);
  const gridColumnApi = ref(null);
  
  const piniaStore = props.piniaStore;
  
  async function loadData() {
    try {
      const response = await fetch(props.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(props.apiParams)
      });

      const data = await response.json();
      rowData.value = data.rows;
      columnDefs.value = data.columns.map(col => ({
        ...col,
        headerComponent: 'customHeader',
        headerComponentParams: {
          columnName: col.headerName
        }
      }));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }
  
  function handleGridReady(params) {
    gridApi.value = params.api;
    gridColumnApi.value = params.columnApi;
    emit('gridReady', params);
  }
  
  function handleRowClicked(event) {
    emit('rowClicked', event);
    piniaStore.setSelectedRow(event.data);
  }
  
function exportCSV(type) {
    const params = {
        fileName: 'data_export.csv'
    };
    if (type === 'filtered') {
        params.onlySelected = true;
    }
    gridApi.value.exportDataAsCsv(params);
}
  
function updateColumns() {
    gridApi.value.setColumnDefs(columnDefs.value);
}
  
function handleContextMenu(params) {
    const contextMenu = [
      {
        name: 'Export as CSV',
        action: () => exportCSV('filtered')
      },
      {
        name: 'Show/Hide Columns',
        subMenu: columnDefs.value.map(col => ({
          name: col.headerName,
          action: () => {
            col.hide = !col.hide;
            updateColumns();
          },
          checked: !col.hide
        }))
      }
    ];
  
    params.api.showContextMenu(contextMenu, params.event);
}
  
function sizeColumnsToFit() {
    if (gridApi.value) {
        gridApi.value.sizeColumnsToFit();
    }
}
  
onMounted(() => {
loadData();
});
  
watch(() => props.apiParams, loadData);

</script>
  
<style scoped>
.ag-theme-alpine {
height: 100%;
}
</style>
  