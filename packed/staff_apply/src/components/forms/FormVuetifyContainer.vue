<script setup>
import { ref, unref, computed, watch, onMounted,watchEffect } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import DynamicVuetifyForm from '@/components/forms/DynamicVuetifyForm.vue'
import RepeatableFormWrapper from '@/components/forms/RepeatableFormWrapper.vue'
import ApprovalActions from '@/components/helper/dialog/ApprovalActions.vue'
import RequestHistoryPreviewDialog from '@/components/helper/dialog/RequestHistoryPreviewDialog.vue'
import { parseJsonbFields, parseAndFlattenJsonbFields, parseRepeatableJsonbFields } from '@/composables/utilFactory'
import { useFileStore } from '@/stores/useFileStore'
import { buildSaveParams } from '@/composables/formParamBuilder'
import MainList from '../MainList.vue'

const dataStore = useDataStore()
const configStore = useAppConfigStore()
const fileStore = useFileStore()

const formRef = ref()

const HISTORY_TAB = 'request-history'

configStore.loadFromWindow()

const formData = ref({})
const activeName = ref('')
const category = ref([])
const dictionary = ref([])

const loadedTabs = ref({})
const loadingTabs = ref({})

const tabSqlTags = computed(() => configStore.MAIN_CONFIG?.tab2sqltag_list || {})
const controls = computed(() => configStore.buttonRules || {})
const chipcontrols = computed(() => configStore.requestStatusConfig || {})


const currentStaffRow = computed(() => ({
  ...dataStore.params.attributes
}))

const currentStaffRequest = computed(() => ({
  ...dataStore.states.currentRow[0]
}))

const commonParams = computed(() => {
  const row = currentStaffRow.value || {}

  return {
    staff_id: row.staff_id || null,
    staff_code: row.staff_code || row.user_id || null,
    user_id: row.user_id || null,
  }
})

watchEffect(() => {
  console.log("status", currentStaffRequest.value?.request_status)
  console.log("controls", controls.value)
})



const props = defineProps({
  ApplicationType: {
    type:String,
    default: ()=>'staffs',
  }
})

const emit = defineEmits(['approval-done'])
const approvalActionsRef = ref(null)

function handleRequestAction(tabCode, payload) {
  const allTabConfigs = unref(tabSqlTags) || {}
  const resolvedCommonParams = unref(commonParams) || {}

  const tabConfig = allTabConfigs[tabCode]

  if (!tabConfig) {
    console.error(
      `tabConfigが見つかりません: ${tabCode}`
    )

    return
  }

  approvalActionsRef.value?.openRequestAction({
    ...payload,
    tabCode,
    tabConfig,
    commonParams: resolvedCommonParams,
  })
}

async function handleRequestActionDone(payload) {
  const tabCode = payload?.tabCode

  if (!tabCode) {
    return
  }

  /*
   * 既存のタブ再読込関数名がloadTabDataの場合。
   * 実際の関数名が異なる場合はここだけ既存関数名へ合わせる。
   */
  await loadActiveTabData(tabCode)
}

const historyPreviewOpen = ref(false)
const selectedRequestId = ref(null)
const selectedHistoryRow = ref(null)

function openHistoryPreview(payload) {
  selectedRequestId.value = payload.requestId
  selectedHistoryRow.value = payload.row
  historyPreviewOpen.value = true
}

const application_type = computed(() => props.ApplicationType || '')

onMounted(async () => {
  const multiQueryResult = await dataStore.dbAccessWithMultiTags({
    category: {
      SQLTAG: 'masters.get_item_category',
      category_code: 'staffs',
      sub_category_code: application_type.value,
      enabled: 'active',
    },
    dictionary: {
      SQLTAG: 'masters.get_item_dictionary',
      category_code: 'staffs',
      sub_category_code: application_type.value,
      enabled: 'active',
    },
    roles: {
      SQLTAG: 'system.get_roles',
      enabled: 'active',
    },
    
  })

  console.log('Loaded multi-query data:', multiQueryResult)
  if (multiQueryResult.code !== 0) {
    console.error('Failed to load data:', multiQueryResult.message)
    return
  }

  console.log('Loaded category data:', multiQueryResult.data?.category)
  category.value = normalizeCategoryRows(multiQueryResult.data?.category || [])

  console.log('Loaded dictionary data:', multiQueryResult.data?.dictionary)
  dictionary.value = parseJsonbFields(
    multiQueryResult.data?.dictionary || [],
    ['field_definition', 'item_description', 'formula']
  )
})

const tabItems = computed(() => {
  return Array.isArray(category.value) ? category.value : []
})

const editMode = computed(() => {
  return !!dataStore.states.currentRow
})

async function handleFormSubmit(tabCode, submittedData) {
  const row = dataStore.params.attributes
  if (!row?.staff_code) return

  const tabConfig = tabSqlTags.value[tabCode]

  const commonParams = {
    updated_by: 'admin',
    staff_id:row.staff_id,
    staff_code:row.staff_code,
    user_id:row.user_id,
    data_type: tabCode
  }

  const data = submittedData ?? formData.value[tabCode]

  const saveSqlTag =
        data.id
            ? tabConfig.sqltags.update
            : tabConfig.sqltags.insert
  
  //const saveSqlTag = tabConfig?.sqltags?.save
  if (!tabConfig) {
    console.error('tabConfig not found:', tabCode)
    return
  }

  

  const params = buildSaveParams(
    data,
    tabConfig,
    commonParams
  )

  
  console.log("data==============",data)
  console.log("commonParams==============",commonParams)
  console.log("params==============",params)
  const ok = await dataStore.saveData(saveSqlTag, params)

  if (ok) {
    const cat = getCategoryByTab(tabCode)
    alert(`${cat?.remarks ?? tabCode}を保存しました`)

    if (!tabConfig.skip_reload) {
      await loadActiveTabData(tabCode, { force: true })
    }
  }
}

async function save() {
  const tabCode = activeName.value
  if (!tabCode) return
  await handleFormSubmit(tabCode, formData.value[tabCode])
}

function normalizeCategoryRows(rows = []) {
  console.log('Normalizing category rows:', rows)
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
  return row?.staff_id || row?.staff_code || row?.user_id || null
}

function getStaffName(row) {
  return row?.staff_name || row?.user_name || null
}



function parseTabRows(tabCode, rows = []) {
  const jsonbFields = tabSqlTags.value[tabCode]?.jsonb_fields || []
  const parsed = parseAndFlattenJsonbFields(rows, jsonbFields)

  if (isRepeatableCategory(tabCode)) {
    if (Array.isArray(parsed)) return parsed
    return parsed ? [parsed] : []
  }

  return Array.isArray(parsed) ? (parsed[0] || {}) : {}
}
// function parseTabRows(tabCode, rows = []) {
//     const jsonbFields = tabSqlTags.value[tabCode]?.jsonb_fields || []

//     if (isRepeatableCategory(tabCode)) {
//         return parseRepeatableJsonbFields(rows, jsonbFields)
//     }

//     const parsed = parseAndFlattenJsonbFields(rows, jsonbFields)

//     const row = parsed[0]

//     return row
// }

// activeになったタブだけスタッフデータをロードする
const loadActiveTabData = async (tabCode = activeName.value, options = {}) => {
  console.log("start loadActiveTabData")
  const row = currentStaffRow.value
//   console.log(row)
// console.log(row.staff_code)
// console.log(Object.keys(row))
//   console.log("loadactivetabdata.row==========",row)
  const staffKey = getStaffKey(row)
  console.log("before staffkey_check loadActiveTabData")

  console.log("111111111 staffKey",staffKey)
  console.log("111111111 tabCode",tabCode)
  console.log("111111111 category.value?.length",category.value?.length)

  if (!staffKey || !tabCode || !category.value?.length) return

console.log("after staffkey_check loadActiveTabData")

  ensureTabFormData(tabCode)
  console.log("after ensureTabFormData")

  const cacheKey = `${staffKey}:${tabCode}`

  // if (!options.force && loadedTabs.value[tabCode] === cacheKey) {
  //   return
  // }

  console.log("row.staff_code==========",row?.staff_code)
  const condition = {
    [tabCode]: {
      SQLTAG:
        tabSqlTags.value[tabCode]?.sqltags?.select ||
        tabSqlTags.value[tabCode]?.sqltag ||
        'get_staff_personal_request',
      category_code: tabCode,
      staff_code: row.staff_code || null,
      staff_id: row.staff_id || null,
    }
  }

  console.log(`Loading tab data: ${tabCode} with condition`, condition)

  loadingTabs.value[tabCode] = true

  const multiQueryResult = await dataStore.dbAccessWithMultiTags(condition)

  loadingTabs.value[tabCode] = false

  if (multiQueryResult.code !== 0) {
    console.error('Failed to load tab data:', multiQueryResult.message)
    return
  }

  const rows = multiQueryResult.data?.[tabCode] || []
  console.log("rows========",rows)
  
  dataStore.states.currentRow = rows
  
  const parsedData = parseTabRows(tabCode, rows)
  console.log("parsedData========",parsedData)

  if (isRepeatableCategory(tabCode)) {
    formData.value[tabCode] = Array.isArray(parsedData) ? parsedData : []
  } else {
    formData.value[tabCode] = {
      ...(formData.value[tabCode] || {}),
      ...(parsedData || {}),
    }
  }

  loadedTabs.value[tabCode] = cacheKey

  console.log(`Loaded tab data: ${tabCode}`, formData.value[tabCode])
}

//管理者用スタッフ情報管理で使用しているコードで使用していないためコメントアウト
// watch(
//   () => dataStore.states.currentRow,
//   async (newVal) => {
//     formData.value = {}
//     loadedTabs.value = {}
//     loadingTabs.value = {}

//     initializeAllTabContainers()

//     if (newVal && activeName.value) {
//       await loadActiveTabData(activeName.value, { force: true })
//       console.log("watch dataStore.states.currentRow")
//     }
//   },
//   { immediate: true }
// )

watch(
  activeName,
  async newTab => {
    if (!newTab) return

    // 申請履歴はMainList側でデータを取得するため、
    // 個人情報フォームのロード処理を実行しない
    if (newTab === HISTORY_TAB) {
      return
    }

    // マスタに存在しないタブコードも除外
    if (!getCategoryByTab(newTab)) {
      console.warn('Unknown tab:', newTab)
      return
    }

    ensureTabFormData(newTab)
    await loadActiveTabData(newTab)
  }
)

watch(
  category,
  async (newCategory) => {
    console.log("1 watch category")
    if (!newCategory?.length) return

    initializeAllTabContainers()

    console.log("2 watch category",activeName.value)

    if (!activeName.value) {
      activeName.value = newCategory[0]?.sub_category_code || ''
      console.log("2.5 watch category",activeName.value)
      return
    }

    await loadActiveTabData(activeName.value)
    console.log("3 watch category")
  }
)

watch(
  formData,
  (newVal) => {
    console.log("formdata watch",JSON.stringify(newVal))
  },
  {
    deep: true
  }
)

 const tab = computed(()=>tabItems.value[0])

</script>

<template>
  <v-card class="container-card" variant="outlined">
    <v-card-title class="card-header">
      <div class="header-left truncated">
        <span v-if="currentStaffRow" class="staff-title">
          {{ commonParams.staff_code }} -
          {{ getStaffName(currentStaffRow) }}様
        </span>
      </div>

      <div class="header-actions">
        <ApprovalActions
           ref="approvalActionsRef"
           @done="handleRequestActionDone"
         />
      </div>
      <!-- <v-chip
          :color="chipcontrols?.color"
          variant="flat"
          class="ml-2"
          :prepend-icon="chipcontrols?.icon"
        >
          {{ chipcontrols?.title }}
        </v-chip> -->
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-2">
      <v-tabs
        v-model="activeName"
        density="compact"
        color="primary"
      >
        <v-tab
          v-for="tab in tabItems"
          :key="tab.sub_category_code"
          :value="tab.sub_category_code"
        >
          {{ tab.remarks }}
        </v-tab>

        <v-tab :value="HISTORY_TAB">
          申請履歴
        </v-tab>
      </v-tabs>

      <v-window v-model="activeName" class="mt-2">

        <!-- 履歴一覧表示(ag-grid) -->
        <v-window-item :value="HISTORY_TAB">
          <MainList
            :ApplicationType="application_type"
            @preview-request="openHistoryPreview"
          />

          <RequestHistoryPreviewDialog
            v-model="historyPreviewOpen"
            :request-id="selectedRequestId"
            :summary-row="selectedHistoryRow"
            :fields="getItemsByTab(application_type)"
          />
        </v-window-item>

        <v-window-item
          v-for="tab in tabItems"
          :key="tab.sub_category_code"
          :value="tab.sub_category_code"
        >
          <v-progress-linear
        v-if="loadingTabs[tab?.sub_category_code]"
            indeterminate
            class="mb-3"
          />

          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">
          {{ tab?.remarks }}
            </v-card-title>

            <v-card-text>
              <RepeatableFormWrapper
                v-if="tab?.data_structure === 'repeatable'"
                v-model="formData[tab?.sub_category_code]"
                :label="tab?.remarks"
                :children="getItemsByTab(tab?.sub_category_code)"
                :controls="controls"
                :chipcontrols="chipcontrols"
                :add-button-text="`${tab?.category_name}追加`"
                :sqltags="tabSqlTags[tab?.sub_category_code]?.sqltags"
                :tab-config="tabSqlTags[tab?.sub_category_code] || {}"
                :common-params="commonParams"
                :staff-code="dataStore.params.attributes?.staff_code"
                @request-action="
                  payload =>
                    handleRequestAction(
                      tab.sub_category_code,
                      payload
                    )
                "
              />

              <DynamicVuetifyForm
                v-else
                v-model="formData[tab?.sub_category_code]"
                ref="formRef"
                :controls="controls"
                :chipcontrols="chipcontrols"
                :fields="getItemsByTab(tab?.sub_category_code)"
                :sqltags="tabSqlTags[tab?.sub_category_code]?.sqltags"
                :tab-config="tabSqlTags[tab?.sub_category_code] || {}"
                :common-params="commonParams"
                :staff-code="dataStore.params.attributes?.staff_code"
                :is-repeatable="false"
                @request-action="
                  payload =>
                    handleRequestAction(
                      tab.sub_category_code,
                      payload
                    )
                "
              />
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window> 
    </v-card-text>
  </v-card>
</template>

<style scoped>
.container-card {
  height: auto;
  margin: 0px;
  min-height: 100%;
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

.header-actions {
  display: flex;
  gap: 8px;
}
</style>