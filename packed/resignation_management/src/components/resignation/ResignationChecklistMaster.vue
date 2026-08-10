<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/DataStore'

const dataStore = useDataStore()

const scopeItems = [
    { title: '現場手続き', value: 'branch' },
    { title: '人事手続き', value: 'hr' },
]

const tasks = ref([])
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const loadData = async () => {
    loading.value = true

    try {
        tasks.value = (await dataStore.get_resignation_task_master())
            .map(t => ({ ...t, _isNew: false }))
    }
    finally {
        loading.value = false
    }
}

onMounted(loadData)

const addRow = () => {
    const sameScope = tasks.value.filter(t => t.task_scope === 'branch')
    const nextOrder = Math.max(0, ...sameScope.map(t => Number(t.show_order) || 0)) + 10

    tasks.value.push({
        task_code: '',
        task_name: '',
        task_scope: 'branch',
        required: true,
        show_order: nextOrder,
        enabled: '1',
        _isNew: true,
    })
}

const removeRow = (index) => {
    // 未保存の新規行だけ物理削除できる
    if (tasks.value[index]?._isNew) tasks.value.splice(index, 1)
}

const validate = () => {
    const codes = new Set()

    for (const t of tasks.value) {
        if (!t.task_code?.trim()) return 'コードを入力してください。'
        if (!t.task_name?.trim()) return '手続き名を入力してください。'
        if (codes.has(t.task_code)) return `コードが重複しています: ${t.task_code}`
        codes.add(t.task_code)
    }

    return ''
}

const save = async () => {
    errorMessage.value = validate()
    if (errorMessage.value) return

    saving.value = true

    try {
        const payload = tasks.value.map(({ _isNew, ...t }) => ({
            ...t,
            task_code: t.task_code.trim(),
            task_name: t.task_name.trim(),
            show_order: Number(t.show_order) || 0,
        }))

        const ok = await dataStore.save_resignation_task_master(payload)
        if (ok) await loadData()
    }
    finally {
        saving.value = false
    }
}
</script>

<template>
  <v-card class="card_box">
    <v-card-title>
      <div class="d-flex align-center flex-wrap ga-3">
        <h4>チェックリスト管理</h4>
        <v-spacer />
        <v-btn prepend-icon="mdi-plus" variant="tonal" @click="addRow">行追加</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">保存</v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="errorMessage"
        type="error"
        density="compact"
        class="mb-3"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-table density="comfortable">
        <thead>
          <tr>
            <th style="width: 11em;">区分</th>
            <th style="width: 14em;">コード</th>
            <th>手続き名</th>
            <th style="width: 5em;">必須</th>
            <th style="width: 7em;">表示順</th>
            <th style="width: 5em;">有効</th>
            <th style="width: 4em;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(t, i) in tasks" :key="t._isNew ? `new-${i}` : t.task_code">
            <td>
              <v-select
                v-model="t.task_scope"
                :items="scopeItems"
                density="compact"
                variant="outlined"
                hide-details
              />
            </td>
            <td>
              <!-- コードは進捗テーブルの FK なので既存行は変更不可 -->
              <v-text-field
                v-model="t.task_code"
                :disabled="!t._isNew"
                density="compact"
                variant="outlined"
                hide-details
              />
            </td>
            <td>
              <v-text-field
                v-model="t.task_name"
                density="compact"
                variant="outlined"
                hide-details
              />
            </td>
            <td>
              <v-checkbox
                v-model="t.required"
                density="compact"
                hide-details
              />
            </td>
            <td>
              <v-text-field
                v-model="t.show_order"
                type="number"
                density="compact"
                variant="outlined"
                hide-details
              />
            </td>
            <td>
              <v-checkbox
                :model-value="t.enabled !== '0'"
                density="compact"
                hide-details
                @update:model-value="v => t.enabled = v ? '1' : '0'"
              />
            </td>
            <td>
              <v-btn
                v-if="t._isNew"
                icon="mdi-delete"
                size="small"
                variant="text"
                @click="removeRow(i)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 8px 20px 0 0 !important;
}
</style>
