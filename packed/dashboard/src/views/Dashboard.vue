<script setup>
import { ref, computed, onMounted } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { useDataStore } from '@/stores/DataStore'
import TodoPane from '@/components/dashboard/TodoPane.vue'
import NoticePane from '@/components/dashboard/NoticePane.vue'
import MenuPane from '@/components/dashboard/MenuPane.vue'
import StaffListPane from '@/components/dashboard/StaffListPane.vue'
import StaffDetailPane from '@/components/dashboard/StaffDetailPane.vue'

const appConfigStore = useAppConfigStore()
const dataStore = useDataStore()
appConfigStore.loadFromWindow()

const { loadTodos, pendingStatuses } = dataStore
const todos = computed(() => dataStore.data.todos)

const horizontal_vertical = ref('horizontal') // 'horizontal' or 'vertical'

const toggleMode = () => {
    horizontal_vertical.value = horizontal_vertical.value === 'horizontal' ? 'vertical' : 'horizontal'
}

const notices = computed(() => appConfigStore?.DASHBOARD_CONFIG?.notices || [])
const menus = computed(() => appConfigStore?.DASHBOARD_CONFIG?.menus || [])

onMounted(async () => {
    await loadTodos()
    const type = new URL(window.location.href).searchParams.get('type')
    if (type) {
        const todo = todos.value.find(t => t.sub_category_code === type)
        if (todo) handleTodoConfirm(todo)
    }
})

// 処理待ちの選択状態。currentTodo の有無が中央・右ペインの表示を切り替える
const currentTodo = ref(null)
const selectedRow = ref(null)

const staffListPaneRef = ref(null)
const formRefreshTick = ref(0)

// 処理待ちから開くスタッフ一覧の絞り込み条件。currentTodo に連動する
const staffListFilter = computed(() => {
    if (!currentTodo.value) return null
    return {
        sub_category_code: currentTodo.value.sub_category_code || '',
        request_statuses: pendingStatuses(),
    }
})

// 選択中カテゴリを URL クエリ（?type=address 等）に反映する
function setTypeQuery(type) {
    const url = new URL(window.location.href)
    if (type) url.searchParams.set('type', type)
    else url.searchParams.delete('type')
    window.history.replaceState(null, '', url)
}

// 処理待ちの「確認」ボタン。中央ペインをスタッフ一覧に切り替える
function handleTodoConfirm(item) {
    currentTodo.value = item
    selectedRow.value = null
    staffListPaneRef.value?.clearSelection()
    setTypeQuery(item?.sub_category_code || null)
}

// スタッフ一覧で行選択。選択スタッフをフォームコンテナに渡す
function handleStaffSelected(row) {
    selectedRow.value = row
    dataStore.params.attributes = row || {}
}

async function closeTodo() {
    currentTodo.value = null
    selectedRow.value = null
    dataStore.params.attributes = {}
    setTypeQuery(null)
    await loadTodos()
}

// 承認操作後の画面更新: フォーム再読込・スタッフ一覧・処理待ち件数
async function refreshAfterApproval({ clearSelection = false } = {}) {
    if (clearSelection) {
        selectedRow.value = null
    }
    formRefreshTick.value++
    await staffListPaneRef.value?.loadData()
    await loadTodos()
}

// メニュー選択。今後 menu.url への遷移をここに実装する
function handleMenuSelect(menu) {
    console.log('menu select:', menu)
}
</script>

<template>
  <v-app>
    <v-layout>
      <v-main>
        <div class="dashboard">
          <splitpanes class="main-split" :horizontal="horizontal_vertical !== 'horizontal'">
            <!-- 左 pane 処理待ち -->
            <pane size="30" min-size="20">
              <TodoPane
                :todos="todos"
                :horizontal="horizontal_vertical === 'horizontal'"
                @confirm="handleTodoConfirm"
                @toggle-mode="toggleMode"
              />
            </pane>

            <!-- 中央 pane 通常はお知らせ。処理待ち選択中はスタッフ一覧 -->
            <pane size="34" min-size="20">
              <NoticePane v-if="!currentTodo" :notices="notices" />

              <StaffListPane
                v-else
                ref="staffListPaneRef"
                :todo="currentTodo"
                :filter="staffListFilter"
                @close="closeTodo"
                @row-selected="handleStaffSelected"
                @approved="refreshAfterApproval"
              />
            </pane>

            <!-- 右 pane 通常はメニュー。処理待ち選択中は詳細フォーム -->
            <pane size="36" min-size="22">
              <MenuPane v-if="!currentTodo" :menus="menus" @select="handleMenuSelect" />

              <StaffDetailPane
                v-else
                :todo="currentTodo"
                :row="selectedRow"
                :refresh-tick="formRefreshTick"
                @approval-done="refreshAfterApproval"
              />
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

.main-split :deep(.splitpanes__splitter) {
  background: transparent;
  position: relative;
}

.main-split :deep(.splitpanes__splitter)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 3px;
  background: #cfd8dc;
  transition: background-color 0.2s ease;
}

.main-split :deep(.splitpanes__splitter:hover)::before {
  background: #29b6f6;
}

.main-split.splitpanes--vertical :deep(.splitpanes__splitter) {
  width: 9px;
}

.main-split.splitpanes--vertical :deep(.splitpanes__splitter)::before {
  width: 3px;
  height: 40px;
}

.main-split.splitpanes--horizontal :deep(.splitpanes__splitter) {
  height: 9px;
}

.main-split.splitpanes--horizontal :deep(.splitpanes__splitter)::before {
  width: 40px;
  height: 3px;
}
</style>
