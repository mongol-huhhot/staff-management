<script setup>
import { computed, ref, watch } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { showSnackbar } from '@/utils/SnackBar.vue'
import RetirementRequestForm from '@/components/request/RetirementRequestForm.vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    row: {
        type: Object,
        default: null,
    },
    mode: {
        type: String,
        default: 'confirm',   // 'process' | 'confirm'
    },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const dataStore = useDataStore()

const open = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
})

const isConfirm = computed(() => props.mode === 'confirm')
const title = computed(() => (isConfirm.value ? '退職届確認' : '退職処理'))

// 承認/差戻しは未処理の申請のみ
const JUDGEABLE_STATUSES = ['self_applied', 'proxy_applied', 'approving', 'submitted']

const canJudge = computed(() =>
    isConfirm.value && JUDGEABLE_STATUSES.includes(props.row?.status)
)

const comment = ref('')
const judging = ref(false)

watch(open, (v) => {
    if (v) comment.value = ''
})

const handleSubmitted = () => {
    open.value = false
    emit('saved')
}

const handleJudge = async (action) => {
    if (action === 'remand' && !comment.value.trim()) {
        showSnackbar('差戻しにはコメントを入力してください。', 'warning')
        return
    }

    judging.value = true

    try {
        const ok = await dataStore.save_retirement_approval({
            staff_id: props.row?.staff_id,
            staff_code: props.row?.staff_code,
            action,               // 'approve' | 'remand'
            comment: comment.value,
        })

        if (ok) {
            showSnackbar(action === 'approve' ? '承認しました。' : '差戻しました。', 'success')
            open.value = false
            emit('saved')
        }
    }
    finally {
        judging.value = false
    }
}
</script>

<template>
  <v-dialog v-model="open" max-width="900" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <h4>{{ title }}</h4>
        <span v-if="row" class="ml-3 text-subtitle-2">
          id:{{ row.staff_code }}　{{ row.staff_name }}
        </span>
        <v-spacer />
        <v-btn
          variant="text"
          density="compact"
          @click="open = false"
        >
          閉じる
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-0">
        <RetirementRequestForm
          :key="`${mode}:${row?.staff_code}`"
          :initial="row"
          :readonly="isConfirm"
          embedded
          :extra-params="{ staff_id: row?.staff_id, staff_code: row?.staff_code }"
          @submitted="handleSubmitted"
        />
      </v-card-text>

      <v-card-actions v-if="canJudge" class="d-block pa-4 pt-0">
        <v-textarea
          v-model="comment"
          label="コメント（差戻し時は必須）"
          rows="2"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-3"
        />
        <div class="d-flex justify-center ga-4">
          <v-btn
            color="error"
            variant="outlined"
            :loading="judging"
            @click="handleJudge('remand')"
          >
            差戻し
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="judging"
            @click="handleJudge('approve')"
          >
            承認
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 0;
}
</style>
