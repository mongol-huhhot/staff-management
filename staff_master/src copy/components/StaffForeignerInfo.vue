<template>
    <v-row>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.roma_name"
                :original="staffDetailStore.diffData.roma_name"
                label="ローマ字氏名"
                density="compact"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.roma_name_kana"
                :original="staffDetailStore.diffData.roma_name_kana"
                label="ローマ字氏名"
                density="compact"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" md="3">
            <DynamicSelectBoxDiff
                :is-auto-comp="true"
                v-model="staffDetailStore.staffData.country_code"
                :original="staffDetailStore.diffData.country_code"
                label="国籍/地域"
                sql-tag="get_country_list"
            ></DynamicSelectBoxDiff>
        </v-col>
        <v-col cols="6" md="3">
            <DynamicSelectBoxDiff
                :is-auto-comp="true"
                v-model="staffDetailStore.staffData.residence_code"
                :original="staffDetailStore.diffData.residence_code"
                label="在留資格"
                sql-tag="get_residence_list"
            ></DynamicSelectBoxDiff>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.residence_end_date"
                :original="staffDetailStore.diffData.residence_end_date"
                label="在留期間満了日"
                density="compact"
                type="tel"
                :is-date="true"
            ></DiffTextField>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="6" md="3">
            <DiffSelect
                v-model="staffDetailStore.staffData.has_other_work_permission"
                label="資格外活動許可"
                :items="[{title:'無', value:'0'}, {title:'有',value:'1'}]"
                density="compact"
                :original="staffDetailStore.diffData.has_other_work_permission"
            ></DiffSelect>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.residence_card_number"
                :original="staffDetailStore.diffData.residence_card_number"
                label="在留カード番号"
                density="compact"
            ></DiffTextField>
        </v-col>
        <v-col cols="12" md="6">
            <DiffSelect
                v-model="staffDetailStore.staffData.foreigner_haken_type"
                label="派遣・請負就労区分"
                :items="[{title:'1 派遣・請負労働者として主として当該事業所以外で就労する場合', value:'1'}, {title:'1に該当しない場合',value:'2'}]"
                density="compact"
                :original="staffDetailStore.diffData.foreigner_haken_type"
            ></DiffSelect>
        </v-col>
    </v-row>

</template>

<script setup>
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";
import DiffTextField from '@/components/DiffTextField.vue'
import DiffSelect from "./DiffSelect.vue";
import DynamicSelectBoxDiff from "./DynamicSelectBoxDiff.vue";

const staffDetailStore = usestaffDetailStore();

</script>