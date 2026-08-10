<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import ResignationRequest from '@/components/request/ResignationRequest.vue'
import ResignationManagement from '@/components/resignation/ResignationManagement.vue'
import ResignationChecklistMaster from '@/components/resignation/ResignationChecklistMaster.vue'

const dataStore = useDataStore()

const appType = computed(() =>
    dataStore.params?.attributes?.app_type ||
    new URLSearchParams(window.location.search).get('type') ||
    '')

// request   → 退職申請 (Screen 1)
// checklist → チェックリスト管理（手続きマスター登録・別メニュー用）
// その他     → スタッフ入退管理 (Screen 2)
const screen = computed(() => {
    switch (appType.value) {
        case 'request': return 'request'
        case 'checklist': return 'checklist'
        default: return 'resignation'
    }
})
</script>

<template>
  <div class="main-layout-container">
    <ResignationRequest v-if="screen === 'request'" />
    <ResignationChecklistMaster v-else-if="screen === 'checklist'" />
    <ResignationManagement v-else />
  </div>
</template>

<style scoped>
.main-layout-container {
  height: calc(100vh - 120px);
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
