<script setup>
import DatePicker from './DatePicker.vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import dayjs from 'dayjs'
import { computed, ref, watch } from 'vue'

const model = defineModel({
  type: Object,
  default: () => ({
    start_date: null,
    end_date: null
  })
})

const configStore = useAppConfigStore()
configStore.loadFromWindow()

const date_mode = computed(() => configStore.MAIN_CONFIG?.condition_date_mode || 'date')
const date_format = computed(() => configStore.MAIN_CONFIG?.condition_date_format || 'YYYY-MM-DD')
const currentDate = computed(() => dayjs().format(date_format.value))

const start_date = ref(model.value?.start_date || currentDate.value)
const end_date = ref(model.value?.end_date || currentDate.value)

const dateError = ref('')

const validateDateRange = (start, end) => {
  if (!start || !end) {
    dateError.value = ''
    return true
  }

  const startDayjs = dayjs(start, date_format.value, true)
  const endDayjs = dayjs(end, date_format.value, true)

  if (!startDayjs.isValid() || !endDayjs.isValid()) {
    dateError.value = ''
    return true
  }

  const isValid = startDayjs.isBefore(endDayjs) || startDayjs.isSame(endDayjs)

  dateError.value = isValid
    ? ''
    : '開始日は終了日より前の日付を設定してください'

  return isValid
}

const updateModel = () => {
  model.value = {
    start_date: start_date.value,
    end_date: end_date.value
  }
}

// 親からの変更を反映
watch(
  () => model.value,
  (newModel) => {
    if (!newModel) return

    if (newModel.start_date !== start_date.value) {
      start_date.value = newModel.start_date || currentDate.value
    }

    if (newModel.end_date !== end_date.value) {
      end_date.value = newModel.end_date || currentDate.value
    }

    validateDateRange(start_date.value, end_date.value)
  },
  { deep: true, immediate: true }
)

// start_date が変わったとき
watch(start_date, (newStart) => {
  if (newStart && end_date.value) {
    const startDayjs = dayjs(newStart, date_format.value, true)
    const endDayjs = dayjs(end_date.value, date_format.value, true)

    if (startDayjs.isValid() && endDayjs.isValid() && startDayjs.isAfter(endDayjs)) {
      end_date.value = newStart
      dateError.value = '開始日が終了日より後のため、終了日を開始日に合わせました'

      setTimeout(() => {
        if (dateError.value === '開始日が終了日より後のため、終了日を開始日に合わせました') {
          dateError.value = ''
        }
      }, 3000)
    } else {
      validateDateRange(start_date.value, end_date.value)
    }
  }

  updateModel()
})

// end_date が変わったとき
watch(end_date, () => {
  validateDateRange(start_date.value, end_date.value)
  updateModel()
})
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; gap: 12px;">
      <DatePicker
        v-model="start_date"
        :mode="date_mode"
        label="期間開始"
      />
      <span style="color: rgba(0,0,0,0.6);">〜</span>
      <DatePicker
        v-model="end_date"
        :mode="date_mode"
        label="期間終了"
      />
    </div>

    <div
      v-if="dateError"
      style="margin-top: 8px; font-size: 12px; color: var(--v-error-base, #ff5252);"
    >
      {{ dateError }}
    </div>
  </div>
</template>