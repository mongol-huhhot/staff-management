<script setup>
import { ref } from 'vue'
import ImageUploaderCropper from '@/components/ImageUploaderCropper.vue'
import axios from 'axios'

const name = ref('')
const email = ref('')
const imageMeta = ref(null)

const handleCropped = (data) => {
  // data = { blob, mime, name, size } or { base64, mime, name, size }
  imageMeta.value = data
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('email', email.value)

  if (imageMeta.value) {
    // If using blob
    formData.append('thumbnail', imageMeta.value.blob, imageMeta.value.name)
    formData.append('thumbnail_mime', imageMeta.value.mime)
    formData.append('thumbnail_size', imageMeta.value.size)
  }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error('Upload failed')

    alert('Registration successful!')
  } catch (err) {
    alert('Error: ' + err.message)
  }
}

// const submitForm = async () => {
//   const formData = new FormData()
//   formData.append('name', name.value)
//   formData.append('email', email.value)
//   formData.append('thumbnail', imageMeta.value.blob) // or base64 string if using that
//   formData.append('thumbnail_mime', imageMeta.value.mime)
//   formData.append('thumbnail_name', imageMeta.value.name)
//   formData.append('thumbnail_size', imageMeta.value.size)

//   await axios.post('/api/register', formData)
// }
</script>

<template>
  <v-form>
    <v-text-field v-model="name" label="Name" />
    <v-text-field v-model="email" label="Email" />

    <ImageUploaderCropper @cropped="handleCropped" />

    <v-btn color="primary" @click="submitForm">Register</v-btn>
  </v-form>
</template>
