<!-- StaffDetailPane.vue 選択スタッフの申請詳細フォーム -->
<script setup>
import FormVuetifyContainer from '@/components/forms/FormVuetifyContainer.vue'

defineProps({
    todo: { type: Object, required: true },
    row: { type: Object, default: null },
    refreshTick: { type: Number, default: 0 },
})

const emit = defineEmits(['approval-done'])
</script>

<template>
  <div v-if="!row" class="pane-card empty-state">
    <div class="text-subtitle-1 text-medium-emphasis mt-4">
      一覧からスタッフを選択してください
    </div>
    <div class="text-caption text-disabled mt-1">
      選択すると申請内容がここに表示されます
    </div>
  </div>

  <div v-else class="pane-card d-flex flex-column">
    <div class="pane-scroll form-scroll flex-grow-1 overflow-auto">
      <FormVuetifyContainer
        :key="`${todo?.sub_category_code}:${row?.staff_id || row?.staff_code}:${refreshTick}`"
        :ApplicationType="todo?.sub_category_code"
        @approval-done="emit('approval-done', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.pane-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  background: #fff;
}

.pane-scroll {
  min-height: 0;
}

.form-scroll :deep(.container-card) {
  height: auto;
  min-height: 100%;
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
