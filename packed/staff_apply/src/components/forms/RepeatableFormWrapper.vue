<script setup>
import { ref } from 'vue'
import DynamicVuetifyForm from './DynamicVuetifyForm.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [], },
  label: {type: String,default: '',},
  children: {    type: Array,default: () => [],},
  addButtonText: {type: String,default: '',},
  sqltags: {    type: Object,default: null,},
  tabConfig: {    type: Object,    default: () => ({}),},
  commonParams: {    type: Object,    default: () => ({}),},
  controls: {    type: Object,    default: null,},
  chipcontrols: {    type: Object,    default: null,},
  staffCode: {    type: String,    default: '',},
})

const emit = defineEmits([
  'update:modelValue',
  'request-action',
])

const formRefs = ref([])

function setFormRef(element, index) {
  if (element) {
    formRefs.value[index] = element
  }
}

function updateItem(index, value) {
  const copied = [...props.modelValue]

  copied[index] = value

  emit('update:modelValue', copied)
}

function add() {
  const recordId = crypto.randomUUID()

  emit('update:modelValue', [
    ...props.modelValue,
    {
      __uuid: crypto.randomUUID(),
      id: null,
      record_id: recordId,
      request_status: 'tmp',
      new_request_status: null,
      request_type: 'create',
      valid_from: null,
      request_comment: '',
      approval_comment: '',
      enabled: 'active',
    },
  ])
}

function isUnsavedItem(item) {
  return (
    !item?.id && item?.__uuid
    // (
    //   !item?.request_status ||
    //   item.request_status === 'tmp'
    // )
  )
}

function removeUnsavedItem(index, item) {
  if (!isUnsavedItem(item)) {
    return
  }

  if (!window.confirm('追加した行を削除しますか？')) {
    return
  }

  const copied = [...props.modelValue]

  copied.splice(index, 1)

  emit('update:modelValue', copied)
}

function handleRequestAction(payload, index) {
  emit('request-action', {
    ...payload,
    index,
    isRepeatable: true,
  })
}

async function validate() {
  for (const form of formRefs.value) {
    if (!form?.validate) {
      continue
    }

    const isValid = await form.validate()

    if (!isValid) {
      return false
    }
  }

  return true
}

defineExpose({
  validate,
})
</script>

<template>
  <div>
    <v-card
      v-for="(item, index) in modelValue"
      :key="
        item.__uuid ||
        item.record_id ||
        item.id ||
        index
      "
      class="mb-4"
      variant="outlined"
    >
      <v-card-title class="d-flex align-center">
        <span>
          {{ label }} {{ index + 1 }}
        </span>

        <v-spacer />

        <v-btn
          v-if="isUnsavedItem(item)"
          icon="mdi-delete"
          variant="text"
          color="error"
          title="追加した行を削除"
          @click="removeUnsavedItem(index, item)"
        />
      </v-card-title>

      <v-card-text>
        <DynamicVuetifyForm
          :ref="element => setFormRef(element, index)"
          :model-value="item"
          :fields="children"
          :is-repeatable="true"
          :show-submit="true"
          :controls="controls"
          :chipcontrols="chipcontrols"
          :sqltags="sqltags"
          :tab-config="tabConfig"
          :common-params="commonParams"
          :staff-code="staffCode"
          @update:model-value="
            value => updateItem(index, value)
          "
          @request-action="
            payload => handleRequestAction(payload, index)
          "
        />
      </v-card-text>
    </v-card>

    <v-btn
      color="primary"
      variant="outlined"
      prepend-icon="mdi-plus"
      @click="add"
    >
      {{ addButtonText || '追加' }}
    </v-btn>
  </div>
</template>