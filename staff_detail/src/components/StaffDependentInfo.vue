<template>
    <div v-for="(dep, index) in staffDetailStore.staffData?.dep_array" :key="index" class="depContainer" >
        <div class="text-h6" style="">家族情報{{ index + 1 }}</div>
        <v-row>
            <v-col cols="6" md="3">
                <DynamicSelectBoxDiff
                    v-model="dep.dependent_relationship"
                    label="扶養者続柄"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_relationship"
                    sql-tag="get_relation_ship_no_himself"
                ></DynamicSelectBoxDiff>
            </v-col>
            <v-col cols="6" md="3">
                <DiffSelect
                    v-model="dep.dependent_tax_flg"
                    label="税扶養区分"
                    :items="[ {title:'対象',value:'1'},{title:'対象外', value:'0'},]"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_tax_flg"
                ></DiffSelect>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_name"
                    label="家族氏名"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_name"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_name_kana"
                    label="家族氏名カナ"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_name_kana"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_birthday"
                    label="生年月日"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_birthday"
                    type="tel"
                    :is-date="true"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffSelect
                    v-model="dep.dependent_gender"
                    label="性別"
                    :items="[ {title:'男',value:'1'},{title:'女', value:'0'},]"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_gender"
                ></DiffSelect>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_business"
                    label="職業"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_business"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffSelect
                    v-model="dep.dependent_together_flg"
                    label="同居区分"
                    :items="[ {title:'同居',value:'1'},{title:'別居', value:'0'},]"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_together_flg"
                    @change="staffDetailStore.changeTogether(index)"
                ></DiffSelect>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_post_code"
                    label="郵便番号"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_post_code"
                    @input="staffDetailStore.dependentPostCodeStter(index)"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_address_1"
                    label="都道府県"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_address_1"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_address_2"
                    label="市区町村"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_address_2"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_address_3"
                    label="丁目番地"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_address_3"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_address_4"
                    label="建物名・部屋番号"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_address_4"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="dep.dependent_address_kana"
                    label="住所カナ"
                    density="compact"
                    :original="staffDetailStore.diffData?.dep_array?.find((e) => e.id == dep.id)?.dependent_address_kana"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-btn @click="addDep" v-if="staffDetailStore.staffData.dep_array.length === index + 1" color="success">追加</v-btn>
                <v-btn @click="removeDep(index)" style="margin-left: 50px;" color="#d9534f">削除</v-btn>
            </v-col>
        </v-row>
    </div>
</template>
<script setup>
import DiffTextField from './DiffTextField.vue';
import DiffSelect from './DiffSelect.vue';
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue';
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";

const staffDetailStore = usestaffDetailStore();

const addDep = () => {
    const maxId = staffDetailStore.staffData.dep_array?.reduce((a, b) => {
        return Math.max(a.id, b.id)
    });
    let id;
    if(!maxId )
        id = 0;
    id = maxId + 1;
    staffDetailStore.staffData.dep_array.push({id:id})
}

const removeDep = (index) => {
    if(staffDetailStore.staffData.dep_array.length === 1){
        staffDetailStore.staffData.dep_array = [{id:1}];
        return
    }
    staffDetailStore.staffData.dep_array = staffDetailStore.staffData.dep_array.filter((e, i) => i !== index );
}


</script>
<style scoped>
.depContainer{
    border: 1px black solid;
    padding: 5px;
    padding-bottom: 20px;
}
</style>