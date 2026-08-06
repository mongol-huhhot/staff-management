<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { showSnackbar } from '@/utils/SnackBar.vue'
import { buildSaveParams } from '@/composables/formParamBuilder'

const emit = defineEmits([
  'done',
])

const dataStore = useDataStore()

const requestDialog = ref(false)
const currentPayload = ref(null)
const requestValidFrom = ref(null)
const requestComment = ref('')
const actionRunning = ref(false)
const draftRunning = ref(false)

const actionDefinitions = {
  draft: {
    title: '下書き保存',
    confirmText: '下書き保存',
    successMessage: '下書きを保存しました',
    color: 'secondary',
  },
  submit: {
    title: '登録・変更申請',
    confirmText: '申請する',
    successMessage: '登録・変更を申請しました',
    color: 'primary',
  },
  terminate: {
    title: '利用終了申請',
    confirmText: '利用終了を申請する',
    successMessage: '利用終了を申請しました',
    color: 'error',
  },
}

const currentAction = computed(
  () => currentPayload.value?.action || ''
)

const currentDefinition = computed(
  () =>
    actionDefinitions[currentAction.value] ||
    actionDefinitions.submit
)

const commentRequired = computed(
  () => currentAction.value === 'terminate'
)

const validFromLabel = computed(
  () =>
    currentAction.value === 'terminate'
      ? '利用終了日'
      : '適用日'
)

const commentLabel = computed(() => {
  return commentRequired.value
    ? '利用終了理由（必須）'
    : '申請理由（任意）'
})

const confirmDisabled = computed(() => {
  if (!normalizeDateValue(requestValidFrom.value)) {
    return true
  }

  if (
    commentRequired.value &&
    !requestComment.value.trim()
  ) {
    return true
  }

  return false
})

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

function toDateInputValue(value) {
  const normalized = normalizeDateValue(value)

  if (!normalized) {
    return null
  }

  const date = new Date(`${normalized}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? null
    : date
}

function getLoginUserId() {
  return (
    dataStore.getLoginUser()?.user_id ||
    null
  )
}

function isEditableRequest(request) {
  return (
    Boolean(request?.id) &&
    ['draft', 'returned'].includes(
      request?.request_status
    )
  )
}

function resolveOperation(payload) {
  /*
   * draft・returnedは既存の進行中申請を更新する。
   *
   * approved・rejected・tmpは新しい申請行を作成する。
   * これにより承認済み申請履歴を上書きしない。
   */
  return isEditableRequest(payload?.request)
    ? 'update'
    : 'insert'
}

function resolveRequestType(payload) {
  if (payload?.action === 'terminate') {
    return 'terminate'
  }

  const currentType = payload?.request?.request_type

  if (
    currentType === 'create' ||
    currentType === 'update'
  ) {
    return currentType
  }

  return payload?.request?.record_id
    ? 'update'
    : 'create'
}

function resolveSqlTag(payload, operation) {
  const sqltags =
    payload?.tabConfig?.sqltags ||
    payload?.sqltags ||
    {}

  if (payload?.action === 'terminate') {
    /*
     * 以下のいずれの設定形式にも対応する。
     *
     * terminate: {
     *   insert: '...',
     *   update: '...'
     * }
     *
     * terminate_request: {
     *   insert: '...',
     *   update: '...'
     * }
     *
     * terminate_insert: '...'
     * terminate_update: '...'
     *
     * 専用SQLがなければ通常のinsert/updateを利用する。
     */
    return (
      sqltags?.terminate?.[operation] ||
      sqltags?.terminate_request?.[operation] ||
      sqltags?.[`terminate_${operation}`] ||
      sqltags?.[operation] ||
      ''
    )
  }

  return sqltags?.[operation] || ''
}

function buildRequestRow(
  payload,
  operation,
  newRequestStatus,
  validFrom,
  comment
) {
  const requestType = resolveRequestType(payload)

  const row = {
    ...(payload?.request || {}),

    data_type:
      payload?.request?.data_type ||
      payload?.tabCode ||
      null,

    valid_from:
      validFrom ||
      payload?.request?.valid_from ||
      null,

    request_comment:
      comment ??
      payload?.request?.request_comment ??
      '',

    request_type: requestType,
    new_request_status: newRequestStatus,
  }

  if (operation === 'insert') {
    /*
     * 元になったapproved/rejected申請のIDをINSERTへ持ち込まない。
     * record_idは正式データとの関連付けなので維持する。
     */
    row.id = null
    row.request_status = 'tmp'

    row.requested_at = null
    row.requested_by = null
    row.approved_at = null
    row.approved_by = null
    row.rejected_at = null
    row.rejected_by = null
    row.approval_comment = ''
  }

  return row
}

async function executeAction({
  payload,
  newRequestStatus,
  validFrom,
  comment,
}) {
  console.log("executeaction")
  if (!payload?.request) {
    showSnackbar(
      '保存対象の申請情報を取得できません',
      'error'
    )

    return false
  }

  const operation = resolveOperation(payload)
  const sqltag = resolveSqlTag(payload, operation)

  if (!sqltag) {
    showSnackbar(
      `${operation}用のSQLタグが設定されていません`,
      'error'
    )

    return false
  }

  const requestRow = buildRequestRow(
    payload,
    operation,
    newRequestStatus,
    validFrom,
    comment
  )

  const commonParams = {
    ...(payload?.commonParams || {}),
    user_id:
      //getLoginUserId() ||
      payload?.commonParams?.user_id ||
      null,
  }

  const params = buildSaveParams(
    requestRow,
    payload?.tabConfig || {},
    commonParams
  )

  try {
    const result = await dataStore.saveData(
      sqltag,
      params
    )

    if (!result) {
      console.log("non result",result)
      return false
    }

    showSnackbar(
      actionDefinitions[payload.action]?.successMessage ||
      '保存しました',
      'success'
    )

    emit('done', {
      action: payload.action,
      tabCode: payload.tabCode,
      index: payload.index,
      isRepeatable: payload.isRepeatable === true,
      result,
    })

    return true
  } catch (error) {
    console.error(
      'ApprovalActions executeAction error:',
      error
    )

    showSnackbar(
      '申請情報の保存に失敗しました',
      'error'
    )

    return false
  }
}

async function openRequestAction(payload) {
  if (
    !payload ||
    !['draft', 'submit', 'terminate'].includes(payload.action)
  ) {
    showSnackbar(
      '未対応の申請アクションです',
      'error'
    )

    return
  }

  if (payload.action === 'draft') {
    if (draftRunning.value) {
      return
    }

    draftRunning.value = true

    try {
      await executeAction({
        payload,
        newRequestStatus: 'draft',
        validFrom:
          normalizeDateValue(
            payload?.request?.valid_from
          ) || null,
        comment:
          payload?.request?.request_comment || '',
      })
    } finally {
      draftRunning.value = false
    }

    return
  }

  currentPayload.value = payload

  requestValidFrom.value = toDateInputValue(
    payload?.request?.valid_from
  )

  requestComment.value =
    payload?.request?.request_comment || ''

  requestDialog.value = true
}

function closeDialog() {
  if (actionRunning.value) {
    return
  }

  requestDialog.value = false
  currentPayload.value = null
  requestValidFrom.value = null
  requestComment.value = ''
}

async function runDialogAction() {
  if (
    !currentPayload.value ||
    confirmDisabled.value ||
    actionRunning.value
  ) {
    return
  }

  actionRunning.value = true

  try {
    const succeeded = await executeAction({
      payload: currentPayload.value,
      newRequestStatus: 'submitted',
      validFrom: normalizeDateValue(
        requestValidFrom.value
      ),
      comment: requestComment.value.trim(),
    })

    if (succeeded) {
      closeDialog()
    }
  } finally {
    actionRunning.value = false
  }
}

defineExpose({
  openRequestAction,
})
</script>

<template>
  <v-dialog
    v-model="requestDialog"
    max-width="520"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        {{ currentDefinition.title }}
      </v-card-title>

      <v-divider />

      <v-card-text>
        <p class="mb-4">
          <template v-if="currentAction === 'terminate'">
            この情報の利用終了を申請します。
          </template>

          <template v-else>
            入力した内容で登録・変更を申請します。
          </template>
        </p>

        <v-date-input
          v-model="requestValidFrom"
          class="mb-4"
          :label="validFromLabel"
          variant="outlined"
          prepend-icon=""
          prepend-inner-icon="mdi-calendar"
          clearable
        />

        <v-textarea
          v-model="requestComment"
          :label="commentLabel"
          rows="3"
          variant="outlined"
          counter
          maxlength="1000"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          :disabled="actionRunning"
          @click="closeDialog"
        >
          キャンセル
        </v-btn>

        <v-btn
          :color="currentDefinition.color"
          variant="flat"
          :loading="actionRunning"
          :disabled="confirmDisabled"
          @click="runDialogAction"
        >
          {{ currentDefinition.confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>