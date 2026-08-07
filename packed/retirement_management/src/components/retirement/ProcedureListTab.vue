<script setup>
import { ref, computed, onMounted } from 'vue'
import AgGridPro from '@/components/helper/grid/AgGridPro.vue'
import TaskChecklistDialog from '@/components/retirement/TaskChecklistDialog.vue'
import { buildProcedureColumns } from '@/composables/useColumns'
import { getMockProcedureList } from '@/stores/mock/retirementProcedureMock'

const props = defineProps({
    scope: { type: String, required: true },        // 'branch' | 'hr'
})

const rows = ref([])
const loading = ref(false)

const loadData = async () => {
    loading.value = true

    try {
        rows.value = getMockProcedureList(props.scope)
    }
    finally {
        loading.value = false
    }
}

onMounted(loadData)

// チェックリスト dialog
const dialogOpen = ref(false)
const selectedRow = ref(null)

const openChecklist = (row) => {
    selectedRow.value = row
    dialogOpen.value = true
}

const gridColumns = computed(() =>
    buildProcedureColumns({
        onProcedureClicked: (p) => openChecklist(p.data),
    })
)
</script>

<template>
  <div>
    <AgGridPro
      :rowData="rows"
      :columns="gridColumns"
      height="calc(100vh - 340px)"
      :columnPrefKey="`retirement:${scope}:columnVisibility`"
      :quickFilterKey="`retirement:${scope}:quick-filter`"
    />

    <TaskChecklistDialog
      v-model="dialogOpen"
      :row="selectedRow"
      :scope="scope"
      @saved="loadData"
    />
  </div>
</template>

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
