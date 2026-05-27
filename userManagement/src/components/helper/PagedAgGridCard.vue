<!-- PagedAgGridCard.vue -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import AgGridPro from '@/components/helper/AgGridPro.vue'

async function fetchPageFromDb({ page, pageSize, extraParams }) {
  console.log('Fetching page from DB with params:', {
    page,
    pageSize,
    extraParams,
  })

  return {
    rows: [],
    total: 0,
    columns: [],
  }
}

const props = defineProps({
  title: { type: String, default: 'List' },
  columns: { type: Array, default: () => [] },
  rowData: { type: Array, default: () => [] },

  initialPage: { type: Number, default: 1 },
  initialPageSize: { type: Number, default: 50 },
  pageSizeOptions: { type: Array, default: () => [20, 50, 100, 200] },

  queryParams: { type: Object, default: () => ({}) },

  gridHeight: { type: [Number, String], default: 'calc(100% - 0px)' },
  show_op: { type: Boolean, default: false },
  opMode: { type: String, default: 'delete' },

  autoLoad: { type: Boolean, default: true },
})

const emit = defineEmits([
  'loaded',
  'row-click',
  'delete-row',
])

const loading = ref(false)
const rows = ref([])
const total = ref(0)

const page = ref(props.initialPage)
const pageSize = ref(props.initialPageSize)

const pageCount = computed(() => {
  return Math.max(
    1,
    Math.ceil((total.value || 0) / (pageSize.value || 1))
  )
})

async function load() {
  loading.value = true

  try {
    const res = await fetchPageFromDb({
      page: page.value,
      pageSize: pageSize.value,
      extraParams: props.queryParams,
    })

    rows.value = res?.rows || []
    total.value = Number(res?.total || 0)

    emit('loaded', {
      page: page.value,
      pageSize: pageSize.value,
      total: total.value,
    })
  } finally {
    loading.value = false
  }
}

watch(pageCount, pc => {
  if (page.value > pc) {
    page.value = pc
  }
})

watch([page, pageSize], () => {
  load()
})

watch(
  () => props.queryParams,
  () => {
    page.value = 1
    load()
  },
  { deep: true }
)

onMounted(() => {
  if (props.autoLoad) {
    load()
  }
})

function onPageChange(p) {
  page.value = p
}

function onPageSizeChange(s) {
  pageSize.value = s
  page.value = 1
}

function onRowClick(e) {
  emit('row-click', e)
}

function onDeleteRow(row) {
  emit('delete-row', row)
}
</script>

<template>
  <v-card class="paged-card" variant="outlined">
    <v-card-title class="card-header">
      <div class="title">
        {{ title }}
      </div>

      <v-spacer />

      <div class="total">
        Total: {{ total }}
      </div>

      <v-select
        v-model="pageSize"
        :items="pageSizeOptions"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 110px"
        :disabled="loading"
        @update:model-value="onPageSizeChange"
      />

      <v-pagination
        v-model="page"
        :length="pageCount"
        density="comfortable"
        total-visible="7"
        :disabled="loading"
        @update:model-value="onPageChange"
      />

      <v-btn
        size="small"
        color="primary"
        variant="tonal"
        :loading="loading"
        @click="load"
      >
        Refresh
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="grid-wrap">
      <AgGridPro
        :height="gridHeight"
        :row-data="rows"
        :columns="columns"
        :show_op="show_op"
        :opMode="opMode"
        @row-click="onRowClick"
        @delete-row="onDeleteRow"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.paged-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  flex-wrap: wrap;
}

.title {
  font-size: 15px;
  font-weight: 600;
}

.total {
  font-size: 12px;
  opacity: 0.85;
  white-space: nowrap;
}

.grid-wrap {
  flex: 1;
  height: calc(100% - 65px);
  padding: 8px;
  overflow: hidden;
}
</style>