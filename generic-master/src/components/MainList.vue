<!-- MainList.vue スタッフ一覧（dashboard の StaffList.vue と同構成） -->
<script setup>
import { ref, computed, onMounted } from 'vue'

import { useDataStore } from '@/stores/DataStore'
import AgGridDataBrowser from '@/components/helper/grid/PagedAgGridCard.vue'
import { parseAndFlattenJsonbFields } from '@/composables/utilFactory'
import { showSnackbar } from '@/utils/SnackBar.vue'

const dataStore = useDataStore()

const rows = ref([])
const loading = ref(false)

const page = ref(0)
const pageSize = ref(100)
const totalCount = ref(0)

const loadData = async () => {
  loading.value = true

  try {
    const val = await dataStore.get_staff_information_list({
      limit: String(pageSize.value),
      offset: String(page.value * pageSize.value),
    })

    // total_count は SQL 側の count(*) over() が全行に付与する
    totalCount.value = Number(val?.[0]?.total_count) || 0
    rows.value = parseAndFlattenJsonbFields(val || [], ['profile_jsonb'])
  }
  catch (error) {
    console.error('Failed to load staff list:', error)
    showSnackbar('エラーが発生しました。', 'error')
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadData()
})

const handlePrevPage = async () => {
  if (page.value <= 0) return
  page.value -= 1
  await loadData()
}

const handleNextPage = async () => {
  if ((page.value + 1) * pageSize.value >= totalCount.value) return
  page.value += 1
  await loadData()
}

const handlePageSizeChange = async (size) => {
  pageSize.value = size
  page.value = 0
  await loadData()
}

const gridColumns = computed(() => {
  return dataStore.buildColumnsDefine(
    (p) => dataStore.rowClicked(p)
  )
})
</script>

<template>
  <v-card class="card_box">
    <v-card-title>
      <div class="d-flex align-center flex-wrap ga-3">
        <h4>
          スタッフ情報管理
        </h4>
      </div>
    </v-card-title>

    <v-card-text>
      <AgGridDataBrowser
        :rowData="rows"
        :columns="gridColumns"
        :loading="loading"
        :page="page"
        :pageSize="pageSize"
        :total="totalCount"
        gridHeight="calc(100vh - 280px)"
        @prev-page="handlePrevPage"
        @next-page="handleNextPage"
        @page-size-change="handlePageSizeChange"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 8px 20px 0 0 !important;
}
</style>
