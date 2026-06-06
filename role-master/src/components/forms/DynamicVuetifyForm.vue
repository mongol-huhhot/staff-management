<script setup>
import { computed, ref } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { buildRules } from '@/composables/useRuleFactory'

// import PermissionRuleEditor from '@/components/fields/PermissionRuleEditor.vue'
// import ScopeRuleEditor from '@/components/fields/ScopeRuleEditor.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  fields: { type: Array, required: true },
  mode: { type: String, default: 'self' },
  disabled: { type: Boolean, default: false },
  items: { type: Object, default: () => ({}) },
  showSubmit: { type: Boolean, default: true },
  sqltags: { type: Object, default: null },
  tabConfig: { type: Object, default: () => ({}) },
  commonParams: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'submit', 'saved'])
const dataStore = useDataStore()
const saving = ref(false)

// const componentMap = {
//   PermissionRuleEditor,
//   ScopeRuleEditor,
// }

const formData = computed({
  get: () => props.modelValue || {},
  set: value => emit('update:modelValue', value),
})

function getComponent(field) {
  return field.component || 'v-text-field'
}

function checkDependsOn(field) {
  if (!field.dependsOn) return true

  const { field: targetField, operator = '=', value } = field.dependsOn
  const currentValue = formData.value?.[targetField]

  if (operator === '=') return currentValue === value
  if (operator === '!=') return currentValue !== value
  if (operator === 'in') return Array.isArray(value) && value.includes(currentValue)
  if (operator === 'notIn') return Array.isArray(value) && !value.includes(currentValue)
  if (operator === 'empty') return currentValue === null || currentValue === undefined || currentValue === ''
  if (operator === 'notEmpty') return currentValue !== null && currentValue !== undefined && currentValue !== ''

  return true
}

const visibleFields = computed(() =>
  props.fields
    .filter(field => field)
    .filter(field => field.showable !== 'hide')
    .filter(field => field.hidden !== true)
    .filter(field => checkDependsOn(field))
)

function getColProps(field) {
  const display = field.display || {}

  return {
    cols: display.cols || 12,
    sm: display.sm || 6,
    md: display.md || 4,
    lg: display.lg,
    xl: display.xl,
  }
}

function toDisplayValue(field, value) {
  if (field.component !== 'v-date-input' && field.type !== 'date') return value
  if (value == null || value === '') return null
  if (value instanceof Date) return value

  if (typeof value === 'string') {
    const normalized = value.replace(/\//g, '-')
    const d = new Date(normalized + 'T00:00:00')
    return isNaN(d.getTime()) ? null : d
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
  if (typeof value === 'string') return value.replace(/\//g, '-').slice(0, 10)
  return ''
}

function normalizeValue(field, value) {
  let newValue = value

  if (field.component === 'v-date-input' || field.type === 'date') {
    newValue = normalizeDateValue(value)
  }

  if (typeof newValue === 'string') {
    if (field.normalize?.trim) {
      newValue = newValue.trim()
    }
  }

  return newValue
}

function updateField(field, value) {
  const newValue = normalizeValue(field, value)

  emit('update:modelValue', {
    ...(props.modelValue || {}),
    [field.key]: newValue,
  })
}

function getFieldItems(field) {
  if (Array.isArray(field.items) && field.items.length > 0) {
    return field.items
  }

  if (Array.isArray(field.options?.items) && field.options.items.length > 0) {
    return field.options.items
  }

  if (
    field.itemsKey &&
    Array.isArray(props.items?.[field.itemsKey])
  ) {
    return props.items[field.itemsKey]
  }

  if (
    field.masterKey &&
    Array.isArray(dataStore.formMasters?.[field.masterKey])
  ) {
    return dataStore.formMasters[field.masterKey]
  }

  if (
    field.dictionaryKey &&
    Array.isArray(dataStore.formMasters?.[field.dictionaryKey])
  ) {
    return dataStore.formMasters[field.dictionaryKey]
  }

  if (Array.isArray(field.props?.items)) {
    return field.props.items
  }

  return []
}

function getItemTitle(field) {
  return (
    field.itemTitle ||
    field.item_title ||
    field.options?.itemTitle ||
    field.options?.item_title ||
    field.props?.itemTitle ||
    field.props?.item_title ||
    field.props?.['item-title'] ||
    'label'
  )
}

function getItemValue(field) {
  return (
    field.itemValue ||
    field.item_value ||
    field.options?.itemValue ||
    field.options?.item_value ||
    field.props?.itemValue ||
    field.props?.item_value ||
    field.props?.['item-value'] ||
    'value'
  )
}

function cleanProps(field) {
  const {
    items,
    itemTitle,
    itemValue,
    item_title,
    item_value,
    'item-title': itemTitleKebab,
    'item-value': itemValueKebab,
    ...rest
  } = field.props || {}

  return {
    clearable: true,
    variant: 'outlined',
    density: 'comfortable',
    placeholder: field.placeholder,
    ...rest,
  }
}

async function submit() {
  if (!props.sqltags?.save) {
    emit('submit', formData.value)
    return
  }

  saving.value = true

  try {
    const {
      id,
      request_id,
      request_data,
      source_type,
      submitted_at,
      submitted_by,
      approved_at,
      approved_by,
      created_at,
      updated_at,
      ...cleanData
    } = formData.value

    const saveData = {
      ...cleanData,
      request_data: {
        ...cleanData,
      },
    }

    const result = await dataStore.runSave(
      props.sqltags.save,
      saveData,
      props.commonParams,
    )

    emit('saved', result)
    emit('submit', saveData)
  } catch (error) {
    console.error('DynamicVuetifyForm submit error:', error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="submit">
    <!-- {{ formData }} -->
    <v-row dense>
      <v-col
        v-for="field in visibleFields"
        :key="field.key"
        v-bind="getColProps(field)"
      >
        <component
          :is="getComponent(field)"
          :model-value="
            field.component === 'v-date-input' || field.type === 'date'
              ? toDisplayValue(field, formData[field.key])
              : formData[field.key]
          "
          v-bind="cleanProps(field)"
          :field="field"
          :label="field.label"
          :type="field.component === 'v-date-input' ? undefined : field.type"
          :readonly="field.readonly"
          :disabled="disabled || field.disabled"
          :items="getFieldItems(field)"
          :item-title="getItemTitle(field)"
          :item-value="getItemValue(field)"
          :rules="buildRules(field)"
          @update:model-value="value => updateField(field, value)"
        />

        <div
          v-if="field.help"
          class="text-caption text-medium-emphasis mt-1"
        >
          {{ field.help }}
        </div>
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