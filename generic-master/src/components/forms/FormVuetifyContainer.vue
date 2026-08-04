<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import DynamicVuetifyForm from '@/components/forms/DynamicVuetifyForm.vue'
import RepeatableFormWrapper from '@/components/forms/RepeatableFormWrapper.vue'
import StaffProfileOverview from '@/components/forms/StaffProfileOverview.vue'
import ConfirmDialog from '@/components/forms/ConfirmDialog.vue'
import { parseJsonbFields, parseAndFlattenJsonbFields, parseRepeatableJsonbFields } from '@/composables/utilFactory'
import { useFileStore } from '@/stores/useFileStore'
import { buildSaveParams } from '@/composables/formParamBuilder'
import { showSnackbar } from '@/utils/SnackBar.vue'

const dataStore = useDataStore()
const configStore = useAppConfigStore()
const fileStore = useFileStore()

configStore.loadFromWindow()

const formData = ref({})
const activeName = ref('')
const category = ref([])
const dictionary = ref([])

const loadedTabs = ref({})
const loadingTabs = ref({})

const originalData = ref({})

const tabSqlTags = computed(() => configStore.MAIN_CONFIG?.tab2sqltag_list || {})

// ログインユーザーID
function loginUserId() {
  return dataStore.getLoginUser()?.user_id
    || dataStore.params?.attributes?.user_id
    || 'admin'
}

//categoryとdictionaryの取得
onMounted(async () => {
  const multiQueryResult = await dataStore.dbAccessWithMultiTags({
    category: {
      SQLTAG: 'masters.get_item_category',
      category_code: 'staffs',
      enabled: 'active',
    },
    dictionary: {
      SQLTAG: 'masters.get_item_dictionary',
      category_code: 'staffs',
      enabled: 'active',
    },
  })

  if (multiQueryResult.code !== 0) {
    console.error('Failed to load data:', multiQueryResult.message)
    return
  }

  category.value = normalizeCategoryRows(multiQueryResult.data?.category || [])

  dictionary.value = parseJsonbFields(
    multiQueryResult.data?.dictionary || [],
    ['field_definition', 'item_description', 'formula']
  )
})

const tabItems = computed(() => {
  return Array.isArray(category.value) ? category.value : []
})

function getTabLabel(tabCode) {
  return getCategoryByTab(tabCode)?.remarks
    ?? tabSqlTags.value[tabCode]?.label
    ?? tabCode
}

async function handleFormSubmit(tabCode, submittedData) {
  const row = dataStore.states.currentRow
  if (!row?.staff_code) return

  const tabConfig = tabSqlTags.value[tabCode]
  if (!tabConfig) {
    console.error('tabConfig not found:', tabCode)
    return
  }

  const data = submittedData ?? formData.value[tabCode]

  // 既存レコードは update、新規は insert（旧形式の save タグも許容）
  const sqltags = tabConfig.sqltags || {}
  const saveSqlTag = data?.id
    ? (sqltags.update || sqltags.save)
    : (sqltags.insert || sqltags.save)

  if (!saveSqlTag) {
    showSnackbar(`${getTabLabel(tabCode)}の保存用SQLタグが設定されていません。`, 'warning')
    return
  }

  const commonParams = {
    updated_by: loginUserId(),
    category_code: tabCode,
    staff_id: row.staff_id,
    staff_code: row.staff_code,
  }

  const params = buildSaveParams(
    data,
    tabConfig,
    commonParams
  )

  const ok = await dataStore.saveData(saveSqlTag, params, { showSuccessMessage: false })

  if (ok) {
    showSnackbar(`${getTabLabel(tabCode)}を保存しました`, 'success')
    originalData.value[tabCode] = cloneData(formData.value[tabCode])

    if (!tabConfig.skip_reload) {
      await loadActiveTabData(tabCode, { force: true })
    }
  }
}

// ---- 保存前の確認 ----
function cloneData(value) {
  try {
    return JSON.parse(JSON.stringify(value ?? null))
  } catch (e) {
    return null
  }
}

const isConfirmDialog = ref(false)
const confirmTab = ref('')
const confirmData = ref(null)
const confirmSaving = ref(false)

// repeatable タブは id で読込時の行を探す（新規行は変更前なし）
function findOriginalRow(tabCode, data) {
  const original = originalData.value[tabCode]

  if (!isRepeatableCategory(tabCode)) {
    return original || {}
  }

  if (!Array.isArray(original)) return {}
  return original.find(row => row?.id != null && row.id === data?.id) || {}
}

// フォームの submit（バリデーション通過後）で確認ダイアログを開く
function openConfirmDialog(tabCode, submittedData) {
  confirmTab.value = tabCode
  confirmData.value = submittedData ?? formData.value[tabCode]
  isConfirmDialog.value = true
}

async function confirmSave() {
  confirmSaving.value = true

  try {
    await handleFormSubmit(confirmTab.value, confirmData.value)
    isConfirmDialog.value = false
  } finally {
    confirmSaving.value = false
  }
}

function normalizeCategoryRows(rows = []) {
  return rows
    .filter(row => row?.enabled !== 'inactive')
    .sort((a, b) => Number(a.show_order || 0) - Number(b.show_order || 0))
}

function getCategoryByTab(tabCode) {
  return category.value.find(cat => cat.sub_category_code === tabCode)
}

function isRepeatableCategory(tabCode) {
  return getCategoryByTab(tabCode)?.data_structure === 'repeatable'
}

function normalizeDictionaryItem(item) {
  const definition = item.field_definition || {}

  return {
    ...item,
    ...definition,

    // DynamicVuetifyForm が参照する標準キー
    key: definition.key || item.l_item_code || item.g_item_code,
    label: definition.label || item.item_name || item.l_item_code || item.g_item_code,
    component: definition.component || definition.ui_component,
    type: definition.type || definition.input_type,
    props: definition.props || {},
    validation: definition.validation || {},
  }
}

function getItemsByTab(tabCode) {
  if (!Array.isArray(dictionary.value)) return []

  return dictionary.value
    .filter(item => item.sub_category_code === tabCode)
    .filter(item => item.enabled !== 'inactive')
    .filter(item => item.showable !== 'hide')
    .sort((a, b) => Number(a.show_order || 0) - Number(b.show_order || 0))
    .map(normalizeDictionaryItem)
}


// カテゴリコードと衝突しない予約タブコード
const PREVIEW_TAB = 'preview'

// staff.get_information_preview の結果（{basic:{...}, work_history:[...], ...}）
const previewProfile = computed(() => formData.value[PREVIEW_TAB] || {})

// 添付（画像アップロード）はプレビュー対象外
function getPreviewFields(tabCode) {
  return getItemsByTab(tabCode).filter(field => field.group !== 'attachment')
}

// タブコード → 項目定義リスト（StaffProfileOverview に渡す）
const previewFieldsMap = computed(() => {
  const map = {}
  tabItems.value.forEach(tab => {
    map[tab.sub_category_code] = getPreviewFields(tab.sub_category_code)
  })
  return map
})

function ensureTabFormData(tabCode) {
  if (!tabCode) return

  if (isRepeatableCategory(tabCode)) {
    if (!Array.isArray(formData.value[tabCode])) {
      formData.value[tabCode] = []
    }
    return
  }

  if (!formData.value[tabCode] || Array.isArray(formData.value[tabCode])) {
    formData.value[tabCode] = {}
  }
}

function initializeAllTabContainers() {
  category.value.forEach(cat => {
    ensureTabFormData(cat.sub_category_code)
  })
}

function getStaffKey(row) {
  return row?.staff_id || row?.staff_code || null
}

function parseTabRows(tabCode, rows = []) {
  const jsonbFields = tabSqlTags.value[tabCode]?.jsonb_fields || []

  if (isRepeatableCategory(tabCode)) {
    return parseRepeatableJsonbFields(rows, jsonbFields)
  }

  const parsed = parseAndFlattenJsonbFields(rows, jsonbFields)

  return parsed[0]
}

// activeになったタブだけスタッフデータをロードする
const loadActiveTabData = async (tabCode = activeName.value, options = {}) => {
  const row = dataStore.states.currentRow
  const staffKey = getStaffKey(row)

  if (!staffKey || !tabCode || !category.value?.length) return

  // 保存先（器）の初期化とキャッシュチェック
  ensureTabFormData(tabCode)

  const cacheKey = `${staffKey}:${tabCode}`

  if (!options.force && loadedTabs.value[tabCode] === cacheKey) {
    return
  }

  // select タグが未設定のタブはロードしない
  const selectTag = tabSqlTags.value[tabCode]?.sqltags?.select
  if (!selectTag) {
    loadedTabs.value[tabCode] = cacheKey
    return
  }

  const condition = {
    [tabCode]: {
      SQLTAG: selectTag,
      category_code: tabCode,
      staff_code: row?.staff_code || null,
      staff_id: row?.staff_id || null,
    }
  }

  loadingTabs.value[tabCode] = true

  const multiQueryResult = await dataStore.dbAccessWithMultiTags(condition)

  loadingTabs.value[tabCode] = false

  if (multiQueryResult.code !== 0) {
    console.error('Failed to load tab data:', multiQueryResult.message)
    showSnackbar(`${getTabLabel(tabCode)}の取得に失敗しました。`, 'error')
    return
  }

  //取得したデータの加工と格納
  const rows = multiQueryResult.data?.[tabCode] || []
  const parsedData = parseTabRows(tabCode, rows)

  // 繰り返し型のタブ（職歴など）の場合はデータを配列としてそのまま格納
  if (isRepeatableCategory(tabCode)) {
    formData.value[tabCode] = Array.isArray(parsedData) ? parsedData : []
  } else {
    formData.value[tabCode] = {
      ...(formData.value[tabCode] || {}),
      ...(parsedData || {}),
    }
  }
  originalData.value[tabCode] = cloneData(formData.value[tabCode])

  // このスタッフのこのタブが読み込み済みであることを記録する
  loadedTabs.value[tabCode] = cacheKey
}

watch(
  () => dataStore.states.currentRow,
  async (newVal) => {
    // 1. データを空にする
    formData.value = {}
    originalData.value = {}
    loadedTabs.value = {}
    loadingTabs.value = {}

    initializeAllTabContainers()
    fileStore.clearFiles()

    // 2. 現在開いているタブのデータをDBから取り直す
    if (newVal && activeName.value) {
      await loadActiveTabData(activeName.value, { force: true })
    }
  },
  { immediate: true }
)

watch(
  activeName,
  async (newTab) => {
    if (newTab) {
      ensureTabFormData(newTab)
      await loadActiveTabData(newTab)
    }
  }
)

watch(
  category,
  async (newCategory) => {
    if (!newCategory?.length) return

    initializeAllTabContainers()

    if (!activeName.value) {
      activeName.value = PREVIEW_TAB
      return
    }

    await loadActiveTabData(activeName.value)
  }
)
</script>

<template>
  <v-card class="container-card" variant="outlined">
    <v-card-title class="card-header">
      <div class="header-left truncated">
        <span v-if="dataStore.states?.currentRow" class="staff-title">
          {{ dataStore.states.currentRow.staff_code }} -
          {{ dataStore.states.currentRow.basic?.staff_name || dataStore.states.currentRow.staff_name }}様
        </span>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-2">
      <v-tabs
        v-model="activeName"
        density="compact"
        color="primary"
      >
        <v-tab :value="PREVIEW_TAB">
          プレビュー
        </v-tab>

        <v-tab
          v-for="tab in tabItems"
          :key="tab.sub_category_code"
          :value="tab.sub_category_code"
        >
          {{ tab.remarks }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeName" class="mt-2">
        <!-- 全項目プレビュー（参照のみ） -->
        <v-window-item :value="PREVIEW_TAB">
          <StaffProfileOverview
            :categories="tabItems"
            :profile="previewProfile"
            :fields-map="previewFieldsMap"
            :staff-code="dataStore.states.currentRow?.staff_code"
            :loading="!!loadingTabs[PREVIEW_TAB]"
          />
        </v-window-item>

        <v-window-item
          v-for="tab in tabItems"
          :key="tab.sub_category_code"
          :value="tab.sub_category_code"
        >
          <v-progress-linear
            v-if="loadingTabs[tab.sub_category_code]"
            indeterminate
            class="mb-3"
          />

          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">
              {{ tab.remarks }}
            </v-card-title>

            <v-card-text>
              <RepeatableFormWrapper
                v-if="tab.data_structure === 'repeatable'"
                v-model="formData[tab.sub_category_code]"
                :label="tab.remarks"
                :children="getItemsByTab(tab.sub_category_code)"
                :add-button-text="`${tab.category_name}追加`"
                :staff-code="dataStore.states.currentRow?.staff_code"
                @submit="data => openConfirmDialog(tab.sub_category_code, data)"
              />

              <DynamicVuetifyForm
                v-else
                v-model="formData[tab.sub_category_code]"
                :fields="getItemsByTab(tab.sub_category_code)"
                :staff-code="dataStore.states.currentRow?.staff_code"
                :is-repeatable="false"
                @submit="data => openConfirmDialog(tab.sub_category_code, data)"
              />
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>

  <!-- 保存内容の確認ダイアログ -->
  <ConfirmDialog
    v-model="isConfirmDialog"
    :tab-label="getTabLabel(confirmTab)"
    :fields="getPreviewFields(confirmTab)"
    :form-data="confirmData"
    :approved-data="findOriginalRow(confirmTab, confirmData)"
    :staff-code="dataStore.states.currentRow?.staff_code"
    :saving="confirmSaving"
    @confirm="confirmSave"
  />
</template>

<style scoped>
.container-card {
  margin: 12px;
  background-color: #fff;
  border-radius: 8px;
  border: 0 solid #e0e0e0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.staff-title {
  font-size: 1.25em;
  font-weight: bold;
}
</style>
