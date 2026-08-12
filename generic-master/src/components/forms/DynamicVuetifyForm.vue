<script setup>
import { computed, ref } from 'vue'
import { buildRules } from '@/composables/useRuleFactory'
import FieldHistoryLabel from '@/components/forms/fields/FieldHistoryLabel.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  mode: { type: String, default: 'self' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  showSubmit: { type: Boolean, default: true },
  sqltags: { type: Object, default: null },
  tabConfig: { type: Object, default: () => ({}) },
  commonParams: { type: Object, default: () => ({}) },
  staffCode: { type: String, default: '' },
  isRepeatable: { type: Boolean, default: false },
  approvedData: { type: Object, default: null }, // 変更前データ。key は formData と同じ
})

const staffCode = computed(() =>props.staffCode)

const recordId = computed(() => props.modelValue?.record_id)

// 変更前ラベルを表示するかどうか
const showHistory = computed(() => {
  return !!props.approvedData && Object.keys(props.approvedData).length > 0
})

console.log("DynamicVuetifyForm.vue.props===========",props)

const emit = defineEmits(['update:modelValue', 'submit', 'saved'])
//const dataStore = useDataStore()
const saving = ref(false)

const formRef = ref()

const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const visibleFields = computed(() =>
  props.fields.filter(field => field && field.showable !== 'hide')
)

const normalFields = computed(() =>
  visibleFields.value.filter(
    field => field.group !== 'attachment'
  )
)

const attachmentFields = computed(() =>
  visibleFields.value.filter(
    field => field.group === 'attachment'
  )
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

// readonly 時はクリア×ボタンとカレンダーアイコンを出さない
function mergedProps(field) {
  const base = field.props || {}
  if (!props.readonly) return base

  const overrides = { clearable: false }
  if (field.component === 'v-date-input') {
    overrides['prepend-icon'] = ''
  }
  return { ...base, ...overrides }
}

// readonly のネイティブ date input はカレンダーピッカーが残るため text で表示する
function fieldType(field) {
  if (field.component === 'v-date-input') return undefined
  if (props.readonly && field.type === 'date') return 'text'
  return field.type
}

function displayValue(field) {
  const value = formData.value?.[field.key]
  const isDate = field.component === 'v-date-input' || field.type === 'date'
  if (!isDate) return value
  if (props.readonly && field.component !== 'v-date-input') {
    return normalizeDateValue(value)
  }
  return toDisplayValue(field, value)
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

//送信処理
async function submit() {
  const result = await formRef.value.validate()
  console.log("validate",result)
  if (!result.valid) {
    return
  }
  emit('submit', formData.value)
}

defineExpose({
  submit,
  validate: () => formRef.value?.validate(),
})
</script>

<template>
  <v-form @submit.prevent="submit" ref="formRef">
    <v-row dense>
      <v-col
        v-for="field in normalFields"
        :key="field.key"
        cols="12"
        sm="6"
        md="4"
      >
        <FieldHistoryLabel
          v-if="showHistory"
          :field="field"
          :approved-value="approvedData?.[field.key]"
          :current-value="formData[field.key]"
        />
        <component
          :is="field.component || 'v-text-field'"
          :model-value="displayValue(field)"
          v-bind="mergedProps(field)"
          :label="field.label"
          :type="fieldType(field)"
          :readonly="readonly || field.readonly"
          :disabled="disabled || field.disabled"
          :items="field.items || field.props?.items || []"
          :item-title="field.props?.itemTitle || field.props?.['item-title'] || 'label'"
          :item-value="field.props?.itemValue || field.props?.['item-value'] || 'value'"
          :rules="readonly ? [] : buildRules(field)"
          @update:model-value="value => updateField(field, value)"
          :staffCode="staffCode"
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

    <template v-if="attachmentFields.length">
      <v-divider class="my-6" />

      <v-expansion-panels
        multiple
        variant="accordion"
      >
        <v-expansion-panel
          v-for="field in attachmentFields"
          :key="field.key"
          :value="field.key"
        >
          <v-expansion-panel-title>
            {{ field.label }}
          </v-expansion-panel-title>

          <v-expansion-panel-text eager>
            <component
              :is="field.component || 'v-text-field'"
              :model-value="
                field.component === 'v-date-input' || field.type === 'date'
                  ? toDisplayValue(field, formData[field.key])
                  : formData[field.key]
              "
              v-bind="field.props || {}"
              :label="field.label"
              :type="field.component === 'v-date-input' ? undefined : field.type"
              :readonly="readonly || field.readonly"
              :disabled="disabled || field.disabled"
              :items="field.items || field.props?.items || []"
              :item-title="field.props?.itemTitle || field.props?.['item-title'] || 'label'"
              :item-value="field.props?.itemValue || field.props?.['item-value'] || 'value'"
              @update:model-value="value => updateField(field, value)"
              :staffCode="staffCode"
              :recordId="recordId"
              :is-repeatable="isRepeatable"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

  </v-form>
</template>