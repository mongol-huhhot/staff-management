<script setup>
import { computed } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import RetirementRequest from '@/components/request/RetirementRequest.vue'
import RetirementManagement from '@/components/retirement/RetirementManagement.vue'

const dataStore = useDataStore()

const appType = computed(() =>
    dataStore.params?.attributes?.app_type ||
    new URLSearchParams(window.location.search).get('type') ||
    '')

const screen = computed(() =>
    appType.value === 'request' ? 'request' : 'retirement')
</script>

<template>
  <div class="main-layout-container">
    <RetirementManagement v-if="screen !== 'request'" />
    <RetirementRequest v-else />
  </div>
</template>

<style scoped>
.main-layout-container {
  height: calc(100vh - 180px);
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
