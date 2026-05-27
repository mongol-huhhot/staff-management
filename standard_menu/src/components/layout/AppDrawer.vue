<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  open:   Boolean,
  width:  Number,
  menus:  { type:Array, default:()=>[] },
  isDisabled: Function,
  currentTopMenuLabel: String
})
const emit = defineEmits(['update:open','update:width','select'])

function addIds(list, pre = '', level = 1) {
  return list.map((m, i) => ({
    ...m,
    id: m.id ?? `${pre}${i}`,
    level,
    children: m.children ? addIds(m.children, `${pre}${i}-`, level + 1) : undefined,
  }))
}
const menusWithIds = computed(() => addIds(props.menus))

function flattenMenus(list) {
  let res = []
  for (const item of list) {
    res.push(item)
    if (item.children) {
      res = res.concat(flattenMenus(item.children))
    }
  }
  return res
}
const flatMenus = computed(() => flattenMenus(menusWithIds.value))

function isDis(item) {
  return props.isDisabled ? props.isDisabled(item) : !!item.disabled
}
const selectedId = ref(null)
function onClick(item) {
  if (isDis(item)) return
  selectedId.value = item.id 
  const payload = item.content ?? item
  emit('select', payload)
}

const drawerWidth = ref(props.width || 250)
const internalOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

let resizing = false
function start() {
  resizing = true
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', stop)
}

function move(e){
  if(!resizing) return
  let w=Math.max(150,Math.min(400,e.clientX))
  drawerWidth.value=w
  emit('update:width', w)
}
function stop() {
  resizing = false
  window.removeEventListener('mousemove', move)
  window.removeEventListener('mouseup', stop)
}

onBeforeUnmount(stop)

// ✨ ADD: language selection
const lang = ref(localStorage.getItem('lang') || 'ja')

// ✨ ADD: function to get the label in the current language
function getLabel(item) {
  if (!item) return ''
  if (lang.value === 'ja' || !item[`label_${lang.value}`]) {
    return item.label
  }
  return item[`label_${lang.value}`]
}
</script>

<template>
  <v-navigation-drawer
    app
    v-model="internalOpen"
    :width="drawerWidth"
    class="drawer"
  >
    <v-btn icon class="toggle" @click="internalOpen = false">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <div style="margin-left: 10px;font-weight: bold; color: #00B9EF;" >  {{ currentTopMenuLabel }}   </div>
    <div class="ml-6 mb-2 small-text">△下記のメニューから選択</div>


    <hr class="mb-1" />

    <v-list dense nav class="custom-list">
      <v-list-item
        v-for="item in flatMenus"
        :key="item.id"
        :class="[
        'custom-item',
        { disabled: isDis(item), 
          'level-2': item.level === 2,
        'level-1': item.level === 1,
        'active-item': selectedId === item.id }
        ]"
        @click="() => onClick(item)"
      >
        <v-list-item-content>
          <!-- <v-list-item-title>
            {{ item.level === 1 ? '1. ' : '' }}{{ item.label }}
          </v-list-item-title> -->
          <v-list-item-title class="normal-font d-flex align-center">
            <span v-if="item.level === 1"
              class="circle-number mr-2"
            ></span>
            {{ getLabel(item) }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <div class="handle" @mousedown="start"></div>
  </v-navigation-drawer>
</template>

<style scoped>
  /*メニューのフォントを通常のものに変更 */
.normal-font {
  font-weight: normal !important;  
  /*font-size: 14px !important;*/    
  font-family: Arial, Helvetica, sans-serif !important;  
  /* color: #000 !important;            */
}

.drawer {
  position: relative;
  overflow: hidden;
}

.toggle {
  position: absolute;
  top: 10px;
  right: -40px;
}

.handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  background: rgba(0, 0, 0, 0.07);
}

.disabled {
  color: gray;
  pointer-events: none;
}

.custom-list {
   /*font-size: 70px;*/
     font-family: 'Yu Gothic', 'Meiryo', 'MS Gothic', sans-serif; 
}

.custom-item {
  padding-top: 2px !important;  /* 更小的上下间距 */
  padding-bottom: 2px !important;
  min-height: unset !important; /* 移除默认的最小高度限制 */
}
/* 一级菜单之间上下间距大一点 */
.level-1 {
  margin-top: 10px;
  margin-bottom: 10px;
}

/* 二级菜单靠右对齐 */
.level-2 {
  padding-left: 32px !important;
}
.circle-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #00B9EF;
  font-weight: bold;
  font-size: 14px;
  /* color: gray; */
  transition: color 0.2s, background-color 0.2s;
}
/* 选中菜单项的样式 */
.active-item {
  color: #00B9EF !important;
  font-weight: bold;
}

/* 鼠标悬停时改变颜色 */
.custom-item:hover {
  color: #00B9EF;
  cursor: pointer;
}
/* 激活状态下的圆形编号变色 */
.active-item .circle-number {
  background-color: #00B9EF;
  color: white;
}

/* 悬停状态下的圆形编号变色 */
.custom-item:hover .circle-number {
  background-color: #00B9EF;
  color: white;
}
.small-text {
  font-size: 0.90rem; /* 约等于12px，但更具可伸缩性 */
}
</style>
