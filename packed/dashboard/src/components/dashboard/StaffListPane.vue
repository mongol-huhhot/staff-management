<!-- StaffListPane.vue 処理待ち選択中のスタッフ一覧ペイン -->
<script setup>
import { ref } from 'vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { useDataStore } from '@/stores/DataStore'
import { showSnackbar } from '@/utils/Snackbar.vue'
import StaffList from '@/views/StaffList.vue'

const props = defineProps({
    todo: { type: Object, required: true },
    filter: { type: Object, default: null },
})

const emit = defineEmits(['close', 'row-selected', 'approved'])

const appConfigStore = useAppConfigStore()
const dataStore = useDataStore()

const staffListRef = ref(null)

// ---- 一括承認（スタッフ一覧のチェックボックス選択に連動） ----
const selectedStaffRows = ref([])
const isApproveDialog = ref(false)
const approveComment = ref('')
const isLoadingApprove = ref(false)

function handleSelectionChanged(rows) {
    selectedStaffRows.value = Array.isArray(rows) ? rows : []
}

function openApproveDialog() {
    if (!selectedStaffRows.value.length) return
    approveComment.value = ''
    isApproveDialog.value = true
}

async function approveCheckedRequest() {
    const targets = selectedStaffRows.value.filter(r => r?.staff_id)
    if (!targets.length) return

    isApproveDialog.value = true

    try {
    await dataStore.saveData(appConfigStore.REQUEST_TAGS?.approve, {
        staff_id: targets.map(r => r.staff_id).join(','),
        approved_by: dataStore.getLoginUser()?.user_id,
        approval_comment: approveComment.value || '',
        data_type: props.todo?.sub_category_code || '',
        request_id: '', // '' = 対象スタッフの submitted 全件
    }, { showSuccessMessage: false });

    showSnackbar(`${targets.length}名の申請を承認しました`, 'success');
    clearSelection();
    emit('approved', { clearSelection: true });
  } catch (e) {
      console.error('Approve failed:', e);
      showSnackbar('一括承認に失敗しました。エラーを確認してください', 'error');
  } finally {
      isLoadingApprove.value = false;
      isApproveDialog.value = false;
  }
}

function loadData() {
    return staffListRef.value?.loadData()
}

function clearSelection() {
    staffListRef.value?.clearSelection()
    selectedStaffRows.value = []
}

defineExpose({ loadData, clearSelection })
</script>

<template>
  <div class="pane-card d-flex flex-column">
    <div class="pane-card-header d-flex align-center justify-space-between px-3 py-2">
      <span class="text-subtitle-2 font-weight-bold text-truncate">
        <span v-if="todo.type">[{{ todo.type }}]</span>
        {{ todo.text }}
      </span>

      <div class="d-flex align-center ga-2 flex-shrink-0">
        <span
          v-if="selectedStaffRows.length"
          class="text-caption text-medium-emphasis"
        >
          選択数：{{ selectedStaffRows.length }}名
        </span>

        <v-btn
          size="small"
          color="primary"
          prepend-icon="mdi-check-all"
          :disabled="!selectedStaffRows.length"
          @click="openApproveDialog"
        >
          一括承認
        </v-btn>

        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="emit('close')"
        />
      </div>
    </div>

    <v-divider />

    <div class="pane-scroll flex-grow-1 overflow-auto">
      <StaffList
        ref="staffListRef"
        :request-filter="filter"
        @row-selected="row => emit('row-selected', row)"
        @selection-changed="handleSelectionChanged"
      />
    </div>
  </div>

  <!-- 一括承認の確認ダイアログ（チェックボックスで選択したスタッフが対象） -->
  <v-dialog v-model="isApproveDialog" max-width="480">
    <v-card>
      <v-card-title class="d-flex align-center">
        一括承認
      </v-card-title>

      <v-divider />

      <v-card-text>
        <p class="mb-4">
          選択した<strong>{{ selectedStaffRows.length }}名</strong>の<template v-if="todo?.text">「{{ todo.text }}」の</template>申請中の申請を
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
        <v-btn variant="text" @click="isApproveDialog = false">キャンセル</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isLoadingApprove"
          @click="approveCheckedRequest"
        >
          承認する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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

.pane-card-header {
  flex: 0 0 auto;
  min-height: 48px;
}

.pane-scroll {
  min-height: 0;
}
</style>
