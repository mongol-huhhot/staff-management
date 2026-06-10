<script setup>
import { ref, computed } from 'vue'
import AgGridPro from './helper/AgGridPro.vue'
import { useDataStore } from '@/stores/DataStore'

const activeTab = ref('new')
const agGridHandler = ref(null)
const dataStore = useDataStore()


const tabs = [
  { value: 'new', label: '新規契約' },
  { value: 'renewal', label: '更新契約' },
]

const pageTitle = computed(() => {
  const item = tabs.find(t => t.value === activeTab.value)
  return item?.label ?? '雇用契約管理'
})

const gridColumns = computed(() => {
  return dataStore.buildColumnsDefine((p) => dataStore.rowCliked(p))
})

function handleRowClick(params) {
  dataStore.rowCliked(params.data)
}

</script>

<template>
  <v-container fluid class="pa-4 employment-contract-page">
    <!-- Header -->
    <v-card class="mb-4" rounded="lg" elevation="1">
      <v-card-text class="d-flex align-center justify-space-between">
        <div>
          <div class="text-h5 font-weight-bold">
            雇用契約管理
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            新規契約・更新契約・一括処理・AIチェックを一つの画面で管理します
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-btn color="primary" prepend-icon="mdi-plus">
            新規作成
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-file-document-outline">
            下書き一覧
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-card rounded="lg" elevation="1">
      <v-tabs
        v-model="activeTab"
        color="primary"
        grow
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
        >
          {{ tab.label }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text>
        <div class="text-h6 font-weight-bold mb-4">
          {{ pageTitle }}
        </div>

        <v-window v-model="activeTab">
          <!-- 新規契約 -->
          <v-window-item value="new">
            <v-row>
              <v-col cols="12" md="3">
                <v-card variant="tonal" rounded="lg">
                  <v-card-title>検索条件</v-card-title>
                  <v-card-text>
                    <v-text-field label="社員番号・氏名" density="compact" />
                    <v-select label="部門" density="compact" :items="['本部', '店舗A', '店舗B']" />
                    <v-select label="雇用区分" density="compact" :items="['正社員', '契約社員', 'パート', 'アルバイト']" />
                    <v-btn block color="primary">検索</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="5">
                <v-card rounded="lg">
                  <v-card-title>対象者一覧</v-card-title>
                  <v-card-text>
                    <ag-grid-pro
                        ref="agGridHandler"
                        v-if="dataStore.data?.staffList"
                        :columns="gridColumns"
                        :rowData="dataStore.data?.staffList"
                        @row-click="handleRowClick"
                        height="620px"
                        mytheme="dark"
                    ></ag-grid-pro>
                    <!-- <v-alert type="info" variant="tonal">
                      未契約者を選択して、同じ条件の人を一括作成できます。
                    </v-alert> -->
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="lg">
                  <v-card-title>契約条件</v-card-title>
                  <v-card-actions>
                    <v-btn color="primary" prepend-icon="mdi-account-multiple-plus">
                        選択者を一括作成
                    </v-btn>

                    <v-btn color="warning" variant="outlined" prepend-icon="mdi-robot-outline">
                        選択者をAIチェック
                    </v-btn>

                    <v-btn variant="outlined" prepend-icon="mdi-file-eye-outline">
                        プレビュー
                    </v-btn>
                  </v-card-actions>

                  <v-card-text>
                    <v-select label="契約テンプレート" density="compact" :items="['正社員契約書', 'パート契約書', 'アルバイト契約書']" />
                    <v-text-field label="契約開始日" type="date" density="compact" />
                    <v-text-field label="契約終了日" type="date" density="compact" />
                    <v-text-field label="時給 / 月給" density="compact" />
                    <v-btn block color="primary">契約作成</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- 更新契約 -->
          <v-window-item value="renewal">
            <v-alert type="warning" variant="tonal" class="mb-4">
              契約満了日が近いスタッフを優先表示し、前回契約との差分を確認します。
            </v-alert>

            <v-row>
              <v-col cols="12" md="4">
                <v-card rounded="lg">
                  <v-card-title>更新対象者</v-card-title>
                  <v-card-text>
                    今月満了・来月満了・未更新者を表示
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="lg">
                  <v-card-title>差分確認</v-card-title>
                  <v-card-text>
                    前回契約 → 新契約の変更点を表示
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="lg">
                  <v-card-title>更新設定</v-card-title>
                    <v-card-actions>
                        <v-btn color="primary" prepend-icon="mdi-account-multiple-plus">
                            選択者を一括作成
                        </v-btn>

                        <v-btn color="warning" variant="outlined" prepend-icon="mdi-robot-outline">
                            選択者をAIチェック
                        </v-btn>

                        <v-btn variant="outlined" prepend-icon="mdi-file-eye-outline">
                            プレビュー
                        </v-btn>
                    </v-card-actions>

                  <v-card-text>
                    <v-text-field label="新契約開始日" type="date" density="compact" />
                    <v-text-field label="新契約終了日" type="date" density="compact" />
                    <v-btn block color="primary">一括更新</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.employment-contract-page {
  background: #f5f7fb;
  min-height: 100vh;
}
</style>
