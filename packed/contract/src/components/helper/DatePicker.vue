<!-- DatePicker.vue -->
<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: null
  },
  label: {
    type: String,
    default: 'Select Date'
  },
  prependIcon: {
    type: String,
    default: 'mdi-calendar'
  },
  title: {
    type: String,
    default: '日付選択'
  },
  mode: {
    type: String,
    default: 'date', // 'date' | 'month'
    validator: v => ['date', 'month'].includes(v)
  },
  minYear: {
    type: Number,
    default: 2025
  },
  clearable: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: true
  },
  widthStyle: {
    type: String,
    default: 'min-width: 12em; max-width: 18em;'
  }
})

const emit = defineEmits(['update:modelValue'])

const menu = ref(false)

const formatString = computed(() => {
  return props.mode === 'month' ? 'YYYY-MM' : 'YYYY-MM-DD'
})

function toDateValue(value) {
  if (!value) return null

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'string') {
    if (props.mode === 'month') {
      const parsed = dayjs(`${value}-01`, 'YYYY-MM-DD', true)
      return parsed.isValid() ? parsed.toDate() : null
    }

    const parsed = dayjs(value, 'YYYY-MM-DD', true)
    return parsed.isValid() ? parsed.toDate() : null
  }

  return null
}

function toModelString(value) {
  if (!value) return null

  const d = dayjs(value)
  if (!d.isValid()) return null

  return props.mode === 'month'
    ? d.format('YYYY-MM')
    : d.format('YYYY-MM-DD')
}

const internalDate = ref(toDateValue(props.modelValue))

watch(
  () => props.modelValue,
  (newVal) => {
    const converted = toDateValue(newVal)

    const currentTime = internalDate.value?.getTime?.() ?? null
    const newTime = converted?.getTime?.() ?? null

    if (currentTime !== newTime) {
      internalDate.value = converted
    }
  }
)

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return typeof props.modelValue === 'string'
    ? props.modelValue
    : toModelString(props.modelValue) || ''
})

const pickerViewMode = computed(() => {
  return props.mode === 'month' ? 'months' : 'month'
})

const pickerHideHeader = computed(() => props.mode === 'month')
const pickerHideWeekdays = computed(() => props.mode === 'month')

function allowedDates(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return false
  return date.getFullYear() >= props.minYear
}

function onSelectDate(value) {
  internalDate.value = value instanceof Date ? value : toDateValue(value)
  emit('update:modelValue', toModelString(internalDate.value))
  menu.value = false
}

function clearDate() {
  internalDate.value = null
  emit('update:modelValue', null)
}

function onMenuToggle(next) {
  menu.value = next
}
</script>

<template>
  <v-menu
    :model-value="menu"
    :close-on-content-click="false"
    @update:model-value="onMenuToggle"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-bind="activatorProps"
        :model-value="displayValue"
        :label="label"
        :prepend-icon="prependIcon"
        :readonly="readonly"
        :clearable="clearable"
        density="compact"
        :style="widthStyle"
        @click:clear="clearDate"
      />
    </template>

    <v-date-picker
      :model-value="internalDate"
      color="primary"
      :title="title"
      :view-mode="pickerViewMode"
      :hide-header="pickerHideHeader"
      :hide-weekdays="pickerHideWeekdays"
      :allowed-dates="allowedDates"
      scrollable
      elevation="4"
      density="compact"
      @update:model-value="onSelectDate"
    />
  </v-menu>
</template>