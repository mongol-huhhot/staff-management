<script setup>
import { ref, watch } from 'vue'
import { VColorPicker } from 'vuetify/components'

const props = defineProps({ json: String })
const emit = defineEmits(['json-updated'])

const extrasObj = ref({})

watch(() => props.json, (val) => {
  try {
    extrasObj.value = JSON.parse(val || '{}')
  } catch {
    extrasObj.value = {}
  }
}, { immediate: true })

watch(extrasObj, (val) => {
  emit('json-updated', JSON.stringify(val))
}, { deep: true })
</script>

<template>
  <v-text-field
    label="色 (HEX)"
    v-model="extrasObj.styles.color"
    @input="emit('json-updated', JSON.stringify(extrasObj))"
  />
  <!-- Add more custom controls as needed -->
  <v-textarea
    label="RAW JSON"
    v-model="props.json"
    @input="emit('json-updated', $event.target.value)"
  />
</template>
