<script setup>
// import {defineProps, defineEmits} from 'vue'
import { useDark, useStorage } from '@vueuse/core'
import  vueDraggableResizable  from 'vue-draggable-resizable'
import "vue-draggable-resizable/style.css";

/**
 * 使用例
 * クローズイベントは子ではなく親で実行×を押したらイベントを出すだけ
 * 必須
 * v-show
 * @closeEvent
 * stragename
    <Teleport to="#sou-banking-id">
        <DrraggableModal v-show="sumModalShow"  @closeEvent="() => sumModalShow = false" stragename="sumModal" :w="300" :h="100" :x="-200" :y="320" >
            合計額：bbbbbbbbbbb
        </DrraggableModal>
    </Teleport>
 */


const isDark = useDark();

const props = defineProps({
    stragename:String  //必須（ローカルストレージの場所名）
    ,w:Number
    ,h:Number
    ,x:Number
    ,z:Number
});

const popupState =  useStorage(props.stragename, {x:props.x, y:props.y, h:props.h, w:props.w})


const emit = defineEmits(['closeEvent']);

function setDragPosition(x, y){
    popupState.value.x = x;
    popupState.value.y = y;
}

function onResizestop(x, y, w, h){
    popupState.value = {x:x, y:y, w:w, h:h}
}

const closeClick = () => {
    emit('closeEvent');
}


</script>

<template>
    <vue-draggable-resizable  :class="[isDark ? 'dark-bg' :  'white-bg', 'modal']"
    @drag-stop="setDragPosition" 
    @resize-stop="onResizestop"  
    :w="popupState.w" :h="popupState.h" :x="popupState.x" :y="popupState.y" :z="props.z ? props.z : 999">
        <div class="title">
            <slot name="title"></slot>
            <v-icon
                class="closeButton"
                icon="mdi-close-circle-outline"
                @click="closeClick"
            ></v-icon>
        </div>
        <hr>
        <div class="modal-body">
            <slot></slot>
        </div>
    </vue-draggable-resizable>
</template>

<style scoped>


.dark-bg{
    background-color: black;
}
.white-bg{
    background-color: white;
}

.title{
    height: 30px;
    padding-top: 5px;
    padding-left: 5px;
}
.modal{
    box-shadow: 0 4px 16px #00000026;
    position: fixed;
    top:0;
}
.closeButton{
    position:absolute;
    top:0;
    right: 0;
    font-size: 30px;
}

.modal-body{
    padding: 30px;
    padding-top: 10px;
}

</style>