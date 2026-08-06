<script setup>
import {
  computed,
  ref,
  watch,
} from 'vue'

import { useDataStore } from '@/stores/DataStore.js'
import { useFileStore } from '@/stores/useFileStore.js'
import DynamicVuetifyForm from '@/components/forms/DynamicVuetifyForm.vue'

const props = defineProps({
  modelValue: Boolean,

  requestId: {
    type: String,
    default: null,
  },

  summaryRow: {
    type: Object,
    default: null,
  },
    fields: {type: Array,required: true,},
})

console.log(props)

const emit = defineEmits([
  'update:modelValue',
])

const dataStore = useDataStore()
const fileStore = useFileStore()

const loading = ref(false)
const errorMessage = ref('')
const requestDetail = ref(null)
const images = ref([])

const dialog = computed({
  get: () => props.modelValue,
  set: value => {
    emit('update:modelValue', value)
  },
})

async function loadPreview() {
    console.log("loadPreview")
  if (!props.requestId) return

  loading.value = true
  errorMessage.value = ''

  try {
    const [detail, requestImages] =
      await Promise.all([
        dataStore.getStaffRequestDetail({
          id: props.requestId,
        }),

        // fileStore.getRequestFiles({
        //   request_id: props.requestId,
        // }),
      ])

    requestDetail.value = detail[0]
    console.log("requestDetail",requestDetail.value)
    images.value = requestImages ?? []
  } catch (error) {
    console.error(error)
    errorMessage.value =
      '申請内容を取得できませんでした。'
  } finally {
    loading.value = false
  }
}

watch(
  [
    () => props.modelValue,
    () => props.requestId,
  ],
  ([open, requestId]) => {
    if (open && requestId) {
      loadPreview()
    }
  },
  {
    immediate: true,
  }
)
</script>

<template>
  <v-dialog
    v-model="dialog"
    max-width="900"
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <span>申請内容プレビュー</span>

        <v-btn
          icon="mdi-close"
          variant="text"
          @click="dialog = false"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-progress-linear
          v-if="loading"
          indeterminate
          class="mb-4"
        />

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
        >
          {{ errorMessage }}
        </v-alert>

        <template v-if="requestDetail">
            d
          <!-- <v-table density="compact">
            <tbody>
              <tr>
                <th>申請区分</th>
                <td>{{ requestDetail.data_type }}</td>
              </tr>
              <tr>
                <th>申請種別</th>
                <td>{{ requestDetail.request_type }}</td>
              </tr>
              <tr>
                <th>適用日</th>
                <td>{{ requestDetail.valid_from }}</td>
              </tr>
              <tr>
                <th>申請コメント</th>
                <td>{{ requestDetail.request_comment || '―' }}</td>
              </tr>
            </tbody>
          </v-table>

          

          <v-row
            v-if="images.length"
            class="mt-4"
          >
            <v-col
              v-for="image in images"
              :key="image.id"
              cols="12"
              sm="6"
            >
              <v-img
                :src="image.url"
                :alt="image.file_name"
                max-height="300"
              />
            </v-col>
          </v-row> -->

          <DynamicVuetifyForm
                v-model="props.summaryRow"
                ref="formRef"
                :controls="controls"
                :chipcontrols="chipcontrols"
                :fields="props.fields"
                :common-params="commonParams"
                :staff-code="dataStore.params.attributes?.staff_code"
                :is-repeatable="false"
              />
        </template>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn @click="dialog = false">
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>