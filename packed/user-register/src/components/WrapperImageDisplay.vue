<script setup>
import { ref, watch, } from 'vue'
import { useDataStore } from "@/stores/DataStore";
// import ImageDisplay from './ImageDisplay.vue';

const props = defineProps({
    imageId: {
        type: String,
        default: null,
    }
})

const dataStore = useDataStore();

const imageBlob = ref(null)

watch(props, async(v)=> {
    if(!props.imageId) return

    try {
        const blob = await dataStore.loadImage(props.imageId)
        imageBlob.value = URL.createObjectURL(blob);
    } catch (err) {
        console.error("Failed to load image:", err);
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
