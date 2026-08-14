<script setup>
import { computed, ref } from 'vue'
import { buildRules } from '@/composables/useRuleFactory'

const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  mode: { type: String, default: 'self' },
  disabled: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  showSubmit: { type: Boolean, default: true },
  controls: { type: Object, default: null },
  chipcontrols: { type: Object, default: null },
  sqltags: { type: Object, default: null },
  tabConfig: { type: Object, default: () => ({}) },
  commonParams: { type: Object, default: () => ({}) },
  staffCode: { type: String, default: '' },
  isRepeatable: { type: Boolean, default: false },
})

const staffCode = computed(() =>props.staffCode)

const recordId = computed(() => props.modelValue?.recordId)

const controls = computed(() =>props.controls?.[formData.value?.request_status ?? 'tmp'] ?? {})
const chipcontrols = computed(() =>props.chipcontrols?.[formData.value?.request_status ?? 'tmp'] ?? {})

console.log("DynamicVuetifyForm.vue.props===========",props)

const emit = defineEmits(['update:modelValue', 'submit', 'saved'])
const approvalControls = computed(() => {
  const rules = {}
  for (const action of ['approve', 'returnBack', 'reject']) {
    const rule = controls.value?.[action]
    if (rule?.show) rules[action] = rule
  }
  return rules
})

function emitApproval(rule) {
  emit('approval', {
    // new_status: rule.status,
    // label: actionLabel(rule),
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
// async function submit(status) {
//   const result = await formRef.value.validate()
//   console.log("validate",result)
//   if (!result.valid) {
//     return
//   }
//     emit('submit', status)
// }

// 送信処理
async function submit(request_status) {
  const result = await formRef.value.validate()
  console.log("validate",result)
  if (!result.valid) {
    return
  }

  if(request_status){
    formData.value.new_request_status = request_status
  }
    emit('submit', formData.value)
}

async function newrequest() {
  if (formData.value) {
    formData.value.id = ''
    formData.value.request_status = 'tmp'
  }
}

</script>

<template>
  <v-form @submit.prevent="submit" ref="formRef" v-model="valid">

    <!-- 申請状態・承認者コメント -->
    <v-card
      variant="tonal"
      color="primary"
      class="mb-6"
    >
      <v-card-text>
        <div
          class="d-flex flex-column flex-md-row align-md-center ga-3"
        >
          <div class="d-flex align-center flex-shrink-0">
            <span class="text-body-2 font-weight-medium me-2">
              申請状態
            </span>

            <v-chip
              :color="chipcontrols?.color"
              :prepend-icon="chipcontrols?.icon"
              variant="flat"
              size="small"
            >
              {{ chipcontrols?.title }}
            </v-chip>
          </div>

          <v-alert
            v-if="formData?.approval_comment"
            type="info"
            variant="tonal"
            
            class="flex-grow-1"
          >
            <span class="font-weight-bold">承認者コメント：</span>
            {{ formData.approval_comment }}
          </v-alert>
        </div>
      </v-card-text>
    </v-card>

    <!-- 通常入力項目 -->
    <v-row dense>
      <v-col
        v-for="field in normalFields"
        :key="field.key"
        cols="12"
        sm="6"
        md="4"
      >
        <component
          density="compact"
          :is="field.component || 'v-text-field'"
          :model-value="
            field.component === 'v-date-input' || field.type === 'date'
              ? toDisplayValue(field, formData[field.key])
              : formData[field.key]
          "
          v-bind="field.props || {}"
          :label="field.label"
          :type="field.component === 'v-date-input' ? undefined : field.type"
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :items="field.items || field.props?.items || []"
          :item-title="field.props?.itemTitle || field.props?.['item-title'] || 'label'"
          :item-value="field.props?.itemValue || field.props?.['item-value'] || 'value'"
          :rules="buildRules(field)"
          @update:model-value="value => updateField(field, value)"
          validate-on="input"
          :variant="field.variant"
          :staffCode="staffCode"
        />
      </v-col>
    </v-row>

    <v-row v-if="showSubmit">
      <v-col cols="12" class="text-right">
        <v-btn class="me-2" color="info" @click="newrequest()"  
        :loading="saving" :disabled="props.disabled  || controls?.newRequest?.disabled" v-show="controls?.newRequest?.show && !props.isRepeatable" >
        新規申請作成
        </v-btn>
        <v-btn class="me-2" color="secondary" @click="submit('draft')"  
        :loading="saving" :disabled="props.disabled  || controls?.draftSave?.disabled" v-show="controls?.draftSave?.show" >
        下書き保存
      </v-btn>
        <v-btn class="me-2" color="primary" @click="emitApproval(rule)" 
        :loading="saving" :disabled="props.disabled || !valid || controls?.submit?.disabled" v-show="controls?.draftSave?.show">
        登録・変更申請
      </v-btn>
        <v-btn class="me-2" color="error" @click="emitApproval(rule)"  
        :loading="saving" :disabled="props.disabled  || controls?.delete?.disabled" v-show="controls?.delete?.show" >
        削除申請
      </v-btn>
      </v-col>
    </v-row>

      <v-card
      v-if="attachmentFields.length"
      variant="flat"
        v-for="field in attachmentFields"
        :key="field.key"
      >

    <v-divider class="my-6" />

      <v-card-title>
          {{ field.label }}
        </v-card-title>

        <v-card-text>
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
            :readonly="field.readonly"
            :disabled="disabled || field.disabled"
            :items="field.items || field.props?.items || []"
          :item-title="field.props?.itemTitle || field.props?.['item-title'] || 'label'"
          :item-value="field.props?.itemValue || field.props?.['item-value'] || 'value'"
            :rules="buildRules(field)"
          :requestStatus="formData?.request_status"
            @update:model-value="value => updateField(field, value)"
          :staffCode="staffCode"
          :recordId="recordId"
           :is-repeatable="isRepeatable"
          />
        </v-card-text>
      </v-card>
    
  </v-form>
</template>
