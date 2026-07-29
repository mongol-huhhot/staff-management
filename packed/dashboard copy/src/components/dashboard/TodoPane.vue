<!-- TodoPane.vue 処理待ちパネル -->
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  todos: {
    type: Array,
    default: () => [],
  },
  horizontal: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['confirm', 'toggle-mode'])

const currentTab = ref('todo')

// 各項目の count 合計。count 未設定（静的設定）の間は件数を表示する
const totalCount = computed(() => {
  const hasCounts = props.todos.some(item => item.count != null)
  if (!hasCounts) return props.todos.length
  return props.todos.reduce((s, item) => s + (Number(item.count) || 0), 0)
})
</script>

<template>
  <v-card class="pane-card" flat>
    <v-tabs v-model="currentTab" density="compact" color="light-blue">
      <v-tab value="todo">
        処理待ち
        <v-badge v-if="totalCount" :content="totalCount" color="red" inline />
      </v-tab>
      <!-- <v-tab value="done">已办</v-tab> -->

      <v-spacer />

      <v-tooltip>
        <template #activator="{ props: tooltipProps }">
          <v-btn icon variant="text" color="light-blue" @click="emit('toggle-mode')" v-bind="tooltipProps">
            <v-icon>{{ horizontal ? 'mdi-arrow-expand-horizontal' : 'mdi-arrow-expand-vertical' }}</v-icon>
          </v-btn>
        </template>
        <span>縦横切替え</span>
      </v-tooltip>
    </v-tabs>

    <v-window v-model="currentTab">
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
              <v-badge v-if="item.count" :content="item.count" color="red" inline />
              <v-btn
                size="small"
                rounded
                variant="tonal"
                color="light-blue"
                @click="emit('confirm', item)"
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
</template>

<style scoped>
.pane-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.todo-item {
  border-bottom: 1px solid #eeeeee;
  min-height: 66px;
}

.empty-box {
  padding: 40px;
  color: #999;
  text-align: center;
}
</style>
