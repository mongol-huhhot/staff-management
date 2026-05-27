<template>
    <DiffSelect
        v-model="modelValue"
        :original="props.original"
        :density="props.density"
        :label="props.label"
        :items="dataList"
        :is-auto-comp="props.isAutoComp"
    ></DiffSelect>
</template>

<script setup>
import DiffSelect from './DiffSelect.vue';
import { onMounted, ref, watch } from "vue"
import { useBaseStore } from '@/stores/BaseStore';

const baseStore = useBaseStore();

const props = defineProps({
    sqlTag:String,
    sqlPath:{
        typeof:String
        ,default:'sou/staffDetail.sql'
    },
    label:String,
    sqlValue:{
        typeof:Object
        ,default:{}
    },
    original:String,
    density:{
        typeof:String,
        default:"compact"
    },
    isAutoComp:{
        typeof:Boolean
        ,default:false
    }
});

const modelValue = defineModel();

const dataList = defineModel('dataList',  {default:[]})


const load = async() => {
    let val = {};
    if(props.sqlValue)
    val = props.sqlValue;
    // const resp = await dbStore.dbAccess( props.sqlPath, props.sqlTag, val);

    // const result = resp[props.sqlTag][0]
    baseStore.sqlpath = props.sqlPath;
    const result = await baseStore.load(props.sqlTag, props.sqlValue);
    dataList.value = result

    if( dataList.value == null || dataList.value == undefined || dataList.value.length == 0 )
    return null;

}


onMounted(()=> {
    load()
})


//検索条件が書き換えられた時更新する
watch(() => props.sqlValue, () => {
    dataList.value.length = 0;
    load();
})


</script>