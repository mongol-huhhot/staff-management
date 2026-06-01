<template>

    <div v-for="(qua, index) in staffDetailStore.staffData?.qualification_array||[{}]" :key="index" class="depContainer" >
        <div class="text-h6" style="">資格情報{{ index + 1 }}</div>
        <DynamicSelectBoxDiff
            sql-tag="sel_qualifications_select"
            sql-path="sou/entryCompany.sql"
            :label="'資格種別'"
            v-model:dataList="staffDetailStore.qualList"
            v-model="qua.qid"
            :original="staffDetailStore.diffData?.qualification_array?.find((e) => e.qid == qua.qid && e.other_name == qua.other_name )?.qid"
            required
        ></DynamicSelectBoxDiff>
        <DiffSelect
            v-if="qua.qid === 1"
            v-model="qua.is_future"
            label="取得見込み/取得済み"
            :items="[{title:'取得済み', value:'0',}, {title:'取得見込み', value:'1'}]"
            :original="staffDetailStore.diffData?.qualification_array?.find((e) => e.qid == qua.qid && e.other_name == qua.other_name)?.is_future"
        ></DiffSelect>

        <DiffTextField
            v-if="qua.qid===0"
            v-model="qua.other_name"
            label="資格名"
            :original="staffDetailStore.diffData?.qualification_array?.find((e) => e.qid == qua.qid && e.other_name == qua.other_name)?.other_name"
        ></DiffTextField>
<!-- 
        <div v-if="qua.qid === 1 && qua.is_future === '1'" >資格予定日</div>
        <div v-else >取得取得日</div>
        <WarekiDateField
            v-model="qua.qualification_date"
        ></WarekiDateField>

        <div>満了年月日</div>
        <WarekiDateField
            v-model="qua.expiration_date"
        ></WarekiDateField> -->

        <v-row>
            <v-col cols="6" >
                <DiffTextField
                    v-model="qua.qualification_date"
                    :is-date="true"
                    label="資格取得日"
                    :original="staffDetailStore.diffData?.qualification_array?.find((e) => e.qid == qua.qid && e.other_name == qua.other_name)?.qualification_date"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" >
                <DiffTextField
                    v-model="qua.expiration_date"
                    :is-date="true"
                    label="満了年月日"
                    :original="staffDetailStore.diffData?.qualification_array?.find((e) => e.qid == qua.qid && e.other_name == qua.other_name)?.expiration_date"
                ></DiffTextField>
            </v-col>
        </v-row>

        <DiffTextField
            v-model="qua.qualification_number"
            label="登録番号"
            :original="staffDetailStore.diffData?.qualification_array?.find((e) => e.qid == qua.qid && e.other_name == qua.other_name)?.qualification_number"
        ></DiffTextField>
        <h4>資格証明書等</h4>
        <QrMobileImageField  
            decsription="qualification"
            v-model:fileObjArray="qua.fileObjArray"
            :ref = "(el) => qua.imageRef = el"
            title="資格証明書"
        ></QrMobileImageField>
        <div style="margin-top: 10px;">
            <ImageView :fk-id="`qualification_${staffDetailStore.staffData.staff_id}_${qua.qid}`" max-height="200" />
        </div>

        <div v-show="staffDetailStore.qualList.find((e) => e.value === qua.qid)?.image_num > 1">
            <h4>資格証明書裏面</h4>
            <QrMobileImageField
            decsription="qualification"
            title="資格証明書裏面"
            v-model:fileObjArray="qua.fileObjArray2"
            :ref = "(el) => qua.imageRef2 = el"
            ></QrMobileImageField>
            <div style="margin-top: 10px;">
                <ImageView  :fk-id="`qualification2_${staffDetailStore.staffData.staff_id}_${qua.qid}`" max-height="200" />
            </div>
        </div>

        <v-row style="margin-top: 10px;" >
            <v-col cols="12">
                <v-btn @click="addQua" color="success">追加</v-btn>
                <v-btn @click="removeQua(index)" v-if="staffDetailStore.staffData.qualification_array.length !== 0" style="margin-left: 50px;" color="#d9534f">削除</v-btn>
            </v-col>
        </v-row>

    </div>


</template>
<script setup>
import { usestaffDetailStore } from '@/stores/staffDetailStore';
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue';
import DiffSelect from './DiffSelect.vue';
import DiffTextField from './DiffTextField.vue';
import QrMobileImageField from './QrMobileImageField.vue';
import ImageView from './ImageView.vue';
import { computed } from 'vue';

const staffDetailStore = usestaffDetailStore();

const trainingArray = computed({
    get() {
        // Ensure training_array exists and is an array
        if (!staffDetailStore.staffData.training_array) {
            staffDetailStore.staffData.training_array = [];
        }

        // Show at least one empty item if array is empty
        if (staffDetailStore.staffData.training_array.length === 0) {
            staffDetailStore.staffData.training_array.push({
                trainig_code: '',
                training_date: '',
                training_number: '',
                training_place: '',
                fileObjArray: [],
            });
        }
        return staffDetailStore.staffData.training_array;
    },
    set(value) {
        // Optional: You can allow setting back if needed
        staffDetailStore.staffData.training_array = value;
    }
});


const addQua = () => {
    staffDetailStore.staffData.training_array.push({
        trainig_code: '',
        training_date: '',
        training_number: '',
        training_place: '',
        fileObjArray: [],
    });
}


const removeQua = (index) => {
    if(staffDetailStore.staffData.qualification_array.length === 1){
        staffDetailStore.staffData.qualification_array = [{}];
        return
    }
    staffDetailStore.staffData.qualification_array = staffDetailStore.staffData.qualification_array.filter((e, i) => i !== index );
}


</script>

<style scoped>
.depContainer{
    border: 1px black solid;
    padding: 5px;
    padding-bottom: 20px;
}
</style>