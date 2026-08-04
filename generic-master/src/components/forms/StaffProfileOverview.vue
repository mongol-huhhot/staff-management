<!-- StaffProfileOverview.vue 全カテゴリの現在値を一括表示する参照専用ビュー（プレビュータブの中身） -->
<script setup>
import { ref, watch } from 'vue'
import DynamicVuetifyForm from '@/components/forms/DynamicVuetifyForm.vue'
import RepeatableFormWrapper from '@/components/forms/RepeatableFormWrapper.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  profile: { type: Object, default: () => ({}) },
  fieldsMap: { type: Object, default: () => ({}) },
  staffCode: { type: String, default: '' },
  loading: { type: Boolean, default: false },
})

// 初期状態は全カテゴリ展開
const openPanels = ref([])

watch(
  () => props.categories,
  (categories) => {
    openPanels.value = (categories || []).map(cat => cat.sub_category_code)
  },
  { immediate: true }
)

function isRepeatableCategory(cat) {
  return cat?.data_structure === 'repeatable'
}

// フォームに渡すモデル：repeatable は配列、single はオブジェクトに揃える
function getPreviewModel(cat) {
  const data = props.profile?.[cat.sub_category_code]

  if (isRepeatableCategory(cat)) {
    return Array.isArray(data) ? data : []
  }

  return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {}
}

// データがあるフォームを表示する
function hasData(cat) {
  const model = getPreviewModel(cat)

  if (isRepeatableCategory(cat)) {
    return model.length > 0
  }

  return Object.keys(model).length > 0
}
</script>

<template>
  <v-progress-linear v-if="loading" indeterminate class="mb-3" />

  <v-expansion-panels
    v-model="openPanels"
    multiple
    variant="accordion"
  >
    <v-expansion-panel
      v-for="cat in categories"
      :key="cat.sub_category_code"
      :value="cat.sub_category_code"
    >
      <v-expansion-panel-title class="text-subtitle-2">
        {{ cat.remarks }}
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <div v-if="!hasData(cat)" class="text-medium-emphasis text-body-2">
          データがありません。
        </div>

        <RepeatableFormWrapper
          v-else-if="isRepeatableCategory(cat)"
          :model-value="getPreviewModel(cat)"
          :label="cat.remarks"
          :children="fieldsMap[cat.sub_category_code] || []"
          :staff-code="staffCode"
          :disabled="true"
        />

        <DynamicVuetifyForm
          v-else
          :model-value="getPreviewModel(cat)"
          :fields="fieldsMap[cat.sub_category_code] || []"
          :staff-code="staffCode"
          :is-repeatable="false"
          :disabled="true"
          :show-submit="false"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
