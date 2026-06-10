<!-- AgGridPro.vue (ESLint fixed + v31+ friendly + reactive counts) -->
<script setup>
import { ref, computed, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useStorage } from '@vueuse/core'

import HeaderMenuButton from './HeaderMenuButton.vue'
import ColumnSettingsDialog from './ColumnSettingsDialog.vue'
import QuickFilterDialog from './QuickFilterDialog.vue'
import { localeJP } from './LocaleJP.js'

// import 'ag-grid-community/styles/ag-grid.css'
// import 'ag-grid-community/styles/ag-theme-alpine.css'

import {
  themeQuartz,
  colorSchemeDark,
  colorSchemeLight,
  iconSetAlpine,  
} from "ag-grid-community";

const emit = defineEmits([
  'row-click',
  'grid-ready',
  'filtered-changed',
  'counts-changed',
])

// keep as constant for expose / dialog storageKey
const VISIBLE_COLUMNS = 'aggrid:columnVisibility'

const props = defineProps({
  rowData: { type: Array, default: () => [] },
  pinnedBottomRowData: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  height: { type: [Number, String], default: 730 },
  localeText: { type: Object, default: () => localeJP },

  // ✅ MUST be literal (avoid vue/valid-define-props error)
  columnPrefKey: { type: String, default: 'aggrid:columnVisibility' },
  quickFilterKey: { type: String, default: 'aggrid-quick-filter' },
  mytheme: {
    type: String,
    default: "dark",
  },
})

const gridApi = ref(null)
const gridColumnApi = ref(null)

const columnDialogOpen = ref(false)
const quickFilterOpen = ref(false)

const selectTheme = (theme, color, icon) => {
  return theme.withPart(color).withPart(icon);
};

const themes = {
  dark: selectTheme(themeQuartz, colorSchemeDark, iconSetAlpine ),
  light: selectTheme(themeQuartz, colorSchemeLight, iconSetAlpine ),
}

/** ---------------------------------------------------------
 * Storage keys
 * --------------------------------------------------------- */
const columnStorageKey = computed(() => props.columnPrefKey || VISIBLE_COLUMNS)
const quickFilterStorageKey = computed(() => props.quickFilterKey || 'aggrid-quick-filter')

/** ---------------------------------------------------------
 * Visible columns map: source of truth = localStorage (vueuse)
 * --------------------------------------------------------- */
const visibleColsStore = useStorage(columnStorageKey.value, {})

function normalizeVisibleMap(cols, map) {
  const fields = (cols || []).filter(c => c?.field).map(c => c.field)
  const next = {}
  for (const f of fields) next[f] = map?.[f] !== false // default true
  return next
}

// keep a computed alias for dialog prop usage
const visibleMap = computed({
  get: () => (visibleColsStore.value && typeof visibleColsStore.value === 'object') ? visibleColsStore.value : {},
  set: (v) => { visibleColsStore.value = (v && typeof v === 'object') ? v : {} },
})

watch(
  () => props.columns,
  (cols) => {
    if (!cols?.length) return
    visibleMap.value = normalizeVisibleMap(cols, visibleMap.value)
  },
  { immediate: true, deep: true }
)

/** ---------------------------------------------------------
 * ✅ Reactive visible count from storage (not false => visible)
 * --------------------------------------------------------- */
const selectedVisibleColumnCount = computed(() => {
  const m = visibleMap.value || {}
  return Object.keys(m).filter(k => m[k] !== false).length
})

function getSelectedVisibleColumnCount() {
  return selectedVisibleColumnCount.value
}

/** ---------------------------------------------------------
 * Apply column visibility (v31+ friendly)
 * - Prefer api.applyColumnState
 * - Fallback to columnApi.applyColumnState
 * - Fallback to columnApi.setColumnsVisible
 * --------------------------------------------------------- */
function buildColumnStateFromMap(cols, map) {
  const fields = (cols || []).filter(c => c?.field).map(c => c.field)
  return fields.map(f => ({ colId: f, hide: map?.[f] === false }))
}

function applyColumnVisibility(map) {
  // save to storage (plain object only)
  visibleMap.value = normalizeVisibleMap(props.columns, map)

  const api = gridApi.value
  const colApi = gridColumnApi.value
  if (!api) return

  const state = buildColumnStateFromMap(props.columns, visibleMap.value)

  if (typeof api.applyColumnState === 'function') {
    api.applyColumnState({ state, applyOrder: false })
  } else if (colApi?.applyColumnState && typeof colApi.applyColumnState === 'function') {
    colApi.applyColumnState({ state, applyOrder: false })
  } else if (colApi?.setColumnsVisible && typeof colApi.setColumnsVisible === 'function') {
    const show = state.filter(s => !s.hide).map(s => s.colId)
    const hide = state.filter(s => s.hide).map(s => s.colId)
    colApi.setColumnsVisible(show, true)
    colApi.setColumnsVisible(hide, false)
  }

  setTimeout(() => {
    refreshVisibleColumnCount()
    emitCounts()
    autoSizeAllColumns()
  }, 0)
}

/** ---------------------------------------------------------
 * Quick Filter (vueuse storage)
 * --------------------------------------------------------- */
const quickFilterText = useStorage(quickFilterStorageKey.value, '')

function applyQuickFilter(text) {
  quickFilterText.value = text || ''

  const api = gridApi.value
  if (!api) return

  if (typeof api.setGridOption === 'function') {
    api.setGridOption('quickFilterText', quickFilterText.value)
  } else if (typeof api.setQuickFilter === 'function') {
    api.setQuickFilter(quickFilterText.value)
  }

  setTimeout(() => captureFilteredData(), 0)
}

function clearQuickFilter() {
  applyQuickFilter('')
}

/** ---------------------------------------------------------
 * Header Menu Column
 * --------------------------------------------------------- */
const menuColDef = computed(() => ({
  headerName: '',
  colId: '__menu__',
  width: 46,
  pinned: 'left',
  headerComponent: HeaderMenuButton,
  suppressHeaderMenuButton: true,
  sortable: false,
  filter: false,
  resizable: false,
  valueFormatter: () => '',
}))

const processedColumnDefs = computed(() => {
  const cols = (props.columns || []).map(col => ({
    ...col,
    valueGetter: col.valueGetter
      ? col.valueGetter
      : (p) => (col.field ? (p.data?.[col.field] ?? '') : ''),
  }))
  return [menuColDef.value, ...cols]
})

/** ---------------------------------------------------------
 * Filtered capture
 * --------------------------------------------------------- */
function captureFilteredData() {
  const api = gridApi.value
  if (!api) return
  const list = []
  api.forEachNodeAfterFilter((node) => list.push(node.data))
  emit('filtered-changed', list)
}

/** ---------------------------------------------------------
 * Autosize (v31+ friendly)
 * --------------------------------------------------------- */
function autoSizeAllColumns() {
  const colApi = gridApi.value
  if (!colApi) return

  if (typeof colApi.autoSizeAllColumns === 'function') {
    colApi.autoSizeAllColumns(false)
    return
  }

  if (typeof colApi.getAllDisplayedColumns === 'function' && typeof colApi.autoSizeColumns === 'function') {
    const cols = colApi.getAllDisplayedColumns() || []
    const ids = cols.map(c => c.getColId())
    if (ids.length) colApi.autoSizeColumns(ids, false)
  }
}

/** ---------------------------------------------------------
 * ✅ Reactive counts requested
 * --------------------------------------------------------- */
const dataRowCount = computed(() => props.rowData?.length || 0)
const columnCount = computed(() => (props.columns || []).filter(c => c?.field).length)

const selectedRowCount = ref(0)
const visibleColumnCount = ref(0)

function refreshSelectedRowCount() {
  const api = gridApi.value
  if (!api?.getSelectedRows) {
    selectedRowCount.value = 0
    return
  }
  const rows = api.getSelectedRows()
  selectedRowCount.value = Array.isArray(rows) ? rows.length : 0
}

function refreshVisibleColumnCount() {
  const colApi = gridApi.value
  if (!colApi) {
    visibleColumnCount.value = 0
    return
  }

  if (typeof colApi.getAllDisplayedColumns === 'function') {
    visibleColumnCount.value = (colApi.getAllDisplayedColumns() || []).length
    return
  }

  if (typeof colApi.getAllGridColumns === 'function') {
    const cols = colApi.getAllGridColumns() || []
    visibleColumnCount.value = cols.filter(c => c?.isVisible?.()).length
    return
  }

  visibleColumnCount.value = 0
}

function emitCounts() {
  emit('counts-changed', {
    dataRowCount: dataRowCount.value,
    selectedRowCount: selectedRowCount.value,
    columnCount: columnCount.value,
    visibleColumnCount: visibleColumnCount.value,
  })
}

function refreshCounts() {
  refreshSelectedRowCount()
  refreshVisibleColumnCount()
  emitCounts()
}

/** ---------------------------------------------------------
 * Grid options
 * --------------------------------------------------------- */
const gridOptions = computed(() => ({
  rowSelection: {
    mode: 'multiRow',
    enableClickSelection: false,
  },
  defaultColDef: { resizable: true, sortable: true, filter: true },
  localeText: props.localeText,
  getRowStyle: params => {
    if (params.data?.payroll_closed) {
      return {
        backgroundColor: 'rgba(144, 238, 144, 0.5)'
      }
    }
    return null
  },
  // rowClassRules: {
  //   'row-payroll-closed': params => params.data?.payroll_closed === true
  // },
  context: {
    openColumnSettings: () => { columnDialogOpen.value = true },
    openQuickFilter: () => { quickFilterOpen.value = true },
  },
}))

function onGridReady(params) {
  gridApi.value = params.api
  gridColumnApi.value = params.columnApi

  // listeners
  params.api.addEventListener('filterChanged', () => {
    captureFilteredData()
    refreshCounts()
  })

  params.api.addEventListener('selectionChanged', () => {
    refreshSelectedRowCount()
    emitCounts()
  })

  params.api.addEventListener('columnVisible', () => {
    refreshVisibleColumnCount()
    emitCounts()
  })

  // apply persisted settings
  applyColumnVisibility(visibleMap.value)
  applyQuickFilter(quickFilterText.value)

  emit('grid-ready', { api: gridApi.value, columnApi: gridColumnApi.value })

  setTimeout(() => {
    autoSizeAllColumns()
    refreshCounts()
  }, 0)
}

function onRowClicked(event) {
  emit('row-click', event)
}

watch(
  () => props.rowData,
  () => setTimeout(() => refreshCounts(), 0),
  { deep: true }
)

/** ---------------------------------------------------------
 * getXXX functions (keep)
 * --------------------------------------------------------- */
function getVisibleColumns() {
  const colApi = gridApi.value
  if (!colApi) return []

  if (typeof colApi.getAllDisplayedColumns === 'function') {
    return colApi.getAllDisplayedColumns() || []
  }

  if (typeof colApi.getAllGridColumns === 'function') {
    return (colApi.getAllGridColumns() || []).filter(c => c?.isVisible?.())
  }

  return []
}

function getVisibleColumnFields() {
  return getVisibleColumns().map(col => col.getColId())
}

function getVisibleColumnCount() {
  return getVisibleColumns().length
}

function getSelectedRows() {
  const api = gridApi.value
  if (!api?.getSelectedRows) return []
  return api.getSelectedRows()
}

function getSelectedRowCount() {
  const api = gridApi.value
  if (!api?.getSelectedRows) return 0
  return (api.getSelectedRows() || []).length
}

function clearSelection() {
  gridApi.value?.deselectAll()
  refreshSelectedRowCount()
  emitCounts()
}

defineExpose({
  gridApi,
  gridColumnApi,
  VISIBLE_COLUMNS,

  openQuickFilter: () => (quickFilterOpen.value = true),
  openColumnSettings: () => (columnDialogOpen.value = true),

  // getXXX functions
  getVisibleColumns,
  getVisibleColumnFields,
  getVisibleColumnCount,
  getSelectedRows,
  getSelectedRowCount,
  clearSelection,

  // ✅ reactive items requested
  dataRowCount,
  selectedRowCount,
  columnCount,
  visibleColumnCount,

  // existing: from storage
  selectedVisibleColumnCount,
  getSelectedVisibleColumnCount,
})
</script>

<template>
  <ag-grid-vue
     :theme="themes[props.mytheme]"
    :style="{ width: '100%', height: typeof height === 'number' ? height + 'px' : height }"
    :grid-options="gridOptions"
    :columnDefs="processedColumnDefs"
    :rowData="rowData"
    :pinnedBottomRowData="pinnedBottomRowData"
    @grid-ready="onGridReady"
    @row-clicked="onRowClicked"
    
  />

  <QuickFilterDialog
    v-model:open="quickFilterOpen"
    :value="quickFilterText"
    @apply="applyQuickFilter"
    @clear="clearQuickFilter"
  />

  <ColumnSettingsDialog
    v-model:open="columnDialogOpen"
    :columns="columns"
    :visibleMap="visibleMap"
    @apply="applyColumnVisibility"
    :storageKey="VISIBLE_COLUMNS"
  />
</template>
