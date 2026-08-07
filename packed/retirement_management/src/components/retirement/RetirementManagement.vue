<script setup>
import { ref } from 'vue'
import ProcedureListTab from '@/components/retirement/ProcedureListTab.vue'
import MainList from '@/components/MainList.vue'

const activeTab = ref('branch')
</script>

<template>
  <v-card class="card_box">
    <v-card-title>
      <div class="d-flex align-center flex-wrap ga-3">
        <h4>スタッフ入退管理</h4>
      </div>
    </v-card-title>

    <v-tabs v-model="activeTab" color="primary">
      <v-tab value="branch">現場手続き</v-tab>
      <v-tab value="hr">人事手続き</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="activeTab">
        <v-window-item value="branch">
          <ProcedureListTab scope="branch" />
        </v-window-item>

        <v-window-item value="hr">
          <!-- <ProcedureListTab scope="hr" /> -->
           <MainList />
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 8px 20px 0 0 !important;
}
</style>
