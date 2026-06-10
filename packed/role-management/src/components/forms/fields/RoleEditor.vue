<script setup>
import { ref } from 'vue'

const form = ref({
  role_code: '',
  role_name: '',
  enabled: 'active',
  remarks: '',
  show_order: 0,
})

const enabledItems = [
  { title: '有効', value: 'active' },
  { title: '無効', value: 'inactive' },
]

function save() {
  console.log('save role:', form.value)
}
</script>

<template>
  <v-card class="pa-4" elevation="2">
    <v-card-title>
      ロールマスタ
    </v-card-title>

    <v-card-text>
      <v-form>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.role_code"
              label="ロールコード"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>

          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.role_name"
              label="ロール名"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="form.enabled"
              :items="enabledItems"
              label="有効区分"
              variant="outlined"
              density="comfortable"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="form.show_order"
              label="表示順"
              type="number"
              variant="outlined"
              density="comfortable"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="form.remarks"
              label="備考"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn variant="text">
        キャンセル
      </v-btn>

      <v-btn color="primary" @click="save">
        保存
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
