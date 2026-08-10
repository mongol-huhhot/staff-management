<script setup>
import { computed, ref } from 'vue'
import { buildRules } from '@/composables/useRuleFactory'

const props = defineProps({
  modelValue: {type: Object,required: true,},
  fields: {type: Array,required: true,},
  mode: {type: String,default: 'self',},
  disabled: {type: Boolean,default: false,},
  items: {type: Array,default: () => [],},
  showSubmit: {type: Boolean,default: true,},
  controls: {type: Object,default: null,},
  chipcontrols: {type: Object,default: null,},
  sqltags: {type: Object,default: null,},
  tabConfig: {type: Object,default: () => ({}),},
  commonParams: {type: Object,default: () => ({}),},
  staffCode: {type: String,default: '',},
  isRepeatable: {type: Boolean,default: false,},
})

console.log("props",props)

const emit = defineEmits([
  'update:modelValue',
  'request-action',
])

const formRef = ref(null)
const valid = ref(false)

const formData = computed({
  get: () => props.modelValue || {},
  set: value => emit('update:modelValue', value),
})

const editableStatuses = ['approved', 'submitted', 'rejected']

const isFormReadonly = computed(() => {
  return editableStatuses.includes(formData.value?.request_status)
})

const currentRequestStatus = computed(
  () => formData.value?.request_status || 'tmp'
)

const controls = computed(
  () => props.controls?.[currentRequestStatus.value] || {}
)

const chipcontrols = computed(
  () => props.chipcontrols?.[currentRequestStatus.value] || {}
)

const staffCode = computed(() => props.staffCode)

const recordId = computed(
  () => formData.value?.id || ''
)

const visibleFields = computed(() =>
  props.fields.filter(
    field => field && field.showable !== 'hide'
  )
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

const canTerminate = computed(() => {
  console.log(props.tabConfig?.allow_terminate)
  console.log(Boolean(formData.value?.record_id))
  console.log(controls.value?.delete?.show)
  return (
    props.tabConfig?.allow_terminate === true &&
    Boolean(formData.value?.record_id) &&
    controls.value?.delete?.show === true
  )
})

const terminateButtonLabel = computed(
  () => controls.value?.delete?.label || '利用終了申請'
)

function toDisplayValue(field, value) {
  if (
    field.component !== 'v-date-input' &&
    field.type !== 'date'
  ) {
    return value
  }

  if (value == null || value === '') {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value
      .replace(/\//g, '-')
      .slice(0, 10)

    const date = new Date(`${normalized}T00:00:00`)

    return Number.isNaN(date.getTime())
      ? null
      : date
  }

  return null
}

function normalizeDateValue(value) {
  if (value == null || value === '') {
    return ''
  }

  if (value instanceof Date) {
    const yyyy = value.getFullYear()
    const mm = String(value.getMonth() + 1).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')

    return `${yyyy}-${mm}-${dd}`
  }

  if (typeof value === 'string') {
    return value
      .replace(/\//g, '-')
      .slice(0, 10)
  }

  return ''
}

function updateField(field, value) {
  let newValue = value

  if (
    field.component === 'v-date-input' ||
    field.type === 'date'
  ) {
    newValue = normalizeDateValue(value)
  }

  emit('update:modelValue', {
    ...formData.value,
    [field.key]: newValue,
  })
}

async function validate() {
  if (!formRef.value) {
    return true
  }

  const result = await formRef.value.validate()

  const isValid =
    typeof result === 'boolean'
      ? result
      : Boolean(result?.valid)

  valid.value = isValid

  return isValid
}

async function emitRequestAction(action) {
  /*
   * 下書きは入力途中の保存を許可する。
   * 登録・変更申請時だけ全入力項目を検証する。
   */
  if (action === 'submit') {
    const isValid = await validate()

    if (!isValid) {
      return
    }
  }

  emit('request-action', {
    action,
    request: {
      ...formData.value,
    },
  })
}

const requestStatus = computed(() => {
  return formData.value?.request_status
})

const requestTypeLabel = computed(() => {
  const labels = {
    create: '新規登録',
    update: '変更',
    delete: '削除',
  }

  return labels[formData.value?.request_type] ?? ''
})

const showApprovalComment = computed(() => {
  if (!formData.value?.approval_comment) {
    return false
  }

  return ['returned', 'rejected', 'approved'].includes(
    requestStatus.value
  )
})

const approvalCommentTitle = computed(() => {
  const titles = {
    returned: '差し戻し理由',
    rejected: '却下理由',
    approved: '承認者コメント',
  }

  return titles[requestStatus.value] ?? '承認者コメント'
})

const approvalCommentAlertType = computed(() => {
  const types = {
    returned: 'warning',
    rejected: 'error',
    approved: 'success',
  }

  return types[requestStatus.value] ?? 'info'
})

const showRequestComment = computed(() => {
  if (!formData.value?.request_comment) {
    return false
  }

  // 差し戻し中は修正理由を優先し、
  // 元の申請コメントは詳細欄へ移してもよい
  return ['submitted', 'approved'].includes(requestStatus.value)
})

const hasRequestDetails = computed(() => {
  return Boolean(
    formData.value?.requested_at ||
    formData.value?.requested_by ||
    formData.value?.approved_at ||
    formData.value?.approved_by
  )
})

function newRequest() {
  const requestType = formData.value?.record_id
    ? 'update'
    : 'create'

  formData.value = {
    ...formData.value,

    /*
     * 承認済み申請行そのものを更新しないよう、
     * 申請IDはクリアする。
     * record_idは正式データとの関連付けに使用するため維持する。
     */
    id: null,
    request_status: 'tmp',
    new_request_status: null,
    request_type: requestType,

    valid_from: null,
    request_comment: '',
    approval_comment: '',

    requested_at: null,
    requested_by: null,
    approved_at: null,
    approved_by: null,
    rejected_at: null,
    rejected_by: null,
  }
}

defineExpose({
  validate,
})
</script>

<template>
  <v-form
    
    ref="formRef"
    v-model="valid"
    :disabled="isFormReadonly"
    @submit.prevent="emitRequestAction('submit')"
  >
    <v-card
  variant="tonal"
  color="primary"
  class="mb-6"
>
  <v-card-text>
    <!-- 基本情報 -->
    <div class="d-flex flex-wrap align-center ga-4">
      <div class="d-flex align-center">
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

      <div
        v-if="requestTypeLabel"
        class="d-flex align-center ga-1"
      >
        <v-icon
          icon="mdi-file-edit-outline"
          size="small"
        />
        <span class="text-body-2 text-medium-emphasis">
          申請種別
        </span>
        <span class="text-body-2 font-weight-medium">
          {{ requestTypeLabel }}
        </span>
      </div>

      <div
        v-if="formData?.valid_from"
        class="d-flex align-center ga-1"
      >
        <v-icon
          icon="mdi-calendar-check-outline"
          size="small"
        />
        <span class="text-body-2 text-medium-emphasis">
          適用日
        </span>
        <span class="text-body-2 font-weight-medium">
          {{ formData.valid_from }}
        </span>
      </div>

      <div
        v-if="formData?.requested_at"
        class="d-flex align-center ga-1"
      >
        <v-icon
          icon="mdi-calendar-check-outline"
          size="small"
        />
        <span class="text-body-2 text-medium-emphasis">
          申請日
        </span>
        <span class="text-body-2 font-weight-medium">
          {{ formData.requested_at }}
        </span>
      </div>
    </div>

    <!-- 差し戻し・却下理由 -->
    <v-alert
      v-if="showApprovalComment"
      :type="approvalCommentAlertType"
      variant="tonal"
      class="mt-4"
    >
      <div class="font-weight-bold mb-1">
        {{ approvalCommentTitle }}
      </div>

      <div class="text-body-2">
        {{ formData.approval_comment }}
      </div>
    </v-alert>

    <!-- 申請コメント -->
    <div
      v-if="showRequestComment"
      class="mt-4"
    >
      <div class="text-caption text-medium-emphasis mb-1">
        申請コメント
      </div>

      <div class="text-body-2">
        {{ formData.request_comment }}
      </div>
    </div>
  </v-card-text>
</v-card>

    <v-row dense>
      <v-col
        v-for="field in normalFields"
        :key="field.key"
        cols="12"
        sm="6"
        md="4"
      >
        <component
          class="custom-disabled"
          :is="field.component || 'v-text-field'"
          density="compact"
          :model-value="
            field.component === 'v-date-input' || field.type === 'date'
              ? toDisplayValue(field, formData[field.key])
              : formData[field.key]
          "
          v-bind="field.props || {}"
          :label="field.label"
          :type="
            field.component === 'v-date-input'
              ? undefined
              : field.type
          "
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :items="field.items || field.props?.items || []"
          :item-title="
            field.props?.itemTitle ||
            field.props?.['item-title'] ||
            'label'
          "
          :item-value="
            field.props?.itemValue ||
            field.props?.['item-value'] ||
            'value'
          "
          :rules="buildRules(field)"
          :variant="field.variant"
          :staff-code="staffCode"
          validate-on="input"
          @update:model-value="
            value => updateField(field, value)
          "
        />
      </v-col>
    </v-row>

    <v-row v-if="showSubmit">
      <v-col
        cols="12"
        class="text-right"
      >
        <v-btn
          v-show="
            controls?.newRequest?.show "
          class="me-2"
          color="info"
          :disabled="
            disabled ||
            controls?.newRequest?.disabled
          "
          @click="newRequest"
        >
          編集
        </v-btn>

        <v-btn
          v-show="controls?.draftSave?.show"
          class="me-2"
          color="secondary"
          :disabled="
            disabled ||
            controls?.draftSave?.disabled
          "
          @click="emitRequestAction('draft')"
        >
          下書き保存
        </v-btn>

        <v-btn
          v-show="controls?.submit?.show"
          class="me-2"
          color="primary"
          :disabled="
            disabled ||
            controls?.submit?.disabled
          "
          @click="emitRequestAction('submit')"
        >
          登録・変更申請
        </v-btn>

        <v-btn
          v-show="canTerminate"
          class="me-2"
          color="error"
          :disabled="
            disabled ||
            controls?.delete?.disabled
          "
          @click="emitRequestAction('terminate')"
        >
          {{ terminateButtonLabel ?? '利用終了申請'}}
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
          :type="
            field.component === 'v-date-input'
              ? undefined
              : field.type
          "
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :items="field.items || field.props?.items || []"
          :item-title="
            field.props?.itemTitle ||
            field.props?.['item-title'] ||
            'label'
          "
          :item-value="
            field.props?.itemValue ||
            field.props?.['item-value'] ||
            'value'
          "
          :rules="buildRules(field)"
          :request-status="formData?.request_status"
          :staff-code="staffCode"
          :record-id="recordId"
          :is-repeatable="isRepeatable"
          @update:model-value="
            value => updateField(field, value)
          "
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
  </v-form>
</template>

<style scoped>
/* disabled 時の薄くなる挙動（不透明度）を元に戻す */
:deep(.custom-disabled.v-input--disabled) {
  opacity: 0.7;
}

:deep(.custom-disabled .v-field--disabled) {
  opacity: 1;
  /* 必要に応じて文字色を readonly 風（黒や通常色）に固定 */
  color: inherit; 
}

/* 入力欄（テキスト部分）の文字色をはっきりさせる */
:deep(.custom-disabled .v-field__input) {
  -webkit-text-fill-color: currentColor; /* Safari対策 */
}


</style>