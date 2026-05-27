<script setup>
import StaffDetailTemplate from './StaffDetailTemplate.vue';
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";
import {useBaseStore} from '@/stores/BaseStore'

const store = usestaffDetailStore();

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

    store.myDataLoad({user_id:'demo3'})
})

const configs = {
    staffInput: true,
    approval: true,
}

</script>

<template>
    <div class="text-h6" style="margin-top: 30px;margin-left: 30px;">個人情報申請</div>

    <div class="detailTemp">
        <StaffDetailTemplate></StaffDetailTemplate>
    </div>
    
</template>

<style scoped>

.detailTemp{
    margin: 20px;
}

.localSaveBtn{
    margin-left: 20px;
    margin-bottom: 10px;
}

</style>