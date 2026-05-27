<template>
    <v-form v-model="staffDetailStore.bankForm">
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.bank_name"
                    label="銀行名"
                    density="compact"
                    :original="staffDetailStore.diffData.bank_name"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.bank_code"
                    label="銀行コード"
                    density="compact"
                    :original="staffDetailStore.diffData.bank_code"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.branch_name"
                    label="支店名"
                    density="compact"
                    :original="staffDetailStore.diffData.branch_name"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.branch_code"
                    label="支店コード"
                    density="compact"
                    :original="staffDetailStore.diffData.branch_code"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffSelect
                    v-model="staffDetailStore.staffData.bank_account_type"
                    label="預金種別"
                    :items="[{title:'普通', value:'0'}, {title:'当座',value:'1'}, {title:'貯蓄', value:'2'}]"
                    density="compact"
                    :original="staffDetailStore.diffData.bank_account_type"
                ></DiffSelect>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.bank_account"
                    label="口座番号"
                    density="compact"
                    :original="staffDetailStore.diffData.bank_account"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.bank_account_kana"
                    label="口座名義人"
                    density="compact"
                    :original="staffDetailStore.diffData.bank_account_kana"
                ></DiffTextField>
            </v-col>
        </v-row>
        <h2 style="margin-top: 20px;">その他申請情報</h2>
        <v-row>
            <v-col cols="12" md="3">
                <DiffSelect
                    v-model="staffDetailStore.staffData.self_type"
                    label="障害者区分"
                    :items="[{title:'障害者でない', value:''}, {title:'一般障害者',value:'1'}, {title:'特別障害者', value:'2'}]"
                    density="compact"
                    :original="staffDetailStore.diffData.self_type"
                ></DiffSelect>
            </v-col>
            <v-col cols="12" md="9">
                <DiffTextField
                    v-model="staffDetailStore.staffData.disabled_remark"
                    label="障害者詳細"
                    density="compact"
                    :original="staffDetailStore.diffData.disabled_remark"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="3">
                <DiffSelect
                    v-model="staffDetailStore.staffData.widow_type"
                    label="ひとり親・寡婦"
                    :items="[{title:'対象外', value:''}, {title:'ひとり親',value:'1'}, {title:'寡婦', value:'2'}]"
                    density="compact"
                    :original="staffDetailStore.diffData.widow_type"
                ></DiffSelect>
            </v-col>
            <v-col cols="12" md="9">
                <DiffTextField
                    v-model="staffDetailStore.staffData.widow_remark"
                    label="ひとり親・寡婦詳細"
                    density="compact"
                    :original="staffDetailStore.diffData.widow_remark"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="4">
                <DiffSelect
                    v-model="staffDetailStore.staffData.working_student_flag"
                    label="勤労学生区分"
                    :items="[{title:'対象外', value:''}, {title:'勤労学生',value:'1'}]"
                    density="compact"
                    :original="staffDetailStore.diffData.working_student_flag"
                ></DiffSelect>
            </v-col>
            <v-col cols="12" md="4">
                <DiffTextField
                    v-model="staffDetailStore.staffData.working_school_name"
                    label="勤労学生詳細（学校名）"
                    density="compact"
                    :original="staffDetailStore.diffData.working_school_name"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="4">
                <DiffTextField
                    v-model="staffDetailStore.staffData.working_admission_date"
                    label="勤労学生詳細（入学年月日）"
                    density="compact"
                    :original="staffDetailStore.diffData.working_admission_date"
                    type="tel"
                    :is-date="true"
                ></DiffTextField>
            </v-col>
        </v-row>
    </v-form>


</template>

<script setup>
import DiffTextField from './DiffTextField.vue';
import DiffSelect from './DiffSelect.vue';
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";

const staffDetailStore = usestaffDetailStore();

</script>

