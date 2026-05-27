<template>
    <div v-if="(props?.original || itemValue)&& props?.original!= itemValue" style="font-size: 0.83em;color: cadetblue;">既存値：{{ beforeTitle }}</div>
    <div v-else style="font-size: 0.83em;">　</div>
    <v-select
        v-model="itemValue"
        :density="props.dentisy"
        :items="props.items"
        :label="props.label"
        v-show="!props.isAutoComp"
        @update:model-value="$emit('change')"
    ></v-select>
    <v-autocomplete
        v-model="itemValue"
        :density="props.density"
        :items="props.items"
        :label="props.label"
        v-show="props.isAutoComp"
        @update:modelValue="val => {
            emit('update:modelValue', val);
            emit('change', val); // ✅ now safe
        }"
    ></v-autocomplete>
</template>

<script setup>
import { defineModel, defineProps, computed } from "vue";

const props = defineProps({
    original:String,
    label:String,
    items:Array,
    isAutoComp:{
        typeof:Boolean
        ,default:false
    },
    density: {
        type: String,
        default: 'compact'
    }
});

const emit = defineEmits(['update:modelValue', 'change']) // ✅ Declare 'change' here

const itemValue =  defineModel();

const beforeTitle = computed(() => {
    return props.items.find((e) => e.value == props.original)?.title
})

</script>
