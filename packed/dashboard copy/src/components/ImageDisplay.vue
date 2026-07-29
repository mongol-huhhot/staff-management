<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps({
  image: {
    type: Object,
    required: true,
    validator(val) {
      return val && ['base64', 'blob', 'url'].includes(val.type)
    }
  },
  width: {
    type: [String, Number],
    default: 150
  },
  height: {
    type: [String, Number],
    default: 150
  },
  alt: {
    type: String,
    default: 'Image preview'
  }
})

const imageSrc = computed(() => {
  if (!props.image || !props.image.data) return ''

  switch (props.image.type) {
    case 'base64':
      return `data:${props.image.mime};base64,${props.image.data}`
    case 'blob':
      return URL.createObjectURL(props.image.data)
    case 'url':
      return props.image.data
    default:
      return ''
  }
})
</script>

<template>
  <v-img
    v-if="imageSrc"
    :src="imageSrc"
    :alt="alt"
    :width="width"
    :height="height"
    class="rounded"
    cover
  />
  <v-icon v-else color="grey" :size="width">mdi-image-off</v-icon>
</template>

<!-- 

Usage Example: 

<script setup>
import ImageDisplay from '@/components/ImageDisplay.vue'
import { ref } from 'vue'

const userThumbnail = ref({
  mime: 'image/jpeg',
  data: '/9j/4AAQSkZJRgABAQAAAQABAAD...',  // no header, just base64
  type: 'base64',
  name: 'thumb.jpg'
})
</script>

<template>
  <ImageDisplay :image="userThumbnail" width="200" height="200" />
</template> 
-->
