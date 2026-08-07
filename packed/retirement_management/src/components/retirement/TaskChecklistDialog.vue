<script setup>
import { ref, watch, computed } from 'vue'
import { getMockTaskProgress, saveMockTaskProgress } from '@/stores/mock/retirementProcedureMock'

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    row: { type: Object, default: null },          // get_procedure_list の1行
    scope: { type: String, required: true },       // 'branch' | 'hr'
})

const emit = defineEmits(['update:modelValue', 'saved'])

const tasks = ref([])
const saving = ref(false)

const statusItems = [
    { title: '未対応', value: 'pending' },
    { title: '完了', value: 'done' },
    { title: '対象外', value: 'na' },
]

const title = computed(() =>
    props.scope === 'branch' ? '現場手続き' : '人事手続き')

watch(() => props.modelValue, (open) => {
    if (open && props.row) {
        tasks.value = getMockTaskProgress(props.row.request_id, props.scope)
            .filter(t => t.required)
    }
})

const close = () => emit('update:modelValue', false)

const save = async () => {
    saving.value = true

    try {
        for (const t of tasks.value) {
            saveMockTaskProgress(props.row.request_id, t.task_code, t.task_status, t.note)
        }
        emit('saved')
        close()
    }
    finally {
        saving.value = false
    }
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="720"
    @update:model-value="close"
  >
    <v-card v-if="row">
      <v-card-title>
        {{ title }} — {{ row.staff_name }}（{{ row.staff_code }}）
      </v-card-title>

      <v-card-subtitle>
        {{ row.branch_name }} / {{ row.department_name }}　退職日: {{ row.resignation_date }}
      </v-card-subtitle>

      <v-card-text>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th style="width: 14em;">手続き</th>
              <th style="width: 12em;">状態</th>
              <th>備考</th>
              <th style="width: 12em;">実施</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tasks" :key="t.task_code">
              <td>{{ t.task_name }}</td>
              <td>
                <v-select
                  v-model="t.task_status"
                  :items="statusItems"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </td>
              <td>
                <v-text-field
                  v-model="t.note"
                  density="compact"
                  variant="outlined"
                  hide-details
                />
              </td>
              <td class="text-caption">
                {{ t.done_at }}<template v-if="t.done_by"> / {{ t.done_by }}</template>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">キャンセル</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
