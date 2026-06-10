<!-- AgGridPro.vue (ESLint fixed + v31+ friendly + reactive counts) -->
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useStorage } from '@vueuse/core'

import HeaderMenuButton from './HeaderMenuButton.vue'
import ColumnSettingsDialog from './ColumnSettingsDialog.vue'
import QuickFilterDialog from './QuickFilterDialog.vue'
// import DeleteRowButton from './DeleteRowButton.vue'
import { localeJP } from '@/components/helper/LocaleJP.js'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

const emit = defineEmits([
  'row-click',
  'grid-ready',
  'filtered-changed',
  'counts-changed',
  'delete-row',
])

const VISIBLE_COLUMNS = 'aggrid:columnVisibility'

const props = defineProps({
  rowData: { type: Array, default: () => [] },
  pinnedBottomRowData: { type: Array, default: () => [] },

  // optional external columns; if empty => dynamic by first row
  columns: { type: Array, default: () => [] },

  height: { type: [Number, String], default: 730 },
  localeText: { type: Object, default: () => localeJP },

  columnPrefKey: { type: String, default: 'aggrid:columnVisibility' },
  quickFilterKey: { type: String, default: 'aggrid-quick-filter' },

  // show operation (delete) column
  show_op: { type: Boolean, default: false },
  // opMode: { type: String, default: 'delete' },
})

const gridApi = ref(null)
const gridColumnApi = ref(null)

const columnDialogOpen = ref(false)
const quickFilterOpen = ref(false)

/** ---------------------------------------------------------
 * Storage keys
 * --------------------------------------------------------- */
const columnStorageKey = computed(() => props.columnPrefKey || VISIBLE_COLUMNS)
const quickFilterStorageKey = computed(() => props.quickFilterKey || 'aggrid-quick-filter')

/** ---------------------------------------------------------
 * Headers (dynamic fallback)
 * --------------------------------------------------------- */
const headers = computed(() => {
  if (Array.isArray(props.columns) && props.columns.length) return props.columns

  const first = props.rowData?.[0]
  if (!first || typeof first !== 'object') return []

  return Object.keys(first).map((key) => ({
    field: key,
    headerName: key,
  }))
})

/** ---------------------------------------------------------
 * Visible columns map: source of truth = localStorage (vueuse)
 * (only for "data columns" = headers fields; op col is excluded)
 * --------------------------------------------------------- */
const visibleColsStore = useStorage(columnStorageKey.value, {})

function normalizeVisibleMap(cols, map) {
  const fields = (cols || []).filter(c => c?.field).map(c => c.field)
  const next = {}
  for (const f of fields) next[f] = map?.[f] !== false // default true
  return next
}

const visibleMap = computed({
  get: () => (visibleColsStore.value && typeof visibleColsStore.value === 'object') ? visibleColsStore.value : {},
  set: (v) => { visibleColsStore.value = (v && typeof v === 'object') ? v : {} },
})

watch(
  () => headers.value,
  (cols) => {
    if (!cols?.length) return
    visibleMap.value = normalizeVisibleMap(cols, visibleMap.value)
  },
  { immediate: true, deep: true }
)

/** ---------------------------------------------------------
 * ✅ Reactive visible count from storage
 * --------------------------------------------------------- */
const selectedVisibleColumnCount = computed(() => {
  const m = visibleMap.value || {}
  return Object.keys(m).filter(k => m[k] !== false).length
})
function getSelectedVisibleColumnCount() {
  return selectedVisibleColumnCount.value
}

/** ---------------------------------------------------------
 * Column visibility apply (v31+ friendly)
 * - IMPORTANT: always include __op__ when show_op=true
 * --------------------------------------------------------- */
function buildColumnStateFromMap(cols, map) {
  const fields = (cols || []).filter(c => c?.field).map(c => c.field)

  // ✅ keep op column always present + always visible
  if (props.show_op) fields.unshift('__op__')

  return fields.map(f => ({
    colId: f,
    hide: f === '__op__' ? false : (map?.[f] === false),
  }))
}

function applyColumnVisibility(map) {
  // save to storage (only header fields)
  visibleMap.value = normalizeVisibleMap(headers.value, map)

  const api = gridApi.value
  const colApi = gridColumnApi.value
  if (!api) return

  const state = buildColumnStateFromMap(headers.value, visibleMap.value)

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
 * Operation column (delete button)
 * --------------------------------------------------------- */
const opColDef = computed(() => ({
  headerName: '',
  colId: '__op__',
  width: 46,
  pinned: 'left',
  lockPinned: true,
  lockPosition: 'left',
  suppressMovable: true,
  suppressNavigable: true,
  suppressColumnsToolPanel: true, // ✅ hide from tool panels

  headerComponent: HeaderMenuButton,
  suppressHeaderMenuButton: true,

  // cellRenderer: DeleteRowButton,

  sortable: false,
  filter: false,
  resizable: false,
}))

/** ---------------------------------------------------------
 * Column defs
 * --------------------------------------------------------- */
const processedColumnDefs = computed(() => {
  const baseCols = (headers.value || []).map((col) => ({
    ...col,
    valueGetter: col.valueGetter
      ? col.valueGetter
      : (p) => (col.field ? (p.data?.[col.field] ?? '') : ''),
  }))

  return props.show_op
    ? [opColDef.value, ...baseCols]
    : baseCols
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
  const api = gridApi.value
  if (!api) return

  if (typeof api.autoSizeAllColumns === 'function') {
    api.autoSizeAllColumns(false)
    return
  }

  if (typeof api.getAllDisplayedColumns === 'function' && typeof api.autoSizeColumns === 'function') {
    const cols = api.getAllDisplayedColumns() || []
    const ids = cols.map(c => c.getColId())
    if (ids.length) api.autoSizeColumns(ids, false)
  }
}

/** ---------------------------------------------------------
 * Counts
 * --------------------------------------------------------- */
const dataRowCount = computed(() => props.rowData?.length || 0)
const columnCount = computed(() => (headers.value || []).filter(c => c?.field).length)

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
  const api = gridApi.value
  if (!api) {
    visibleColumnCount.value = 0
    return
  }

  if (typeof api.getAllDisplayedColumns === 'function') {
    visibleColumnCount.value = (api.getAllDisplayedColumns() || []).length
    return
  }

  if (typeof api.getAllGridColumns === 'function') {
    const cols = api.getAllGridColumns() || []
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
  rowSelection: 'multiple',
  suppressRowClickSelection: false,
  defaultColDef: { resizable: true, sortable: true, filter: true },
  localeText: props.localeText,
  context: {
    openColumnSettings: () => { columnDialogOpen.value = true },
    openQuickFilter: () => { quickFilterOpen.value = true },

    // called from DeleteRowButton (cellRenderer)
    requestDelete: (p) => {
      if (!props.show_op) return
      emit('delete-row', p.data)
      // optionally:
      // gridApi.value?.applyTransaction({ remove: [p.data] })
    },
  },
}))

/** ---------------------------------------------------------
 * Grid lifecycle
 * --------------------------------------------------------- */
function onGridReady(params) {
  gridApi.value = params.api
  gridColumnApi.value = params.columnApi

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
  async (v) => {
    await nextTick()
    refreshCounts()
    if (v?.length) refreshLayout('auto')
  },
  { deep: true }
)

/** ---------------------------------------------------------
 * Layout refresh
 * --------------------------------------------------------- */
function refreshLayout(mode = 'fit') {
  const api = gridApi.value
  if (!api) return

  if (typeof api.doLayout === 'function') api.doLayout()

  if (mode === 'fit' && typeof api.sizeColumnsToFit === 'function') {
    const w = api?.gridBodyCtrl?.eBodyViewport?.clientWidth
    if (w && w > 50) api.sizeColumnsToFit()
    return
  }

  if (mode === 'auto') autoSizeAllColumns()
}

/** ---------------------------------------------------------
 * getXXX functions
 * --------------------------------------------------------- */
function getVisibleColumns() {
  const api = gridApi.value
  if (!api) return []

  if (typeof api.getAllDisplayedColumns === 'function') {
    return api.getAllDisplayedColumns() || []
  }

  if (typeof api.getAllGridColumns === 'function') {
    return (api.getAllGridColumns() || []).filter(c => c?.isVisible?.())
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

  getVisibleColumns,
  getVisibleColumnFields,
  getVisibleColumnCount,
  getSelectedRows,
  getSelectedRowCount,
  clearSelection,

  dataRowCount,
  selectedRowCount,
  columnCount,
  visibleColumnCount,

  selectedVisibleColumnCount,
  getSelectedVisibleColumnCount,
  refreshLayout,
})

const autoSizeStrategy = ref({ type: 'fitGridWidth' })
</script>

<template>
  <!-- {{ headers }} -->
  <ag-grid-vue
    class="ag-theme-alpine"
    :style="{ width: '100%', height: typeof height === 'number' ? height + 'px' : height }"
    :grid-options="gridOptions"
    :columnDefs="processedColumnDefs"
    :rowData="rowData"
    :pinnedBottomRowData="pinnedBottomRowData"
    @grid-ready="onGridReady"
    @row-clicked="onRowClicked"
    :autoSizeStrategy="autoSizeStrategy"
  />

  <QuickFilterDialog
    v-model:open="quickFilterOpen"
    :value="quickFilterText"
    @apply="applyQuickFilter"
    @clear="clearQuickFilter"
  />

  <ColumnSettingsDialog
    v-model:open="columnDialogOpen"
    :columns="headers"
    :visibleMap="visibleMap"
    @apply="applyColumnVisibility"
    :storageKey="VISIBLE_COLUMNS"
  />
</template>
