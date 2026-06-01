<template>
    <div class="text-h5" style="margin-bottom: 10px;">個人情報管理</div>
    <AgGridDataBrowser
      :data="store.staffList"
      :columns="store.evaluation_system_columns"
    />
    <v-dialog v-model="store.isShowModal" width="95vw" height="90vh" min-height="90vh" @after-leave="store.loadStaffList" >
      <StaffDetailTemplate :title="store.staffModalTitle"  @closeEvent="() => store.isShowModal = false" :is-modal="true" ></StaffDetailTemplate>
    </v-dialog>
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



//const store = useMasterStore();

const store = useStaffMasterStore();

onMounted(async () => {

  const baseStore = useBaseStore()

  if(location.href.indexOf('localhost') > 0){
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
