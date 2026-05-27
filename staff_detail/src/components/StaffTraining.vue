
<template>

 <div v-if="staffDetailStore.staffData?.training_array?.length > 0">

    <div v-for="(training, index) in staffDetailStore.staffData?.training_array||[{}]" :key="index" class="depContainer" >
        <div class="text-h6" style="">研修情報{{ index + 1 }}</div>
        <DynamicSelectBoxDiff
            sql-tag="get_training_list"
            sql-path="sou/staffDetail.sql"
            :label="'研修名'"
            v-model="training.trainig_code"
            :original="staffDetailStore.diffData?.training_array?.find((e) => e.trainig_code == training.trainig_code)?.trainig_code"
            required
        ></DynamicSelectBoxDiff>
        
        <v-row>
            <v-col cols="6" >
                <DiffTextField
                    v-model="training.training_date"
                    :is-date="true"
                    label="研修受講日"
                    :original="staffDetailStore.diffData?.training_array?.find((e) => e.trainig_code == training.trainig_code)?.training_date"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" >
                <DiffTextField
                    v-model="training.training_number"
                    label="受講番号"
                    :original="staffDetailStore.diffData?.training_array?.find((e) => e.trainig_code == training.trainig_code)?.training_number"
                ></DiffTextField>
            </v-col>
        </v-row>


        <v-row >
            <v-col cols="6" >
                <DiffTextField
                    v-model="training.training_place"
                    label="受講場所"
                    :original="staffDetailStore.diffData?.training_array?.find((e) => e.trainig_code == training.trainig_code)?.training_place"
                ></DiffTextField>
            </v-col>
        </v-row>

        
        <h4>受講証明書等</h4>
        <QrMobileImageField  
            decsription="training"
            v-model:fileObjArray="training.fileObjArray"
            :ref = "(el) => training.imageRef = el"
            title="受講証明書"
        ></QrMobileImageField>
        <div style="margin-top: 10px;">
            <ImageView :fk-id="`training_${staffDetailStore.staffData.staff_id}_${training.trainig_code}`" max-height="200" />
        </div>


        <v-row style="margin-top: 10px;" >
            <v-col cols="12">
                <v-btn @click="addTraining" color="success">追加</v-btn>
                <v-btn @click="removeTraining(index)" v-if="staffDetailStore.staffData.training_array.length !== 0 " style="margin-left: 50px;" color="#d9534f">削除</v-btn>
            </v-col>
        </v-row>

    </div>
</div>
<div v-else>
    <p>研修情報がありません。</p>
    <v-btn @click="addTraining" color="success"></v-btn>

</div>

</template>
<script setup>
import { usestaffDetailStore } from '@/stores/staffDetailStore';
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue';
import DiffSelect from './DiffSelect.vue';
import DiffTextField from './DiffTextField.vue';
import QrMobileImageField from './QrMobileImageField.vue';
import ImageView from './ImageView.vue';


const staffDetailStore = usestaffDetailStore();


const addTraining = () => {
    staffDetailStore.staffData.training_array.push({})
}

const removeTraining = (index) => {
    if(staffDetailStore.staffData.training_array.length === 1){
        staffDetailStore.staffData.training_array = [{}];
        return
    }
    staffDetailStore.staffData.training_array = staffDetailStore.staffData.training_array.filter((e, i) => i !== index );
}


</script>

<style scoped>
.depContainer{
    border: 1px black solid;
    padding: 5px;
    padding-bottom: 20px;
}
</style>