<script setup>
import { ref, computed } from 'vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { useDataStore } from '@/stores/DataStore'
import { showSnackbar } from '@/utils/Snackbar.vue'

const props = defineProps({
  selectedRow: { type: Object, default: null },
  dataType: { type: String, default: '' },
  dataTypeName: { type: String, default: '' },
  hasData: { type: Boolean, default: false },
})

const emit = defineEmits(['done'])

const appConfigStore = useAppConfigStore()
const dataStore = useDataStore()

// 遷移先ステータスの表示定義（requestStatusConfig の色・表示名）
function statusConfig(status) {
  return appConfigStore.requestStatusConfig?.[status] ?? {}
}

const loginUserId = () => dataStore.getLoginUser()?.user_id

const requestTags = computed(() => appConfigStore.REQUEST_SAVE_TAGS || {})

const approveDialog = ref(false)
const approveComment = ref('')
const approving = ref(false)

function openBulkApprove() {
  approveComment.value = ''
  approveDialog.value = true
}

async function approveAllRequests() {
  const row = props.selectedRow
  if (!row?.staff_id) return

  approving.value = true

  const ok = await dataStore.saveData(requestTags.value.approve, {
    staff_id: row.staff_id,
    approved_by: loginUserId(),
    approval_comment: approveComment.value || '',
    data_type: props.dataType || '', // '' = 全タブ対象
    request_id: '',                  // '' = 全申請対象
  })

  approving.value = false

  if (!ok) return

  approveDialog.value = false
  approveComment.value = ''
  showSnackbar('申請を承認しました', 'success')

  // 全て承認済みになったため選択を解除して一覧に戻す
  emit('done', { clearSelection: true })
}

// ---- 個別の承認・差戻し・却下 ----
const itemApprovalDialog = ref(false)
const itemApprovalAction = ref(null) // { new_status, label, request }
const itemApprovalComment = ref('')
const itemApprovalRunning = ref(false)

const itemApprovalNeedsComment = computed(
  () => itemApprovalAction.value?.new_status !== 'approved'
)

// FormVuetifyContainer の approval イベントから（親経由・defineExpose で）呼ばれる
function openApprovalDialog(payload) {
  if (!payload?.request?.id) return
  itemApprovalAction.value = payload
  itemApprovalComment.value = ''
  itemApprovalDialog.value = true
}

async function runItemApproval() {
  const action = itemApprovalAction.value
  if (!action?.request?.id) return

  itemApprovalRunning.value = true

  let ok
  if (action.new_status === 'approved') {
    ok = await dataStore.saveData(requestTags.value.approve, {
      staff_id: props.selectedRow?.staff_id,
      approved_by: loginUserId(),
      approval_comment: itemApprovalComment.value || '',
      data_type: action.request.data_type || '',
      request_id: action.request.id,
    })
  } else {
    // 差戻し・却下は申請行の UPDATE のみ
    ok = await dataStore.saveData(requestTags.value.update_status, {
      request_id: action.request.id,
      new_status: action.new_status,
      action_by: loginUserId(),
      approval_comment: itemApprovalComment.value || '',
    })
  }

  itemApprovalRunning.value = false

  if (!ok) return

  itemApprovalDialog.value = false
  showSnackbar(`${action.label}しました`, 'success')

  emit('done')
}

defineExpose({
  openApprovalDialog,
})
</script>

<template>
  <v-btn
    v-if="selectedRow?.staff_id && hasData"
    color="primary"
    prepend-icon="mdi-check-all"
    @click="openBulkApprove"
  >
    一括承認
  </v-btn>

  <v-dialog v-model="approveDialog" max-width="480">
    <v-card>
      <v-card-title class="d-flex align-center">
        一括承認
      </v-card-title>

      <v-divider />

      <v-card-text>
        <p class="mb-4">
          {{ selectedRow?.staff_name || selectedRow?.user_name }}様の<template v-if="dataTypeName">「{{ dataTypeName }}」の</template>申請中の申請を
          <strong>全て承認</strong>します。よろしいでしょうか？
        </p>
        <v-textarea
          v-model="approveComment"
          label="承認コメント（任意）"
          rows="2"
          variant="outlined"
          hide-details
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="approveDialog = false">キャンセル</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="approving"
          @click="approveAllRequests"
        >
          承認する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 個別承認・差戻し・却下の確認ダイアログ -->
  <v-dialog v-model="itemApprovalDialog" max-width="480">
    <v-card>
      <v-card-title class="d-flex align-center">
        {{ itemApprovalAction?.label }}
      </v-card-title>

      <v-divider />

      <v-card-text>
        <p class="mb-4">
          この申請を<strong>{{ itemApprovalAction?.label }}</strong>します。よろしいでしょうか？
        </p>
        <v-textarea
          v-model="itemApprovalComment"
          :label="itemApprovalNeedsComment ? '理由（必須）' : '承認コメント（任意）'"
          rows="2"
          variant="outlined"
          hide-details
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="itemApprovalDialog = false">キャンセル</v-btn>
        <v-btn
          :color="statusConfig(itemApprovalAction?.new_status).color"
          variant="flat"
          :loading="itemApprovalRunning"
          :disabled="itemApprovalNeedsComment && !itemApprovalComment"
          @click="runItemApproval"
        >
          {{ itemApprovalAction?.label }}する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
