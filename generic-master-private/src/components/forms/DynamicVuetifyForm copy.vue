<!-- DynamicVuetifyForm.vue -->
<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { buildSaveParams } from '@/composables/formParamBuilder'
// import DatePicker from '@/components/helper/date/DatePicker.vue'


const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  fields: {
    type: Array,
    required: true,
  },
  mode: {
    type: String,
    default: 'self', // self / admin
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: () => [],
  },
  showSubmit: {
    type: Boolean,
    default: true,
  },
  sqltags: {
    type: Object,
    default: null,
  },
  tabConfig: {
    type: Object,
    default: () => ({}),
  },
  commonParams: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'saved'])

const dataStore = useDataStore()
const saving = ref(false)

const formData = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const visibleFields = computed(() => {
  return props.fields
    .filter(field => field)
    .filter(field => field.showable !== 'hide')
})

function toDisplayValue(field, value) {
  if (field.type !== 'date') return value

  if (!value) return null
  if (value instanceof Date) return value

  if (typeof value === 'string') {
    return new Date(`${value.replace(/\//g, '-')}T00:00:00`)
  }

  return null
}

function normalizeDateValue(value) {
  if (value == null || value === '') return ''

  if (value instanceof Date) {
    const yyyy = value.getFullYear()
    const mm = String(value.getMonth() + 1).padStart(2, '0')
    const dd = String(value.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  if (typeof value === 'string') {
    return value.replace(/\//g, '-').slice(0, 10)
  }

  return ''
}

function updateField(field, value) {
  console.log('updateField===', field.key, value)
  const newValue =
    field.component === 'v-date-input' || field.type === 'date'
      ? normalizeDateValue(value)
      : value
  emit('update:modelValue', {
    ...(props.modelValue || {}),
    [field.key]: newValue,
  })
}

function getComponent(field) {
  if (field.component) return field.component

  if (field.type === 'select') return 'v-select'
  if (field.type === 'combobox') return 'v-combobox'
  if (field.type === 'textarea') return 'v-textarea'
  if (field.type === 'date' || field.type === 'month') return 'v-date-input'

  return 'v-text-field'
}

function getInputType(field) {
  if (field.type === 'email') return 'email'
  if (field.type === 'password') return 'password'
  if (field.type === 'number') return 'number'
  if (field.type === 'date') return 'date'
  if (field.type === 'time') return 'time'
  return 'text'
}

function buildRules(field) {
  const rules = []
  const validation = field.validation || {}

  if (field.required || validation.required) {
    rules.push(v => !!v || `${field.label}は必須です`)
  }

  if (validation.minLength) {
    rules.push(v =>
      !v || String(v).length >= validation.minLength ||
      `${field.label}は${validation.minLength}文字以上です`
    )
  }

  if (validation.maxLength) {
    rules.push(v =>
      !v || String(v).length <= validation.maxLength ||
      `${field.label}は${validation.maxLength}文字以内です`
    )
  }

  if (validation.email || field.type === 'email') {
    rules.push(v =>
      !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
      'メールアドレス形式が正しくありません'
    )
  }

  if (validation.pattern) {
    const reg = new RegExp(validation.pattern)
    rules.push(v =>
      !v || reg.test(v) ||
      validation.message ||
      `${field.label}の形式が正しくありません`
    )
  }

  return rules
}

function getProps(field) {
  const component = getComponent(field)

  const mergedProps = {
    label: field.label,
    placeholder: field.placeholder,
    readonly: field.readonly,
    disabled: props.disabled || field.disabled,
    clearable: true,
    variant: 'outlined',
    density: 'comfortable',
    ...field.props,
  }

  if (component !== 'v-date-input' && component !== DatePicker) {
    mergedProps.type = getInputType(field)
  }

  if (component === 'v-select' || component === 'v-combobox') {
    mergedProps.items = field.items || field.props?.items || []
    mergedProps.itemTitle =
      field.props?.itemTitle ||
      field.props?.['item-title'] ||
      'label'
    mergedProps.itemValue =
      field.props?.itemValue ||
      field.props?.['item-value'] ||
      'value'
  }

  return mergedProps
}

async function submit() {
  if (!props.sqltags?.save) {
    emit('submit', formData.value)
    return
  }

  saving.value = true

  try {
    const params = buildSaveParams(
      formData.value,
      props.tabConfig,
      props.commonParams,
    )

    const result = await dataStore.saveData(
      props.sqltags.save,
      params,
    )

    emit('saved', result)
    emit('submit', formData.value)
  } catch (error) {
    console.error('DynamicVuetifyForm submit error:', error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="submit">
    <v-row dense>
      <v-col
        v-for="field in visibleFields"
        :key="field.key"
        cols="12"
        sm="6"
        md="4"
      >

      <component
        :is="getComponent(field)"
        :model-value="formData[field.key]"
        v-bind="getProps(field)"
        :rules="buildRules(field)"
        @update:model-value="value => updateField(field.key, value)"
      />

        <!-- <component
          :is="field.component || 'v-text-field'"
          :model-value="formData[field.key]"
          v-bind="field.props || {}"
          :label="field.label"
          :type="field.component === 'v-date-input' ? undefined : field.type"
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :items="field.items || field.props?.items || []"
          :item-title="field.props?.itemTitle || field.props?.['item-title'] || 'label'"
          :item-value="field.props?.itemValue || field.props?.['item-value'] || 'value'"
          @update:model-value="value => updateField(field.key, value)"          
        /> -->

        <!-- <component
          :is="getComponent(field)"
          :model-value="toDisplayValue(field, formData[field.key])"
          @update:model-value="value => updateField(field.key, normalizeValue(field, value))"
          v-bind="getProps(field)"
          :items="field.items || []"
          :item-title="field.props?.itemTitle || 'label'"
          :item-value="field.props?.itemValue || 'value'"
          :type="field.component === 'v-date-input' ? undefined : field.type"
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :rules="buildRules(field)"
        /> -->
      </v-col>
    </v-row>

    <v-row v-if="showSubmit">
      <v-col cols="12" class="text-right">
        <v-btn
          color="primary"
          type="submit"
          :loading="saving"
          :disabled="props.disabled"
        >
          保存
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>