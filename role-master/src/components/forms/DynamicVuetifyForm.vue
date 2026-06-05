<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/DataStore'
// import { buildSaveParams } from '@/composables/formParamBuilder'
import { buildRules } from '@/composables/useRuleFactory'

const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  mode: { type: String, default: 'self' },
  disabled: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  showSubmit: { type: Boolean, default: true },
  sqltags: { type: Object, default: null },
  tabConfig: { type: Object, default: () => ({}) },
  commonParams: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'submit', 'saved'])
const dataStore = useDataStore()
const saving = ref(false)

const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const visibleFields = computed(() =>
  props.fields.filter(field => field && field.showable !== 'hide')
)

// 表示用：Date オブジェクトに変換
function toDisplayValue(field, value) {
  if (field.component !== 'v-date-input' && field.type !== 'date') return value
  if (value == null || value === '') return null
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const normalized = value.replace(/\//g, '-')
    const d = new Date(normalized + 'T00:00:00')
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

// 保存用：YYYY-MM-DD 文字列に変換
function normalizeDateValue(value) {
  if (value == null || value === '') return ''
  if (value instanceof Date) {
    const yyyy = value.getFullYear()
    const mm = String(value.getMonth() + 1).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  if (typeof value === 'string') return value.replace(/\//g, '-').slice(0, 10)
  return ''
}

// フィールド更新（field オブジェクトと新しい値を受け取る）
function updateField(field, value) {
  let newValue = value
  if (field.component === 'v-date-input' || field.type === 'date') {
    newValue = normalizeDateValue(value)
  }
  emit('update:modelValue', {
    ...(props.modelValue || {}),
    [field.key]: newValue,
  })
}

// 送信処理
async function submit() {
  if (!props.sqltags?.save) {
    emit('submit', formData.value)
    return
  }

  saving.value = true

  try {
    const {
      id,
      request_id,
      request_data,
      source_type,
      submitted_at,
      submitted_by,
      approved_at,
      approved_by,
      created_at,
      updated_at,
      ...cleanData
    } = formData.value

    const saveData = {
      ...cleanData,
      request_data: {
        ...cleanData,
      },
    }

    console.log('saveData:', saveData)

    const result = await dataStore.runSave(
      props.sqltags.save,
      saveData,
      props.commonParams,
    )

    emit('saved', result)
    emit('submit', saveData)
  } catch (error) {
    console.error('DynamicVuetifyForm submit error:', error)
  } finally {
    saving.value = false
  }
}

function getFieldItems(field) {
  // 1. field.items が中身ありなら優先
  if (Array.isArray(field.items) && field.items.length > 0) {
    return field.items
  }

  // 2. props.items
  if (
    field.itemsKey &&
    Array.isArray(props.items?.[field.itemsKey]) &&
    props.items[field.itemsKey].length > 0
  ) {
    return props.items[field.itemsKey]
  }

  // 3. Pinia Store master
  if (
    field.masterKey &&
    Array.isArray(dataStore.formMasters?.[field.masterKey])
  ) {
    return dataStore.formMasters[field.masterKey]
  }

  // 4. field.props.items
  if (Array.isArray(field.props?.items)) {
    return field.props.items
  }

  return []
}

// function getItemTitle(field) {
//   return field.itemTitle
//     || field.item_title
//     || field.props?.itemTitle
//     || field.props?.item_title
//     || field.props?.['item-title']
//     || 'label'
// }

// function getItemValue(field) {
//   return field.itemValue
//     || field.item_value
//     || field.props?.itemValue
//     || field.props?.item_value
//     || field.props?.['item-value']
//     || 'value'
// }

function cleanProps(field) {
  const {
    items,
    itemTitle,
    itemValue,
    item_title,
    item_value,
    'item-title': itemTitleKebab,
    'item-value': itemValueKebab,
    ...rest
  } = field.props || {}

  return rest
}

</script>

<template>
  <v-form @submit.prevent="submit">
    <v-row dense>
      <v-col
        v-for="field in visibleFields"
        :key="field.key"
        cols="12"
        sm="6"
        md="4"
      >
        <!-- {{ field.key }}: {{ getFieldItems(field) }} -->
        <component
          :is="field.component || 'v-text-field'"
          :model-value="
            field.component === 'v-date-input' || field.type === 'date'
              ? toDisplayValue(field, formData[field.key])
              : formData[field.key]
          "
          v-bind="cleanProps(field)"
          :label="field.label"
          :type="field.component === 'v-date-input' ? undefined : field.type"
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :items="getFieldItems(field)"
          item-title="label"
          item-value="value"
          :rules="buildRules(field)"
          @update:model-value="value => updateField(field, value)"
        />
      </v-col>
    </v-row>

    <v-row v-if="showSubmit">
      <v-col cols="12" class="text-right">
        <v-btn color="primary" type="submit" :loading="saving" :disabled="props.disabled">
          保存
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

