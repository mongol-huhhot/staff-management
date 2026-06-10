<!-- StaffList.vue -->
<script setup>
import {
  onMounted,
  watch,
  nextTick,
  ref,
  computed,
} from 'vue'

import dayjs from 'dayjs'

import { useDataStore } from '@/stores/DataStore'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import CSVUpload from '@/components/helper/csvupload/CSVUpload.vue'
import AgGridDataBrowser from '@/components/helper/grid/PagedAgGridCard.vue'
// import Encoding from 'encoding-japanese'

const agGridHandler = ref(null)

const dataStore = useDataStore()

const configStore = useAppConfigStore()
configStore.loadFromWindow()


const config = computed(() => configStore.MAIN_CONFIG)
const sqlconfig = computed(() => config.value.tab2sqltag_list)
const default_list = computed(() => config.value.default_list)
// console.log("default_list.value===", default_list.value)
/**
user: {
  label: 'ユーザー情報',
  data_key: 'userdata',
  jsonb_fields: ['current_data','draft_data'],// jsonb カラムの一覧
  skip_reload: true,
  sqltags:{ select:'system.get_users', save:'system.save_user_roles', delete:'system.delete_user_role' },
  separate_items: [ 'id', 'user_id', 'email', "password", 'draft_status', "draft_effective_date" ],// jsonb以外の普通カラム
},
*/
const default_list_config = computed(() => sqlconfig.value?.[default_list.value]) 
const default_sqltag = computed(() => default_list_config.value?.sqltags?.select)

const showDeleted = ref(false)
const selectedVisibleColumnCount = ref(0)

// const salaryDay = '20'
  
// const subMonth = -1

const rows = ref([])

const openCSV = ref(false)

const approved_status = computed(() =>
  (rows.value ?? []).some(
    row => row?.approved_status === true
  )
)

dataStore.states.approved_status = computed(
  () => approved_status.value
)

const isOperatable = computed(() =>
  configStore.MAIN_CONFIG
    ?.includes(dayjs().month())
)

const readOnly = computed(() => {
  if (
    configStore.MAIN_CONFIG?.debug_mode
  ) {
    return false
  }

  if (
    isOperatable.value &&
    !dataStore.states.approved_status
  ) {
    return false
  }

  return true
})

watch(
  () => agGridHandler.value?.selectedVisibleColumnCount?.value,
  (v) => {
    selectedVisibleColumnCount.value = v ?? 0
  },
  {
    immediate: true,
  }
)

const loadData = async () => {
  let val = await dataStore.runLoad(default_sqltag.value, { }, default_sqltag.value)
  rows.value = val
  await nextTick()
}

onMounted(async () => {
  await loadData()
})

// onMounted(async () => {
//   pickedDate.value = dayjs()
//     .add(subMonth, 'month')
//     .format(`YYYY-MM`)
// })

// const pickedDate = ref(null)

// watch(
//   () => pickedDate.value,
//   (val) => {
//     if (!val) return

//     const normalized = dayjs(val)
//       .date(salaryDay)
//       .format('YYYY-MM-DD')

//     if (
//       dataStore.states.current_month !== normalized
//     ) {
//       dataStore.states.current_month = normalized
//     }
//   }
// )

// watch(
//   () => dataStore.states.current_month,
//   async (newVal, oldVal) => {
//     if (!newVal) return
//     if (newVal === oldVal) return

//     console.log("newVal===", newVal)

//     try {
//       await loadData()
//     } catch (e) {
//       console.log(e)
//     }
//   }
// )

watch(
  () => dataStore.states.forceFresh,
  async (newVal, oldVal) => {
    if (!newVal) return
    if (newVal === oldVal) return

    try {
      await loadData()
    } catch (e) {
      console.log(e)
    }
  }
)

const handleRowClick = (event) => {
  dataStore.states.currentRow = event.data
}

const gridColumns = computed(() => {
  return dataStore.buildColumnsDefine(
    (p) => dataStore.rowCliked(p)
  )
})

watch(
  () => showDeleted.value,
  async () => {
    await getSalaryList()
  }
)

async function handleDownload() {
}

</script>

<template>
  <v-card class="card_box">
    <v-card-title>
      <div class="d-flex align-center flex-wrap ga-3">
        <h4>
          ユーザーロール管理
        </h4>
        <!-- {{ configStore.MAIN_CONFIG }} -->
        <a
          href="https://surupas.native365.net/jfsg230540/webcomponents/jfsg230540/chart-system/?k=retroactive"
          target="_blank"
          class="help_link"
        >
          操作手順・説明書はこちら
        </a>
      </div>
    </v-card-title>

    <v-card-text>
      <div
        class="box_header"
        style="margin-top:0px; margin-bottom:12px;"
      >
        <!-- <v-text-field
          v-model="pickedDate"
          type="month"
          label="年月"
          density="compact"
          variant="outlined"
          hide-details
          style="width:10em; margin-top:4px; margin-right:12px;"
        /> -->

        <div class="box_header">
          <CSVUpload
            v-model:openCSV="openCSV"
            title="CSV"
            :disabled="readOnly"
          />

          <v-tooltip
            text="随時改定（月額変更届）データ出力します。出力は複数回可能ですが、月額データ更新は不可になります！"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                color="warning"
                prepend-icon="mdi-download"
                style="margin-left:1dvh; margin-top:4px;"
                @click="handleDownload"
              >
                CSV出力
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>

      <AgGridDataBrowser
        v-if="rows"
        ref="agGridHandler"
        :rowData="rows"
        :columns="gridColumns"
        height="calc(100vh - 310px)"
        @row-click="handleRowClick"
        @selected-rows-change="$emit('selected-rows-change', $event)"
      />
    </v-card-text>
  </v-card>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 8px 20px 0 0 !important;
}

.comment_class {
  margin-top: 10px;
  margin-left: 12px;
  font-size: 0.71em;
}

.box_header {
  padding: 0 !important;
  margin-left: 8px !important;
  display: flex;
  justify-content: left;
  align-items: center;
  flex-wrap: wrap;
}

.help_link {
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-left: 12px;
}
</style>