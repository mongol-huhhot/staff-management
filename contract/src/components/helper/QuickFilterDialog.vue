<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  value: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'apply', 'clear'])

const text = ref('')

watch(
  () => props.open,
  (v) => {
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
    @update:model-value="val => !val && close()"
  >
    <v-card rounded="lg">
      <v-card-title>
        Quick Filter
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="text"
          clearable
          variant="outlined"
          density="comfortable"
          placeholder="全カラムから検索(matches any column text)"
          @keyup.enter="apply"
        />

        <div style="margin-top: 10px; color:#666; font-size: 12px;">
          Enterキーで適用できます。空で適用するとフィルター解除です。
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close">キャンセル</v-btn>
        <v-btn variant="text" @click="clear">クリア</v-btn>
        <v-btn color="primary" variant="flat" @click="apply">適用</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>