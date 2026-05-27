<template>
    <v-form v-model="staffDetailStore.baseForm">
        <v-row>
            <!-- <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.userid"
                    label="スタッフコード"
                    density="compact"
                    :original="staffDetailStore.diffData.userid"
                    :disabled="true"
                ></DiffTextField>
            </v-col> -->
            <v-col cols="6" md="3">
                <DiffSelect
                    v-model="staffDetailStore.staffData.is_foreigner"
                    label="国籍区分"
                    :items="[{title:'日本人', value:'0'}, {title:'外国人',value:'1'}]"
                    density="compact"
                    :original="staffDetailStore.diffData?.is_foreigner"
                ></DiffSelect>
                
            </v-col>
            <div class="pa-4 text-center">
                <v-btn
                    class="text-none font-weight-regular"
                    text="メールアドレス更新"
                    color="info"
                    ref="modalActivater"
                    v-model="staffDetailStore.dialogVisible"
                ></v-btn>
            </div>
        </v-row>

        <v-row >
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.family_name"
                    :original="staffDetailStore.diffData?.family_name"
                    label="姓"
                    density="compact"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.given_name"
                    :original="staffDetailStore.diffData?.given_name"
                    label="名"
                    density="compact"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.family_name_kana"
                    label="姓カナ"
                    density="compact"
                    :original="staffDetailStore.diffData?.family_name_kana"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.given_name_kana"
                    label="名カナ"
                    density="compact"
                    :original="staffDetailStore.diffData?.given_name_kana"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.business_family_name"
                    label="ビジネスネーム姓"
                    density="compact"
                    :original="staffDetailStore.diffData?.business_family_name"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.business_given_name"
                    label="ビジネスネーム名"
                    density="compact"
                    :original="staffDetailStore.diffData?.business_given_name"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.old_family_name"
                    label="旧姓"
                    density="compact"
                    :original="staffDetailStore.diffData?.old_family_name"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.birthday"
                    label="生年月日"
                    type="tel"
                    density="compact"
                    :original="staffDetailStore.diffData?.birthday"
                    :is-date="true"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffSelect
                    v-model="staffDetailStore.staffData.gender"
                    label="性別"
                    :items="[{title:'男', value:'1'}, {title:'女',value:'0'}, {title:'無回答', value:'2'}]"
                    density="compact"
                    :original="staffDetailStore.diffData?.gender"
                ></DiffSelect>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.pc_mail"
                    label="メールアドレス"
                    type="email"
                    density="compact"
                    :disabled="true"
                    :original="staffDetailStore.diffData?.pc_mail"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.current_post_code"
                    label="郵便番号"
                    type="tel"
                    message="数字のみ"
                    density="compact"
                    :original="staffDetailStore.diffData?.current_post_code"
                    @input="staffDetailStore.currentPostCodeSetter"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.current_address_1"
                    label="都道府県"
                    density="compact"
                    :original="staffDetailStore.diffData?.current_address_1"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.current_address_2"
                    label="市区町村"
                    density="compact"
                    :original="staffDetailStore.diffData?.current_address_2"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.current_address_3"
                    label="丁目番地"
                    density="compact"
                    :original="staffDetailStore.diffData?.current_address_3"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.current_address_4"
                    label="建物名・部屋番号"
                    density="compact"
                    :original="staffDetailStore.diffData?.current_address_4"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="9">
                <DiffTextField
                    v-model="staffDetailStore.staffData?.current_address_kana"
                    label="住所カナ"
                    density="compact"
                    :original="staffDetailStore.diffData?.current_address_kana"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DynamicSelectBoxDiff
                    v-model="staffDetailStore.staffData.household_relationship"
                    label="世帯主続柄"
                    density="compact"
                    :original="staffDetailStore.diffData.household_relationship"
                    sql-tag="get_relation_ship_all"
                ></DynamicSelectBoxDiff>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.household_name"
                    label="世帯主名"
                    density="compact"
                    :original="staffDetailStore.diffData.household_name"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row style="padding-top: 20px;">
            <v-btn @click="equalCurrent">現住所から住民票住所にコピー</v-btn>
        </v-row>
        <v-row>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.residence_post_code"
                    label="住民票郵便番号"
                    type="tel"
                    message="数字のみ"
                    density="compact"
                    :original="staffDetailStore.diffData.residence_post_code"
                    @input="staffDetailStore.residencePostCodeSetter"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.residence_address_1"
                    label="都道府県"
                    density="compact"
                    :original="staffDetailStore.diffData.residence_address_1"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.residence_address_2"
                    label="市区町村"
                    density="compact"
                    :original="staffDetailStore.diffData.residence_address_2"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.residence_address_3"
                    label="丁目番地"
                    density="compact"
                    :original="staffDetailStore.diffData.residence_address_3"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.residence_address_4"
                    label="建物名・部屋番号"
                    density="compact"
                    :original="staffDetailStore.diffData.residence_address_4"
                ></DiffTextField>
            </v-col>
            <v-col cols="12" md="9">
                <DiffTextField
                    v-model="staffDetailStore.staffData.residence_address_kana"
                    label="住所カナ"
                    density="compact"
                    :original="staffDetailStore.diffData.residence_address_kana"
                ></DiffTextField>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="3">
                <DiffTextField
                    v-model="staffDetailStore.staffData.tel_no"
                    label="電話番号"
                    density="compact"
                    type="tel"
                    :original="staffDetailStore.diffData.tel_no"
                ></DiffTextField>
            </v-col>
        </v-row>
    </v-form>

    <v-dialog
        :activator="modalActivater"
        v-model="staffDetailStore.dialogVisible"
        max-width="600"
        >
            <v-card
                title="メールアドレス更新"
            >
                <v-card-text>
                    <v-row dense>
                        <v-col
                        cols="12"
                        >
                        <DiffTextField
                            v-model="staffDetailStore.staffData.update_pc_mail"
                            label="更新するメールアドレス"
                            type="email"
                            density="compact"
                            :rules="[email: staffDetailStore.rules.email]"
                            :original="staffDetailStore.diffData.update_pc_mail"
                        ></DiffTextField>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-btn
                        text="閉じる"
                        variant="plain"
                        @click="staffDetailStore.dialogVisible = false"
                    ></v-btn>

                    <v-btn
                        color="primary"
                        text="保存"
                        variant="plain"
                        @click="staffDetailStore.saveMail"
                    ></v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
</template>
<script setup>
import { usestaffDetailStore } from "@/stores/staffDetailStore.js";
import DiffTextField from '@/components/DiffTextField.vue'
import DiffSelect from "./DiffSelect.vue";
import DynamicSelectBoxDiff from "./DynamicSelectBoxDiff.vue";


const modalActivater = ref();
const staffDetailStore = usestaffDetailStore();

const equalCurrent = () => {
    staffDetailStore.staffData.residence_post_code = staffDetailStore.staffData.current_post_code;
    staffDetailStore.staffData.residence_address_1 = staffDetailStore.staffData.current_address_1;
    staffDetailStore.staffData.residence_address_2 = staffDetailStore.staffData.current_address_2;
    staffDetailStore.staffData.residence_address_3 = staffDetailStore.staffData.current_address_3;
    staffDetailStore.staffData.residence_address_4 = staffDetailStore.staffData.current_address_4;
    staffDetailStore.staffData.residence_address_kana = staffDetailStore.staffData.current_address_kana;
}

</script>

<style >
.diffColor .v-input__control{
    background-color: yellow;
}
</style>

<style scoped>
[class^="v-col-"] {
    padding-top: 0;
    padding-bottom: 0;
    
}
</style>

<style>
.v-input__details{
    padding-top: 0;
    height: 0;
    display: none;
}
</style>
