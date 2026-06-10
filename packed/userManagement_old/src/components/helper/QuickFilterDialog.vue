<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  value: { type: String, default: '' },
})

const emit = defineEmits([
  'update:open',
  'apply',
  'clear',
])

const text = ref('')

watch(
  () => props.open,
  v => {
    if (v) text.value = props.value || ''
  },
  { immediate: true }
)

function close() {
  emit('update:open', false)
}

function apply() {
  emit('apply', text.value || '')
  close()
}

function clear() {
  text.value = ''
  emit('clear')
  close()
}
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="520"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">
        Quick Filter
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="text"
          clearable
          variant="outlined"
          density="comfortable"
          placeholder="全カラムから検索(matches any column text)"
          prepend-inner-icon="mdi-magnify"
          @keyup.enter="apply"
        />

        <div class="text-caption text-grey mt-2">
          Enterキーで適用できます。空で適用するとフィルター解除です。
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn variant="text" @click="close">
          キャンセル
        </v-btn>

        <v-btn variant="tonal" color="warning" @click="clear">
          クリア
        </v-btn>

        <v-btn color="primary" variant="flat" @click="apply">
          適用
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>