<script setup>
const props = defineProps({
  contentType: String,
  activeComponent: null,
  iframeSrc: String,
  placeholder: String
})
</script>

<template>
  <v-main class="main">
    <v-container fluid>
      <component
        v-if="contentType==='component' && activeComponent"
        :is="activeComponent"
      />
      <iframe
        v-else-if="contentType==='iframe'"
        :src="iframeSrc"
        class="iframe"
      />
      <div v-else class="empty">
        {{ placeholder || '左メニューから項目を選択してください。' }}
      </div>
    </v-container>
  </v-main>
</template>

<style scoped>
.main { --v-layout-top:112px!important }
.iframe { width:100%;height:calc(100vh - 112px);border:none }
.empty { margin:60px 30px;color:#666 }
</style>
