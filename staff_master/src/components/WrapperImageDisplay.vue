<script setup>
import { ref, watch } from 'vue'
import { usestaffDetailStore } from "@/stores/staffDetailStore";

const props = defineProps({
    imageId: {
        type: String,
        default: null,
    },
    width: {
        type: [String, Number],
        default: 100,
    },
    height: {
        type: [String, Number],
        default: 100,
    },
});

const dataStore = usestaffDetailStore();
const imageBlob = ref(null);

// let previousUrl = null;

watch(() => props.imageId, async (newId) => {

    console.log("newId===", newId)
    
    if (!newId) return;

    try {
        if (imageBlob.value) URL.revokeObjectURL(imageBlob.value);

        imageBlob.value = await dataStore.loadImage(newId);

    } catch (err) {
        console.error("Failed to load image:", err);
        imageBlob.value = null;
    }
},{immediate:true});

</script>

<template>
  <div style="padding: 4px; margin-bottom: 4px;">
    <v-img
      v-if="imageBlob"
      :src="imageBlob"
      alt="顔写真"
      :width="width"
      :height="height"
      class="rounded border border-sm border-grey"
      cover
    />
    <v-icon v-else color="primary" :size="width">mdi-account</v-icon>
  </div>
</template>
