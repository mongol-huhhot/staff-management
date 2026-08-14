<script setup>
import { computed } from 'vue'
import UploadImageWrapper from '@/components/forms/fields/UploadImageWrapper.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },

  staffCode: {
    type: String,
    default: '',
  },

  categoryCode: {
    type: String,
    default: '',
  },

  documentType: {
    type: String,
    default: '',
  },

  ownerType: {
    type: String,
    default: 'staff',
  },

  requestStatus: {
    type: String,
    default: 'tmp',
  },
})

const emit = defineEmits(['update:modelValue'])

const meta = computed(() => ({
  categoryCode: props.categoryCode,
  documentType: props.documentType,
  ownerType: props.ownerType,
  ownerId: props.staffCode,
}))

function updateModelValue(value) {
  emit(
    'update:modelValue',
    Array.isArray(value) ? value : []
  )
}
</script>

<template>
  <UploadImageWrapper
    :model-value="props.modelValue"
    :meta="meta"
    :request-status="props.requestStatus"
    @update:model-value="updateModelValue"
  />
</template>