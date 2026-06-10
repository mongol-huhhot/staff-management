<!-- 
 StaffDetailWrapper.vue 
    This component serves as a wrapper for the staff detail view, allowing for different tabs to be displayed based on the staff's information.
 -->
<script setup>
import { onMounted, ref, } from "vue";
// import { defineProps } from "vue";

import StaffBaseInfo from "./StaffBaseInfo.vue";
import StaffBankInfo from "./StaffBankInfo.vue";
import StaffEmergencyContact from "./StaffEmergencyContact.vue";
import StaffForeignerInfo from "./StaffForeignerInfo.vue";
import StaffDependentInfo from "./StaffDependentInfo.vue";
import StaffQualification from "./StaffQualification.vue";
import StaffRouteInfo from "./StaffRouteInfo.vue";
import StaffTraining from "./StaffTraining.vue";
import StaffHealthCheck from "./StaffHealthCheck.vue";

import { usestaffDetailStore } from "@/stores/staffDetailStore.js";
import { useAppConfigStore } from "@/stores/AppConfigStore";
import { useStatesStore }  from "@/stores/AppStatesStore"
import DataHandlingSlot from "./slots/DataHandlingSlot.vue";

const statesStore = useStatesStore()
const staffDetailStore = usestaffDetailStore();

const config = useAppConfigStore()

const tab = ref("base");

const tabGroups = ([
  { label: '基本情報', value: 'base' },
  { label: '口座情報/その他申請', value: 'bank' },
  { label: '扶養情報', value: 'dependent' },
  { label: '緊急連絡先', value: 'emergency' },
//   { label: '通勤情報', value: 'route' },
//   { label: '資格情報', value: 'qualification' },
//   { label: '研修情報', value: 'training'},
//   { label:'健康診断' ,value:'healthCheck' }
]);

// const store = usestaffDetailStore();

const props = defineProps({
    title:String,
    isModal:{
        default:false,
        type:Boolean
    }
})
const emit = defineEmits(['closeEvent']);

const closeClick = () => {
    emit('closeEvent');
}

// タブクリック時の処理
const handleTabChange = async (newTab) => {
    // const { valid } = await form.value.validate();

    // if (valid) {
    //     // tab.value = "base";
    //     // showSnackbar('必須項目です', 'error');
    //     return;
    // }

    // if (!valid) {
    //     tab.value = newTab;
    //     return;
    // }
};

// onMounted(()=> {
//     let configs = null
//     if (window?.appConfig) {
//         configs = window?.appConfig 
//     }

//     console.log("configs======", configs)

//     staffDetailStore.staffData.configs = configs;
//     // staffDetailStore.staffData.staff_code = configs?.staff_code; 
//     // console.log(staffDetailStore.staffData, configs)
// })

const mainSlot = ref(null);     // Reference to the slot component

const fetchData = async (p={}) => {
    if (!mainSlot.value?.fetchData) return

    try {
        const result = await mainSlot.value.fetchData();
        if (!result) return
        // store to global storage to share among components
        dataStore.data.userlist = result
    } catch (error) {
        console.error("Error loading data on mount:", error);
    }
}

const formData = ref(null);

onMounted(async () => {
    formData.value = await fetchData({
        // staff_id: staffDetailStore.staffData.staff_id,
    });
    // console.log("staffDetailStore", staffDetailStore)
    // console.log("staffDetailStore.staffData", staffDetailStore.staffData)
    // console.log("staffDetailStore.qualList", staffDetailStore.qualList)
});


// onDataSaved

</script>

<template>
    formForm = {{ formData }}
    <DataHandlingSlot
        ref="mainSlot"
        :data="formData"
        :sqlTags="sqlTags"
        :params="queryParams"
        @data-saved="onDataSaved"
        @data-deleted="onDataDeleted"
        @update:modelValue="updateData"
        >
        <!-- Scoped Slot Content -->
        <template v-slot="{ fetch, save, delete: del, excel, pdf, loading }">
            <v-card height="100%" >
                <v-card-title class="d-flex justify-space-between align-center" v-show="props.title">
                    <div>
                        {{ props.title }}
                    </div>
                    <v-btn
                        icon="mdi-close"
                        variant="text"
                        v-show="props.isModal"
                        style="height: 30px;"
                        @click="closeClick"
                    ></v-btn>
                </v-card-title>

                <!-- <v-row>
                    <v-col cols="12" md="6" style="font-size: 15px;margin-left: 5px;background-color: #eee;">
                        <div >
                            現在状態: <span style="color: red;">{{ staffDetailStore?.approvalStr }}</span> 
                        </div>
                    </v-col>
                </v-row> -->

                <v-alert
                        v-show="staffDetailStore.staffData.reject_reason"
                        type="warning"
                        style="margin: 10px;"
                    >
                    {{ staffDetailStore.staffData.reject_reason }}
                </v-alert>

                <v-card-text style="overflow-y: scroll;height: 75%;"  >
                    <v-tabs-window v-model="tab" >
                        <v-tabs
                            v-model="tab"
                            center-active
                            style="min-height: 48px;"
                        >
                            <v-tab v-for="group in tabGroups"  :key="group.value" :value="group.value" @click="handleTabChange(group.value)">
                                {{ group.label }}
                            </v-tab>
                            <v-tab v-show="false" value="salary">給与情報</v-tab>
                            <v-tab value="foreigner" v-if="staffDetailStore.staffData?.is_foreigner === 'Expatriate'" >外国人情報</v-tab>
                        </v-tabs>
                        <v-tabs-window-item value="base">
                            <!-- ParentComponent.vue -->
                            <StaffBaseInfo
                                v-model:model-value="staffDetailStore.selectedStaff"
                                :diff-data="staffDetailStore.diffData || {}"
                                :rules="{ email: staffDetailStore.rules.email }"
                                :isNew="statesStore.addNewStaff"
                                @current-post-code-input="staffDetailStore.currentPostCodeSetter"
                                @residence-post-code-input="staffDetailStore.residencePostCodeSetter"
                                @save-mail="staffDetailStore.saveMail"
                            />
                            <!-- <StaffBaseInfo></StaffBaseInfo> -->
                        </v-tabs-window-item>
                        <v-tabs-window-item value="bank">
                            <StaffBankInfo v-model="staffDetailStore.staffData" :diff-data="staffDetailStore.diffData"></StaffBankInfo>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="dependent">
                            <StaffDependentInfo v-model="staffDetailStore.staffData.dep_array" :diff-data="staffDetailStore.diffData.dep_array"></StaffDependentInfo>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="emergency">
                            <StaffEmergencyContact></StaffEmergencyContact>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="qualification">
                            <StaffQualification
                                v-model:data="staffDetailStore.staffData.qualification_array"
                                :staff-id="staffDetailStore.staffData.staff_id"
                                :qual-list="staffDetailStore.qualList"
                                :diff-data="staffDetailStore.diffData?.qualification_array"
                                @current-post-code-input="staffDetailStore.currentPostCodeSetter"
                                @residence-post-code-input="staffDetailStore.residencePostCodeSetter"
                                @save-mail="staffDetailStore.saveMail"
                            />
                        </v-tabs-window-item>
                        <v-tabs-window-item value="salary">
                            給与情報
                        </v-tabs-window-item>
                        <v-tabs-window-item value="route" >
                            <StaffRouteInfo></StaffRouteInfo>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="foreigner">
                            <StaffForeignerInfo></StaffForeignerInfo>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="training">
                            <StaffTraining></StaffTraining>
                        </v-tabs-window-item>
                        <v-tabs-window-item value="healthCheck" >
                            <StaffHealthCheck></StaffHealthCheck>
                        </v-tabs-window-item>
                        <div style="height: 50px;"></div>
                    </v-tabs-window>

                </v-card-text>
                <template v-slot:actions>
                    <v-btn color="red" v-show="props.title" @click="staffDetailStore.showRebateModal" >差し戻し</v-btn>
                    <template v-if="config.staff_input">
                        <!-- <v-btn color="primary" @click="staffDetailStore.saveStaff('pending')">確定保存</v-btn> -->
                        <v-btn  color="default" @click="() => staffDetailStore.saveStaff('draft')">一時保存</v-btn>
                    </template>
                    <template v-else>
                        <div>編集権限なしです！</div>
                    </template>
                    <template v-if="config.approval_request">
                        <v-btn color="success" v-show="props.title" @click="() => staffDetailStore.saveStaff('approved')" >保存して承認</v-btn>
                    </template>
                </template>
            </v-card>
        </template>
    </DataHandlingSlot>

    <!--差し戻しモーダル -->
    <v-dialog v-model="statesStore.showRejectDialog" max-width="500">
        <v-card>
            <v-card-title>差し戻し理由</v-card-title>
            <v-card-text>
                <v-textarea v-model="staffDetailStore.rejectReason" label="差し戻し理由" rows="3"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-btn color="default" @click="statesStore.showRejectDialog = false">キャンセル</v-btn>
                <v-btn color="red" @click="staffDetailStore.rejectStaff">差し戻し</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.red{
    background-color: red;
}
</style>
