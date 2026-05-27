<template>
    <div v-if="isFocused && message" style="font-size: 0.83em;color: cadetblue;">{{ message }}</div>
    <div v-else-if="(props?.original || itemValue)&& props?.original!= itemValue" style="font-size: 0.83em;color: cadetblue;">既存値：{{ props.original }}</div>
    <div v-else style="font-size: 0.83em;">　</div>
    <v-text-field
        v-model="itemValue"
        density="compact"
        :label="props.label"
        :rules="props.rules"
        :disabled="props.disabled"
        :type = "props.type"
        @update:focused="onfocus"
        @input="$emit('input')"
    >
    <template >
    </template>
    </v-text-field>
    
</template>
<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(customParseFormat);
const isFocused = ref(false);

const props = defineProps({
    original:String,
    label:String,
    disabled:Boolean,
    type:String,
    rules:Array,
    isDate :Boolean,
    message:String
});

const message = computed(() => {
    if(props.message)
    return props.message
    if(props.isDate)
    return 'YYYYMMDDまたはYYYY-MM-DDで入力してください (例:2024-01-02)'



    return '';
})

const onfocus = (focus) => {
    isFocused.value = focus

    if(!focus)
    blurEvents();
}
const itemValue =  defineModel();


//カーソルを外した時のフォーマット変更など
const blurEvents = () => {

    if(props.isDate)
        formatDate();

}

const formatDate = () => {
    if(dayjs(itemValue.value, 'YYYY-MM-DD', true).isValid() || !itemValue.value ) 
        return;
    if(!dayjs(itemValue.value, 'YYYYMMDD', true).isValid()){
        itemValue.value = '';
        return
    }

    itemValue.value = dayjs(itemValue.value).format('YYYY-MM-DD')
}

</script>
