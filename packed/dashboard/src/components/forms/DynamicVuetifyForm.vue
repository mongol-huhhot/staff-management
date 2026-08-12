<script setup>
import { computed, ref } from 'vue'
import { buildRules } from '@/composables/useRuleFactory'
import FieldHistoryLabel from '@/components/forms/fields/FieldHistoryLabel.vue'
import ApprovedImageDialog from '@/components/forms/fields/ApprovedImageDialog.vue'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  fields: { type: Array, required: true },
  mode: { type: String, default: 'self' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  showSubmit: { type: Boolean, default: true },
  controls: { type: Object, default: null },
  chipControls: { type: Object, default: null },
  sqlTags: { type: Object, default: null },
  tabConfig: { type: Object, default: () => ({}) },
  commonParams: { type: Object, default: () => ({}) },
  staffCode: { type: String, default: '' },
  isRepeatable: { type: Boolean, default: false },
  approvedData: { type: Object, default: null }, // 変更前（承認済）データ。key は formData と同じ
})

const staffCode = computed(() =>props.staffCode)

const recordId = computed(() => props.modelValue?.record_id)

const controls = computed(() =>props.controls?.[formData.value?.request_status ?? 'tmp'] ?? {})
const chipControls = computed(() =>props.chipControls?.[formData.value?.request_status ?? 'tmp'] ?? {})

const approvedRecordId = computed(
  () => props.approvedData?.source_request_id ?? null
)

// 変更前ラベルを表示するかどうか
const showHistory = computed(() => {
  if (!props.approvedData || !Object.keys(props.approvedData).length) return false

  if (formData.value?.request_status === 'approved') return false

  return true
})

console.log("DynamicVuetifyForm.vue.props===========",props)
console.log("chipControls", chipControls)
const emit = defineEmits(['update:modelValue', 'submit', 'saved', 'approval'])

// 承認側の操作ボタン（buttonRules の approve / returnBack / reject。submitted 時のみ show）
const approvalControls = computed(() => {
  const rules = {}
  for (const action of ['approve', 'returnBack', 'reject']) {
    const rule = controls.value?.[action]
    if (rule?.show) rules[action] = rule
  }
  return rules
})

function statusStyle(status) {
  return props.chipControls?.[status] ?? {}
}

function actionLabel(rule) {
  return rule.label || statusStyle(rule.status).title || ''
}

function emitApproval(rule) {
  emit('approval', {
    new_status: rule.status,
    label: actionLabel(rule),
    request: formData.value,
  })
}
const saving = ref(false)

const formRef = ref()
const valid = ref(false)

const validate = async () => {
  const result = await formRef.value?.validate()
  valid.value = result.valid
  console.log("valid.value===",result.valid)
  return result.valid
}

defineExpose({
  validate
})



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

console.log("normalFields", normalFields)

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
</script>

<template>
  <v-form @submit.prevent ref="formRef" v-model="valid">

    <v-row >
      <v-col cols="12" class="text-right">
        <div class="d-flex ga-2">
          <v-chip
          :color="chipControls?.color"
          variant="flat"
          class="ml-2"
          :prepend-icon="chipControls?.icon"
        >
          {{ chipControls?.title }}
        </v-chip>
        </div>
      </v-col>
    </v-row>

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
          density="compact"
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
          validate-on="input"
          :staffCode="staffCode"
        />
      </v-col>
    </v-row>

    <v-row v-if="showSubmit">
      <v-col cols="12" class="text-right">
        <v-btn
          v-for="(rule, action) in approvalControls"
          :key="action"
          class="me-2"
          variant="flat"
          :color="statusStyle(rule.status).color"
          :prepend-icon="statusStyle(rule.status).icon"
          :disabled="props.disabled || rule.disabled"
          @click="emitApproval(rule)"
        >
          {{ actionLabel(rule) }}
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
            <v-spacer />
            <div
              v-if="showHistory && approvedRecordId && field.props?.documentType"
              @click.stop
            >
              <ApprovedImageDialog
                :document-type="field.props.documentType"
                :category-code="field.props.categoryCode"
                :owner-type="field.props.ownerType || 'staff'"
                :staff-code="staffCode"
                :record-id="approvedRecordId"
              />
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text eager>
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
              :recordId="recordId"
              :is-repeatable="isRepeatable"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

  </v-form>
</template>
