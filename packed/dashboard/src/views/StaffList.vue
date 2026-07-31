<!-- StaffList.vue スタッフ一覧（user-master の MainList を簡略化したもの） -->
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import AgGridDataBrowser from '@/components/helper/grid/PagedAgGridCard.vue'
import { parseAndFlattenJsonbFields } from '@/composables/utilFactory'
import { showSnackbar } from '@/utils/Snackbar.vue'

const props = defineProps({
    requestFilter: { type: Object, default: null },
})

const emit = defineEmits(['row-selected', 'selection-changed'])

const dataStore = useDataStore()

const rows = ref([])
const loading = ref(false)

const page = ref(0)
const pageSize = ref(100)
const totalCount = ref(0)

const loadData = async () => {
    loading.value = true
    try {
            const val = await dataStore.get_staff_profile_by_request({
            sub_category_code: props.requestFilter?.sub_category_code || '',
            request_statuses: props.requestFilter?.request_statuses || 'submitted',
            limit: String(pageSize.value),
            offset: String(page.value * pageSize.value),
        })
        // total_count は SQL 側の count(*) over() が全行に付与する
        totalCount.value = Number(val?.[0]?.total_count) || 0
        rows.value = parseAndFlattenJsonbFields(val || [], ['profile_jsonb'])
    }
    catch(error){
        showSnackbar('エラーが発生しました。', 'error')
    }
    finally {
        loading.value = false
    }
}

onMounted(async () => {
    await loadData()
})

// v-dialog 内では再マウントされないため、todo が変わったら再取得する
watch(() => props.requestFilter, async () => {
    page.value = 0
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

// staff_code/staff_name セルクリックで行選択
const gridColumns = computed(() => {
    return dataStore.buildColumnsDefine((p) => {
        dataStore.rowClicked(p)
        emit('row-selected', p?.data || null)
    })
})

const gridCardRef = ref(null)

defineExpose({
    loadData,
    clearSelection: () => gridCardRef.value?.clearSelection?.(),
})
</script>

<template>
  <AgGridDataBrowser
    ref="gridCardRef"
    title="スタッフ一覧"
    :rowData="rows"
    :columns="gridColumns"
    :loading="loading"
    :page="page"
    :pageSize="pageSize"
    :total="totalCount"
    gridHeight="calc(100vh - 240px)"
    @prev-page="handlePrevPage"
    @next-page="handleNextPage"
    @page-size-change="handlePageSizeChange"
    @selection-changed="selected => emit('selection-changed', selected)"
  />
</template>
