<script setup>
import { ref, defineEmits, defineProps, defineExpose, } from 'vue'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'

const props = defineProps({
  modelValue: File,
  width: { type: Number, default: 200 },
  height: { type: Number, default: 200 },
  label: { type: String, default: 'Upload or Take Photo' },
  returnType: { type: String, default: 'blob' }, // 'blob' or 'base64'
})

const emit = defineEmits(['update:modelValue', 'cropped'])

const file = ref(null)
const imageData = ref(null)
const cropper = ref(null)
const previewUrl = ref(null)

const originalFileMeta = ref({ name: '', size: 0, type: '' })

const getCropped = () => {
  if (!cropper.value) return

  if (props.returnType === 'base64') {
    cropper.value.getCropData((dataUrl) => {
      emit('cropped', {
        base64: dataUrl,
        mime: originalFileMeta.value.type || 'image/png',
        name: originalFileMeta.value.name,
        size: originalFileMeta.value.size,
      })
      previewUrl.value = dataUrl
    })
  } else {
    cropper.value.getCropBlob((blob) => {
      emit('cropped', {
        blob,
        mime: blob.type || originalFileMeta.value.type || 'image/png',
        name: originalFileMeta.value.name,
        size: blob.size,
      })
      previewUrl.value = URL.createObjectURL(blob)
    })
  }
}

const onFileChange = (event) => {
  const selectedFiles = event?.target?.files || event
  if (!selectedFiles || !selectedFiles.length) return

  const selectedFile = selectedFiles[0]
  originalFileMeta.value = {
    name: selectedFile.name,
    size: selectedFile.size,
    type: selectedFile.type,
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageData.value = e.target.result
  }
  reader.readAsDataURL(selectedFile)
}

defineExpose({
  getCropped,
  imageData,
})

</script>

<template>
  <div>
    <v-file-input
      v-model="file"
      accept="image/*"
      :label="label"
      capture="environment"
      @change="onFileChange"
    />

    <vue-cropper
      v-if="imageData"
      ref="cropper"
      :img="imageData"
      :autoCrop="true"
      :autoCropWidth="width"
      :autoCropHeight="height"
      style="height: 300px;"
    />

    <!-- <v-btn color="primary" class="mt-2" @click="getCropped">クロップの確定</v-btn> -->

    <v-img
      v-if="previewUrl"
      :src="previewUrl"
      max-width="150"
      class="mt-4"
    />
  </div>
</template>
