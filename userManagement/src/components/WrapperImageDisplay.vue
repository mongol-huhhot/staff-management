<script setup>
import { ref, watch } from 'vue'
import { useDataStore } from "@/stores/DataStore";

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

const dataStore = useDataStore();
const imageBlob = ref(null);

// let previousUrl = null;

watch(() => props.imageId, async (newId) => {

    console.log("newId===", newId)
    
    if (!newId) return;

    try {
        if (imageBlob.value) URL.revokeObjectURL(imageBlob.value);

        imageBlob.value = await dataStore.loadImage(newId);

        // console.log("blob====", imageBlob.value)

        // if (!(blob instanceof Blob)) {
        //   throw new Error("Returned data is not a Blob.");
        // }

        // if (previousUrl) URL.revokeObjectURL(previousUrl);

        // const newUrl = URL.createObjectURL(blob);
        // imageBlob.value = newUrl;
        // previousUrl = newUrl;

    } catch (err) {
        console.error("Failed to load image:", err);
        imageBlob.value = null;
    }
},{immediate:true});

</script>

<template>
  <div>
    <v-img
      v-if="imageBlob"
      :src="imageBlob"
      alt="顔写真"
      :width="width"
      :height="height"
      class="rounded border border-sm border-grey"
      cover
    />
    <v-icon v-else color="grey" :size="width">mdi-image-off</v-icon>
  </div>
</template>
