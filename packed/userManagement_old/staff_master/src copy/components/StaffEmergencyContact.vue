<template>
    <v-row>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_family_name"
                label="緊急連絡先姓"
                density="compact"
                :original="staffDetailStore.diffData.emergency_family_name"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_given_name"
                label="緊急連絡先名"
                density="compact"
                :original="staffDetailStore.diffData.emergency_given_name"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_family_name_kana"
                label="緊急連絡先姓カナ"
                density="compact"
                :original="staffDetailStore.diffData.emergency_family_name_kana"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_given_name_kana"
                label="緊急連絡先名カナ"
                density="compact"
                :original="staffDetailStore.diffData.emergency_given_name_kana"
            ></DiffTextField>
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="6" md="3">
            <DynamicSelectBoxDiff
                v-model="staffDetailStore.staffData.emergency_relationship"
                label="緊急連絡先続柄"
                :original="staffDetailStore.diffData.emergency_relationship"
                sql-tag="get_relation_ship_no_himself"
            ></DynamicSelectBoxDiff>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_tell_no"
                label="緊急連絡先名電話番号"
                density="compact"
                :original="staffDetailStore.diffData.emergency_tell_no"
            ></DiffTextField>
        </v-col>
    </v-row>
    
    <div style="margin-top: 20px;">緊急連絡先住所</div>
    <v-row>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_post_code"
                label="郵便番号"
                type="tel"
                message="数字のみ"
                density="compact"
                :original="staffDetailStore.diffData.emergency_post_code"
                @input="staffDetailStore.emergencyPostCodeSetter"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_address_1"
                label="都道府県"
                density="compact"
                :original="staffDetailStore.diffData.emergency_address_1"
            ></DiffTextField>
        </v-col>
        <v-col cols="12" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_address_2"
                label="市区町村"
                density="compact"
                :original="staffDetailStore.diffData.emergency_address_2"
            ></DiffTextField>
        </v-col>
        <v-col cols="12" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_address_3"
                label="丁目番地"
                density="compact"
                :original="staffDetailStore.diffData.emergency_address_3"
            ></DiffTextField>
        </v-col>
        <v-col cols="12" md="3">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_address_4"
                label="建物名・部屋番号"
                density="compact"
                :original="staffDetailStore.diffData.emergency_address_4"
            ></DiffTextField>
        </v-col>
        <v-col cols="12" md="9">
            <DiffTextField
                v-model="staffDetailStore.staffData.emergency_address_kana"
                label="住所カナ"
                density="compact"
                :original="staffDetailStore.diffData.emergency_address_kana"
            ></DiffTextField>
        </v-col>
    </v-row>

</template>
<script setup>
import DiffTextField from './DiffTextField.vue';
import DiffSelect from './DiffSelect.vue';
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue';

const staffDetailStore = usestaffDetailStore();

</script>