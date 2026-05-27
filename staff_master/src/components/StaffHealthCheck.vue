<template>


<div v-for="(health_check, index) in staffDetailStore.staffData?.health_array||[{}]" :key="index" class="depContainer" >
    <div class="text-h6" style="">健康診断{{ index + 1 }}</div>
    <v-row>
        <v-col cols="6">
            <DiffSelect
                label="健康診断種類"
                v-model="health_check.health_check_type"
                :original="staffDetailStore.diffData?.health_array?.find((e) => e.trainig_code == health_check.trainig_code)?.health_check_type"
                :items="[{title:'定期健診', value:'periodic' }, {title:'入社前健診', value:'pre_emp'}, {title:'診断書', value:'certificate'}]"
            ></DiffSelect>
        </v-col>
        <v-col cols="6" >
            <DiffTextField
                v-model="health_check.health_check_date"
                :is-date="true"
                label="受診日"
                :original="staffDetailStore.diffData?.health_array?.find((e) => e.trainig_code == health_check.trainig_code)?.health_check_date"
            ></DiffTextField>
        </v-col>
    </v-row>


    
    <h4>健康診断書</h4>
    <QrMobileImageField  
        decsription="health_check"
        v-model:fileObjArray="health_check.fileObjArray"
        :ref = "(el) => health_check.imageRef = el"
        title="健康診断書"
    ></QrMobileImageField>
    <div style="margin-top: 10px;">
        <ImageView :fk-id="`health_check_${staffDetailStore.staffData.staff_id}_${health_check.health_check_date}`" max-height="200" />
    </div>
    <QrMobileImageField  
        decsription="health_check2"
        v-model:fileObjArray="health_check.fileObjArray2"
        :ref = "(el) => health_check.imageRef2 = el"
        title="健康診断書2"
    ></QrMobileImageField>
    <div style="margin-top: 10px;">
        <ImageView :fk-id="`health_check2_${staffDetailStore.staffData.staff_id}_${health_check.health_check_date}`" max-height="200" />
    </div>



    <v-row style="margin-top: 10px;" >
        <v-col cols="12">
            <v-btn @click="addHealthCheck" color="success">追加</v-btn>
            <v-btn @click="removeHealthCheck(index)" v-if="staffDetailStore.staffData.health_array.length !== 0" style="margin-left: 50px;" color="#d9534f">削除</v-btn>
        </v-col>
    </v-row>

</div>

</template>
<script setup >
import DiffTextField from './DiffTextField.vue';
import DiffSelect from './DiffSelect.vue';
import QrMobileImageField from './QrMobileImageField.vue';
import ImageView from './ImageView.vue';
import { usestaffDetailStore } from '@/stores/staffDetailStore';

const staffDetailStore = usestaffDetailStore();




const removeHealthCheck = (index)  =>{

}

</script>