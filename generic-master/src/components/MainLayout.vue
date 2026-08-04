<!-- MainLayout.vue -->
<script setup>
import MainList from '@/components/MainList.vue'
import StaffDetailPane from '@/components/StaffDetailPane.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

</script>

<template>
  <Splitpanes
    ref="splitpanesRef"
    class="default-theme main-layout-container"
  >
    <Pane min-size="10">
      <MainList />
    </Pane>

    <Pane min-size="10">
      <StaffDetailPane />
    </Pane>
  </Splitpanes>
</template>

<style scoped>
.main-layout-container {
  height: calc(100vh - 80px);
  width: 100%;
}

:deep(.splitpanes__pane) {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
