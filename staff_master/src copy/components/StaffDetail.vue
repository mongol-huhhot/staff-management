<template>
    <div class="text-h6" style="margin-top: 30px;margin-left: 30px;">個人情報申請</div>

    <div class="detailTemp">
        <StaffDetailTemplate></StaffDetailTemplate>
    </div>
    
</template>

<script setup>
import StaffDetailTemplate from './StaffDetailTemplate.vue';
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";

const store = usestaffDetailStore();

onMounted(async () => {
    // if(location.href.indexOf('localhost') > 0){
    //     const url = '/jwtr250558/dataEngine/v1/signin.php';
    //     const obj = {'userid': '', pass:'', login_type:'2' };
    //     obj.orgid = 'jwtr250558';
    //     const response = await fetch(url, {
    //         method:'POST'
    //         ,headers:{
    //             'Content-Type':'application/json'
    //         }
    //         ,body:JSON.stringify(obj)
    //     });
    //     const data = await response.json();
    // }

    store.myDataLoad()
})

</script>

<style scoped>

.detailTemp{
    margin: 20px;
}

.localSaveBtn{
    margin-left: 20px;
    margin-bottom: 10px;
}

</style>