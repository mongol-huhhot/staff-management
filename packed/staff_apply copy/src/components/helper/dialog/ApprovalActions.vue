<script setup>
import { ref, computed } from 'vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { useDataStore } from '@/stores/DataStore'
import { showSnackbar } from '@/utils/SnackBar.vue'

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

const requestTags = computed(() => appConfigStore.REQUEST_TAGS || {})


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
  console.log("openApprovalDialog")
  
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
        <v-date-input
          class="mb-4"
          
          :label="itemApprovalNeedsComment ? '申請適用日' : '承認コメント（任意）'"
          rows="2"
          variant="outlined"
          hide-details
          prepend-icon=""
          prepend-inner-icon="mdi-calendar"
        />
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
