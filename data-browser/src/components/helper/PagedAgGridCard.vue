<script setup>
import { computed } from 'vue'
import { ElCard, ElButton, ElSelect, ElOption } from 'element-plus'
import AgGridPro from './AgGridPro.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  columns: {
    type: Array,
    default: () => [],
  },
  rowData: {
    type: Array,
    default: () => [],
  },
  gridHeight: {
    type: String,
    default: '600px',
  },
  page: {
    type: Number,
    default: 0,
  },
  pageSize: {
    type: Number,
    default: 100,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'page-change',
  'page-size-change',
  'prev-page',
  'next-page',
])

const displayPage = computed(() => props.page + 1)

const handlePrev = () => {
  emit('prev-page')
}

const handleNext = () => {
  emit('next-page')
}

const handlePageSizeChange = (val) => {
  emit('page-size-change', val)
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
        <b>{{ title }}</b>

        <div style="display: flex; align-items: center; gap: 8px;">
          <el-button @click="handlePrev" :disabled="page <= 0 || loading">
            前へ
          </el-button>

          <span>ページ {{ displayPage }}</span>

          <el-button @click="handleNext" :disabled="loading">
            次へ
          </el-button>

          <el-select
            :model-value="pageSize"
            style="width: 120px;"
            @change="handlePageSizeChange"
          >
            <el-option :value="20" label="20件" />
            <el-option :value="50" label="50件" />
            <el-option :value="100" label="100件" />
            <el-option :value="500" label="500件" />
            <el-option :value="1000" label="1000件" />
          </el-select>
        </div>
      </div>
    </template>

    <AgGridPro
      :columns="columns"
      :rowData="rowData"
      :height="gridHeight"
      :show_op="true"
    />
  </el-card>
</template>
