<!-- <template>
  <div style="display: flex; flex-wrap: wrap;">
    <div class="text-h5" style="margin: 10px;">個人情報管理</div>
    <div class="text-body-1" style="margin: 14px;">
      <v-chip color="success" text-color="white">作成中</v-chip>
      <v-chip color="error" text-color="white">提出済</v-chip>
      <v-chip color="warning" text-color="white">承認済み（適用中）</v-chip>
    </div>
  </div>
  
  <splitpanes :direction="splitDirection" class="default-theme">
    <pane min-size="2" size="40">
      <AgGridDataBrowser
        :data="store.staffList"
        :columns="store.evaluation_system_columns"
      />
    </pane>
    <pane min-size="20" size="50">
      <StaffDetailTemplate
        :title="store.staffModalTitle"
        @closeEvent="() => store.isShowModal = false"
        :is-modal="true"
      />
    </pane>
  </splitpanes>
</template> -->

<template>
  <div>
    <button @click="splitDirection = splitDirection === 'horizontal' ? 'vertical' : 'horizontal'">
      Toggle Direction (for test)
    </button>
    <splitpanes :direction="splitDirection" style="height: 300px; border: 1px solid #eee">
      <pane><div style="padding:1em;">Pane 1</div></pane>
      <pane><div style="padding:1em;">Pane 2</div></pane>
    </splitpanes>
    <div>Current: {{ splitDirection }}</div>
  </div>
</template>


<script setup>
//import { useMasterStore } from '@/stores/MasterStore';
import { useStaffMasterStore } from '@/stores/StaffMasterStore';
import AgGridDataBrowser from '@/components/AgGridDataBrowser.vue'
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { onMounted } from 'vue';
// import DraggableModal from './DraggableModal.vue';
import StaffDetailTemplate from './StaffDetailTemplate.vue';
import {useBaseStore} from '@/stores/BaseStore'

import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

import { ref, onMounted, onUnmounted } from 'vue'
// import { useWindowSize } from '@vueuse/core' // ← Optionally, if you use vueuse

const splitDirection = ref('horizontal')

function updateDirection() {
  splitDirection.value = window.innerWidth < 768 ? 'vertical' : 'horizontal'
}

onMounted(() => {
  updateDirection()
  window.addEventListener('resize', updateDirection)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateDirection)
})

const store = useStaffMasterStore();

onMounted(async () => {

  if(location.href.indexOf('localhost') > 0){
    const baseStore = useBaseStore()
    const sqltag = 'login'
    const params = {'user': 'demo3@janga.co.jp', password:'demo3'}
    const ret = await baseStore.login(sqltag, params)
    if(!ret) return 

    if(ret.status === 'success')
      localStorage.setItem('token', ret.data.token);

    console.log("ret====", ret)
  }
  

  // if(location.href.indexOf('localhost') > 0){
  //     const url = '/jwtr250558/dataEngine/v1/handleRequest/signin.php';
  //     const obj = {'userid': 'demo3@janga.co.jp', pass:'demo3'};
  //     obj.orgid = 'jwtr250558';
  //     const response = await fetch(url, {
  //         method:'POST'
  //         ,headers:{
  //             'Content-Type':'application/json'
  //         }
  //         ,body:JSON.stringify(obj)
  //     });
  //     console.log('testLogin',response)

  //     const data = await response.json();
  // }

  store.loadStaffList()
})

</script>
