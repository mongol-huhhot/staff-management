<script setup>
import { useStaffMasterStore } from '@/stores/StaffMasterStore';
import AgGridDataBrowser from '@/components/AgGridDataBrowser.vue'
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import StaffDetailTemplate from './StaffDetailTemplate.vue';
import { useBaseStore } from '@/stores/BaseStore'
import ResponsiveSplitFrame from './ResponsiveSplitFrame.vue';
import { watch, onBeforeMount } from 'vue'
import {useStatesStore}  from "@/stores/AppStatesStore"

const dataStore = useStaffMasterStore();
const statesStore = useStatesStore()

watch(()=>statesStore.showDataStates, async(val) => {
  if(!statesStore.showDataStates) return

  localStorage.setItem('splitStatus', val)
  await dataStore.loadStaffList({draft_status: statesStore.showDataStates})

}, {immediate: true, deep: true} )

async function login() {
  if (location.href.indexOf('localhost') > 0) {
    const baseStore = useBaseStore()
    const sqltag = 'login'
    const params = {'user': 'demo3@janga.co.jp', password:'demo3'}
    const ret = await baseStore.login(sqltag, params)
    if (ret && ret.status === 'success')
      localStorage.setItem('token', ret.data.token);
      return true
  }
  return false
}

onBeforeMount(async () => {
  if(! await login() ) return
  await dataStore.loadStaffList({draft_status: statesStore.showDataStates})
})

/** 新スタッフ情報に入力 */
watch(()=>statesStore.addNewStaff, (v) => {
  if(!v) return
  // 新スタッフ追加中の状態にする
  statesStore.editStates = true

  dataStore.staffModalTitle = '新スタッフ情報'
  dataStore.staffData = {
    staff_code: '',
    staff_name: '',
    user_id: '',
    email: '',
    is_foreigner: '0'
  }, {immediate: true, deep: true}
})

</script>

<template>
  <ResponsiveSplitFrame>
    <template #header>
      <div class="text-h5" style="margin: 10px;">個人情報管理</div>
      <v-btn-toggle v-model="statesStore.showDataStates" mandatory class="ml-4">
        <v-btn value="draft" :color="statesStore.showDataStates === 'draft' ? 'info' : ''">
          <v-icon>mdi-pencil</v-icon> 作成中
        </v-btn>
        <v-btn value="pending" :color="statesStore.showDataStates === 'pending' ? 'secondary' : ''">
          <v-icon>mdi-send</v-icon> 提出済
        </v-btn>
        <v-btn value="approved" :color="statesStore.showDataStates === 'approved' ? 'success' : ''">
          <v-icon>mdi-check-circle</v-icon> 適用中
        </v-btn>
      </v-btn-toggle>
      <v-btn-toggle v-model="statesStore.addNewStaff" class="ml-4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              value="true"
              :color="statesStore.addNewStaff ? 'error' : ''"
              v-bind="attrs"
              v-on="on || {}"
            >
              <v-icon>mdi-plus</v-icon> 
              <template v-if="statesStore.addNewStaff">新スタッフ追加中...</template>
              <template v-else>新スタッフ</template>
            </v-btn>
          </template>
          <!-- Tooltip Text -->
          <span>新規スタッフ追加には押して、「新スタッフ追加中...」してください</span>
        </v-tooltip>
      </v-btn-toggle>
    </template>
    <template #left>
      <AgGridDataBrowser :data="dataStore.current_list" :columns="dataStore.evaluation_system_columns" />
    </template>
    <template #right>
      <StaffDetailTemplate :title="dataStore.staffModalTitle" />
    </template>
  </ResponsiveSplitFrame>
</template>
