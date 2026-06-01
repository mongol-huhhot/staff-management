<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

// 👇 Add this line to receive status from parent
defineProps({
  status: String
});

const isHorizontal = ref(
  localStorage.getItem('splitDirection') === 'vertical' ? false : true
)
const splitKey = ref(0)

function toggleDirection() {
  isHorizontal.value = !isHorizontal.value
  splitKey.value++
}

// function updateDirection() {
//   const newVal = window.innerWidth > 768
//   if (isHorizontal.value !== newVal) {
//     isHorizontal.value = newVal
//     splitKey.value++
//   }
// }

onMounted(() => {
  // window.addEventListener('resize', updateDirection)
  // updateDirection()
})

onUnmounted(() => {
  // window.removeEventListener('resize', updateDirection)
})

watch(isHorizontal, val => {
  localStorage.setItem('splitDirection', val ? 'horizontal' : 'vertical')
})
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center;">
    <slot name="header" :status="status">
      <div class="text-h5" style="margin: 10px;">Frame Header</div>
    </slot>
    <v-btn
      class="ml-4"
      color="primary"
      @click="toggleDirection"
      variant="outlined"
      style="height:40px;"
    >
      <v-icon left>
        {{ isHorizontal ? 'mdi-view-split-vertical' : 'mdi-view-split-horizontal' }}
      </v-icon>
      {{ isHorizontal ? '横分割表示' : '縦分割表示' }}
    </v-btn>
  </div>

  <splitpanes class="default-theme" :horizontal="isHorizontal" :key="splitKey" style="height:96%;">
    <pane style="padding:0;">
      <div style="display:flex; flex-direction:column; height:calc(100vh - 400px); width:100%;">
        <slot name="left" :status="status" />
      </div>
    </pane>
    <pane style="padding:0; height:100%;">
      <div style="display:flex; flex-direction:column; height:calc(100vh - 190px); width:100%;">
        <slot name="right" :status="status"/>
      </div>
    </pane>
  </splitpanes>
</template>

