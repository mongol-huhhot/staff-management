<!-- StaffDetailPane.vue 選択スタッフの詳細フォーム（未選択時は案内を表示） -->
<script setup>
import { useDataStore } from '@/stores/DataStore'
import FormVuetifyContainer from '@/components/forms/FormVuetifyContainer.vue'

const dataStore = useDataStore()
</script>

<template>
  <div v-if="!dataStore.states?.currentRow" class="pane-card empty-state">
    <div class="text-subtitle-1 text-medium-emphasis mt-4">
      一覧からスタッフを選択してください
    </div>
    <div class="text-caption text-disabled mt-1">
      選択するとスタッフ情報がここに表示されます
    </div>
  </div>

  <div v-else class="pane-card d-flex flex-column">
    <div class="pane-scroll flex-grow-1 overflow-auto">
      <FormVuetifyContainer />
    </div>
  </div>
</template>

<style scoped>
.pane-card {
  height: 100%;
  overflow: hidden;
  background: #fff;
}

.pane-scroll {
  min-height: 0;
  overflow-y: auto;
}

.pane-scroll :deep(.container-card) {
  height: auto;
  min-height: calc(100% - 24px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
</style>
