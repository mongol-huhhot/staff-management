<!-- ConfirmDialog.vue 保存前の確認ダイアログ -->
<script setup>
import { computed } from 'vue'
import DynamicVuetifyForm from '@/components/forms/DynamicVuetifyForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tabLabel: { type: String, default: '' },
  fields: { type: Array, default: () => [] },
  formData: { type: Object, default: null },
  approvedData: { type: Object, default: () => ({}) },
  staffCode: { type: String, default: '' },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

</script>

<template>
  <v-dialog v-model="isOpen" max-width="960">
    <v-card>
      <v-card-title>保存内容の確認</v-card-title>

      <v-divider />

      <v-card-text class="save-preview-body">
        <p class="mb-3">
          「{{ tabLabel }}」を以下の内容で保存します。よろしいでしょうか？
        </p>

        <DynamicVuetifyForm
          v-if="formData"
          :model-value="formData"
          :fields="fields"
          :staff-code="staffCode"
          :is-repeatable="false"
          :readonly="true"
          :show-submit="false"
          :approved-data="approvedData"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="isOpen = false">キャンセル</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="saving"
          @click="emit('confirm')"
        >
          保存する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.save-preview-body {
  max-height: 65vh;
  overflow-y: auto;
}
</style>
