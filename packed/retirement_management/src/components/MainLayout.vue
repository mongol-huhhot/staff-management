<!-- MainLayout.vue 退職申請管理は一覧単独レイアウト（詳細はダイアログ表示） -->
<script setup>
import MainList from '@/components/MainList.vue'
</script>

<template>
  <div class="main-layout-container">
    <MainList />
  </div>
</template>

<style scoped>
.main-layout-container {
  height: calc(100vh - 80px);
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
