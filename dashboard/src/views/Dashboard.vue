<script setup>
import { ref, computed, } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useAppConfigStore } from '@/stores/AppConfigStore'

const appConfigStore = useAppConfigStore()
appConfigStore.loadFromWindow()

console.log("ffff===-", appConfigStore.DASHBOARD_CONFIG)

const leftTab = ref('todo')
const centerTab = ref('notice')
const rightTab = ref('all')

const horizontal_vertical = ref('horizontal') // 'horizontal' or 'vertical'

const toggleMode = () => {
    horizontal_vertical.value = horizontal_vertical.value === 'horizontal' ? 'vertical' : 'horizontal'
}

const todos = computed(() => appConfigStore?.DASHBOARD_CONFIG?.todos )
const notices = computed(() => appConfigStore?.DASHBOARD_CONFIG?.notices )
const menus = computed(() => appConfigStore?.DASHBOARD_CONFIG?.menus )

watch(
    () => appConfigStore.DASHBOARD_CONFIG,
    ( newConfig ) => {
        // console.log('Dashboard config updated:', newConfig)
        if( !newConfig ) return

        

        // Update the dashboard config in the store
    },
    { deep: true, immediate: true }
)

</script>

<template>
  <v-app>
    <v-layout>
      <!-- <v-app-bar color="light-blue" height="56" flat>
        <v-toolbar-title class="text-white text-subtitle-1">
          ホーム ｜ 導入設定 ｜ マスタ管理 ｜ 人事本部 ｜ 給与関連 ｜ 人事評価 ｜ 個人ポータル ｜ 経理本部 ｜ 総務本部 ｜ 営業本部
        </v-toolbar-title>
      </v-app-bar> -->

      <v-main>
        <div class="dashboard">
          <splitpanes class="default-theme main-split" :horizontal="horizontal_vertical !== 'horizontal'">
            <!-- 左 pane -->
            <pane size="36" min-size="20">
              <v-card class="pane-card" flat>
                <v-tabs v-model="leftTab" density="compact" color="light-blue">
                  <v-tab value="todo">
                    処理待ち
                    <v-badge content="3" color="red" inline />
                  </v-tab>
                  <!-- <v-tab value="done">已办</v-tab> -->
                  
                  <v-spacer />

                  <v-tooltip>
                    <template #activator="{ props }">
                      <v-btn icon variant="text" color="light-blue" @click="toggleMode" v-bind="props">
                        <v-icon>{{ horizontal_vertical === 'horizontal' ? 'mdi-arrow-expand-horizontal' : 'mdi-arrow-expand-vertical' }}</v-icon>
                      </v-btn>
                    </template>
                    <span>縦横切替え</span>
                  </v-tooltip>
                </v-tabs>

                <v-window v-model="leftTab">
                  <v-window-item value="todo">
                    <v-list density="compact">
                      <v-list-item
                        v-for="(item, index) in todos"
                        :key="index"
                        class="todo-item"
                      >
                        <template #title>
                          <span :class="`text-${item.color}`">
                            [{{ item.type }}]
                          </span>
                        </template>

                        <template #subtitle>
                          {{ item.text }}
                        </template>

                        <template #append>
                          <v-badge content="3" color="red" inline />
                          <v-btn
                            size="small"
                            rounded
                            variant="tonal"
                            color="light-blue"
                          >
                            確認
                          </v-btn>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-window-item>

                  <v-window-item value="done">
                    <div class="empty-box">処理済みデータはありません</div>
                  </v-window-item>
                </v-window>
              </v-card>
            </pane>

            <!-- 中央 pane -->
            <pane size="30" min-size="20">
              <v-card class="pane-card" flat>
                <v-tabs v-model="centerTab" density="compact" color="light-blue">
                  <v-tab value="notice">
                    通知
                    <v-badge content="2" color="red" inline />
                  </v-tab>
                  <v-tab value="news">お知らせ</v-tab>

                  <v-spacer />

                  <v-btn icon variant="text" color="light-blue">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-tabs>

                <v-window v-model="centerTab">
                  <v-window-item value="notice">
                    <v-list density="compact">
                      <v-list-item
                        v-for="(notice, index) in notices"
                        :key="index"
                        class="notice-item"
                      >
                        <template #prepend>
                          <v-icon color="grey">mdi-bell-outline</v-icon>
                        </template>

                        <v-list-item-title class="notice-text">
                          {{ notice }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-window-item>

                  <v-window-item value="news">
                    <div class="empty-box">お知らせはありません</div>
                  </v-window-item>
                </v-window>
              </v-card>
            </pane>

            <!-- 右 pane -->
            <pane size="34" min-size="22">
              <v-card class="pane-card" flat>
                <v-tabs v-model="rightTab" density="compact" color="light-blue">
                  <v-tab value="all">全部</v-tab>
                </v-tabs>

                <v-window v-model="rightTab">
                  <v-window-item value="all">
                    <v-container fluid>
                      <v-row dense>
                        <v-col
                          v-for="(menu, index) in menus"
                          :key="index"
                          cols="12"
                          sm="6"
                          md="4"
                        >
                          <v-card class="menu-card" variant="elevated">
                            <v-avatar color="blue-lighten-4" size="40">
                              <v-icon color="primary">
                                {{ menu.icon }}
                              </v-icon>
                            </v-avatar>

                            <div class="menu-title">
                              {{ menu.title }}
                            </div>
                          </v-card>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-window-item>
                </v-window>
              </v-card>
            </pane>
          </splitpanes>
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style scoped>
.dashboard {
  height: calc(100vh - 100px);
  background: #f5f7fa;
  padding: 8px;
}

.main-split {
  height: 100%;
}

.pane-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.todo-item,
.notice-item {
  border-bottom: 1px solid #eeeeee;
  min-height: 66px;
}

.notice-text {
  white-space: normal;
  line-height: 1.5;
}

.menu-card {
  height: 118px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 6px;
}

.menu-title {
  font-size: 14px;
  color: #333;
}

.empty-box {
  padding: 40px;
  color: #999;
  text-align: center;
}

/* splitpanes の境界線 */
:deep(.splitpanes__splitter) {
  background: #e0e0e0;
  width: 5px;
}

:deep(.splitpanes__splitter:hover) {
  background: #29b6f6;
}
</style>
