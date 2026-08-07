<script setup>
import { ref, computed, onMounted } from 'vue'

import { useDataStore } from '@/stores/DataStore'
import AgGridPro from '@/components/helper/grid/AgGridPro.vue'
import RetirementRequestDialog from '@/components/request/RetirementRequestDialog.vue'
import { parseAndFlattenJsonbFields } from '@/composables/utilFactory'
import { ATTACH_STATUS_LABELS } from '@/composables/useColumns'

const dataStore = useDataStore()

const rows = ref([])
const loading = ref(false)

// ---- フィルター条件 ----
const filters = ref({
    department_id: null,
    parent_department_id: null,
    employee_category: null,
    apply_type: null,       // self_applied / proxy_applied
    attach_status: null,    // not_attached / attached
    enrollment: '在職',
    approved_from: '',
    approved_to: '',
    resignation_from: '',
    resignation_to: '',
    keyword: '',            // ID・名前
})

const applyTypeItems = [
    { title: '本人申請', value: 'self_applied' },
    { title: '代理申請', value: 'proxy_applied' },
]

const attachStatusItems = Object.entries(ATTACH_STATUS_LABELS)
    .map(([value, title]) => ({ title, value }))

const enrollmentItems = ['在職', '退職']

const uniqueItems = (getId, getName) => {
    const seen = new Map()
    for (const r of rows.value) {
        const id = getId(r)
        if (id && !seen.has(id)) {
            seen.set(id, { title: getName(r) || id, value: id })
        }
    }
    return [...seen.values()]
}

const departmentItems = computed(() =>
    uniqueItems(r => r.department_id, r => r.department_name)
)

const parentDepartmentItems = computed(() =>
    uniqueItems(r => r.parent_department_id, r => r.parent_department_name)
)

const employeeCategoryItems = computed(() =>
    uniqueItems(r => r.employee_category, r => r.employee_category)
)

// ---- クライアント側絞り込み
const inRange = (value, from, to) => {
    if (!value) return !from && !to
    const d = String(value).slice(0, 10)
    if (from && d < from) return false
    if (to && d > to) return false
    return true
}

const filteredRows = computed(() => {
    const f = filters.value

    return rows.value.filter((r) => {
        if (f.department_id && r.department_id !== f.department_id) return false
        if (f.parent_department_id && r.parent_department_id !== f.parent_department_id) return false
        if (f.employee_category && r.employee_category !== f.employee_category) return false
        if (f.apply_type && r.status !== f.apply_type) return false
        if (f.attach_status && r.attach_status !== f.attach_status) return false
        if (f.enrollment && r.enrollment && r.enrollment !== f.enrollment) return false
        if ((f.approved_from || f.approved_to) &&
            !inRange(r.approved_at, f.approved_from, f.approved_to)) return false
        if ((f.resignation_from || f.resignation_to) &&
            !inRange(r.resignation_date, f.resignation_from, f.resignation_to)) return false

        if (f.keyword) {
            const kw = f.keyword.trim()
            const target = `${r.staff_code ?? ''} ${r.staff_name ?? ''}`
            if (!target.includes(kw)) return false
        }

        return true
    })
})

const loadData = async () => {
    loading.value = true

    try {
        const val = await dataStore.get_retirement_application_list({
            ...filters.value,
        })

        rows.value = parseAndFlattenJsonbFields(val || [], ['data_jsonb'])
    }
    catch (error) {
        console.error('Failed to load retirement application list:', error)
    }
    finally {
        loading.value = false
    }
}

onMounted(async () => {
    await loadData()
})

const handleSearch = async () => {
    await loadData()
}

const handleRowClick = (event) => {
    dataStore.rowClicked(event)
}

const requestDialogOpen = ref(false)
const requestDialogMode = ref('confirm')   // 'process' | 'confirm'
const selectedRow = ref(null)

const openRequestDialog = (mode) => (p) => {
    selectedRow.value = p?.data || null
    requestDialogMode.value = mode
    requestDialogOpen.value = true
}

const gridColumns = computed(() => {
    return dataStore.buildColumnsDefine({
        onProcessClicked: openRequestDialog('process'),
        onConfirmClicked: openRequestDialog('confirm'),
    })
})
</script>

<template>
  <v-card class="card_box">
    <v-card-title>
      <div class="d-flex align-center flex-wrap ga-3">
        <h4>
          退職願承認（登録件数：{{ filteredRows.length }}人）
        </h4>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="rm-filter-bar">
        <v-select
          v-model="filters.department_id"
          :items="departmentItems"
          label="部署/事業所："
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--select"
        />

        <v-select
          v-model="filters.parent_department_id"
          :items="parentDepartmentItems"
          label="親部署/支店"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--select"
        />

        <v-select
          v-model="filters.employee_category"
          :items="employeeCategoryItems"
          label="社員区分："
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--select"
        />

        <v-select
          v-model="filters.apply_type"
          :items="applyTypeItems"
          label="本人申請"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--select"
        />

        <v-select
          v-model="filters.attach_status"
          :items="attachStatusItems"
          label="資料添付状況"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--select"
        />

        <v-select
          v-model="filters.enrollment"
          :items="enrollmentItems"
          label="在職"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--select-narrow"
        />

        <div class="rm-filter-range">
          <span class="rm-filter-label">承認日</span>
          <v-text-field
            v-model="filters.approved_from"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            class="rm-filter--date"
          />
          <span>～</span>
          <v-text-field
            v-model="filters.approved_to"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            class="rm-filter--date"
          />
        </div>

        <div class="rm-filter-range">
          <span class="rm-filter-label">退職日</span>
          <v-text-field
            v-model="filters.resignation_from"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            class="rm-filter--date"
          />
          <span>～</span>
          <v-text-field
            v-model="filters.resignation_to"
            type="date"
            density="compact"
            variant="outlined"
            hide-details
            class="rm-filter--date"
          />
        </div>

        <v-text-field
          v-model="filters.keyword"
          label="ID 名前"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="rm-filter rm-filter--keyword"
          @keyup.enter="handleSearch"
        />

        <v-btn
          color="primary"
          :loading="loading"
          @click="handleSearch"
        >
          検索
        </v-btn>
      </div>

      <AgGridPro
        :rowData="filteredRows"
        :columns="gridColumns"
        height="calc(100vh - 280px)"
        columnPrefKey="retirement:columnVisibility"
        quickFilterKey="retirement:quick-filter"
        @row-click="handleRowClick"
      />

      <RetirementRequestDialog
        v-model="requestDialogOpen"
        :row="selectedRow"
        :mode="requestDialogMode"
        @saved="loadData"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 8px 20px 0 0 !important;
}

.rm-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.rm-filter--select {
  min-width: 11em;
  max-width: 13em;
}

.rm-filter--select-narrow {
  min-width: 7em;
  max-width: 8em;
}

.rm-filter--date {
  width: 11em;
}

.rm-filter--keyword {
  min-width: 14em;
  max-width: 18em;
}

.rm-filter-range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rm-filter-label {
  padding: 6px 8px;
  background: #eceff1;
  border-radius: 4px;
  font-size: 0.85em;
  white-space: nowrap;
}
</style>

<style>
.rm-btn {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.9em;
  line-height: 1.4;
}

.rm-btn--primary {
  background: #1976d2;
  color: #fff;
}

.rm-btn--primary:hover {
  background: #1565c0;
}

.rm-btn--secondary {
  background: #2e7d32;
  color: #fff;
}

.rm-btn--secondary:hover {
  background: #1b5e20;
}

.rm-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.9em;
  line-height: 1.4;
}

.rm-badge--warn {
  background: #f0ad4e;
  color: #fff;
}

.rm-badge--ok {
  background: #4caf50;
  color: #fff;
}
</style>
