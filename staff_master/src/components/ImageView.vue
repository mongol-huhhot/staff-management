<template>
    <v-img
        :src="imageSrc"
        :max-height="props.maxHeight"
        :height="props.height"
        v-bind="props"
    ></v-img>
</template>

<script setup>
import { onMounted, ref, watch, defineExpose } from "vue";
import { useDBConnectionStore } from '@/stores/DBConnectionStore.js'
const dbStore = useDBConnectionStore()

const sqlpath = 'souAccountTemplate.sql'
const props = defineProps({
    fkId:String,
    maxHeight:String,
    height:String
});

const imageSrc = ref('')

const load = async () => {
    if(!props.fkId) return;

    const sqlTag = 'get_image_file';
    const obj = {
        'fk_id': props.fkId
    }
    
    let resp;
    try {
        resp = await dbStore.dbAccess( sqlpath, sqlTag,obj);
        const result = resp[sqlTag][0].result;
        imageSrc.value = result[0]?.files;
    } catch (error) {
        console.log(resp)
        console.error(error)
    }
}


onMounted(() => {
    load();
})


watch(() => props.fkId,() => {
    load();
})

defineExpose({
    load
})


</script>