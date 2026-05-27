<template>
    <v-row>
        <v-col cols="6" >
            <DiffTextField
                v-model="staffDetailStore.staffData.commutation_allowance"
                type="tel"
                label="定期代（1ヶ月）"
                :original="staffDetailStore.diffData.commutation_allowance"
            ></DiffTextField>
        </v-col>
        <v-col cols="6" >
            <DiffTextField
                v-model="staffDetailStore.staffData.car_allowance"
                type="tel"
                label="マイカー手当（1ヶ月）"
                :original="staffDetailStore.diffData.car_allowance"
            ></DiffTextField>
        </v-col>
    </v-row>

    <div v-if="isCarSelected" style="margin-top: 10px;" class="depContainer">
        <v-row>
        <v-col cols="6">
            <QrMobileImageField
            decsription="car_allowance"
            title="車検証"
            v-model:fileObjArray="staffDetailStore.carObj.fileObjArray"
            :ref = "(el) => staffDetailStore.carObj.imageRef = el"
            ></QrMobileImageField>
            <div style="margin-top: 10px;">
                <ImageView :fk-id="`car_allowance_${staffDetailStore.staffData.staff_id}`" max-height="200" />
            </div>
        </v-col>
        </v-row> 
    </div>
    
    <div style="margin-top: 10px;" v-for="(route, index) in staffDetailStore.staffData?.route_array" :key="index" class="depContainer" >
        <div class="text-h6" style="">通勤情報{{ index + 1 }}</div>
        <v-row>
            <v-col cols="6">
                <DiffSelect
                    v-model="route.type"
                    label="通勤手段"
                    :items="routeTypeArray"
                    @update:model-value="routeTypeUpdate"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.type"
                ></DiffSelect>
            </v-col>
        </v-row>
        <v-row v-if="['1'].includes(routeShowTypes(route.type))">
            <v-col cols="6" >
                <DiffTextField
                    v-model="route.start_station"
                    label="出発地"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.start_station"
                ></DiffTextField>
            </v-col>
            <v-col cols="6">
                <DiffTextField
                    v-model="route.via_station"
                    label="経由地"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.via_station"
                ></DiffTextField>
            </v-col>
        </v-row>

        <v-row v-if="['2','4'].includes(routeShowTypes(route.type))">
            <v-col
                cols="6"
            >
                <DiffTextField
                    v-model="route.distance"
                    type="number"
                    label="距離（km）"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.distance"
                ></DiffTextField>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="6" v-if="['1'].includes(routeShowTypes(route.type))">
                <DiffTextField
                    v-model="route.end_station"
                    label="終了地"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.end_station"
                ></DiffTextField>
            </v-col>
            <v-col cols="6" v-if="['1', '4'].includes(routeShowTypes(route.type))">
                <DiffTextField
                    v-model="route.amount"
                    label="往復日額"
                    type="tel"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.amount"
                ></DiffTextField>
            </v-col>
        </v-row>

        <v-row v-if="['1', '4'].includes(routeShowTypes(route.type))">
            <v-col cols="6">
                <DiffSelect
                    v-model="route.payment_type"
                    label="支払い区分"
                    :items="paymentTypeArray"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.payment_type"
                ></DiffSelect>
            </v-col>
            <v-col cols="6">
                <DiffTextField
                    v-model="route.commuter_pass"
                    label="定期代（円）"
                    type="tel"
                    :original="staffDetailStore.diffData?.route_array?.find((e) => e.id == route.id)?.commuter_pass"
                ></DiffTextField>
            </v-col>
        </v-row>

        <v-row style="margin-top: 10px;" >
            <v-col cols="12">
                <v-btn @click="addRoute" v-if="staffDetailStore.staffData.route_array.length === index + 1" color="success">追加</v-btn>
                <v-btn @click="removeRoute(index)" style="margin-left: 50px;" color="#d9534f">削除</v-btn>
            </v-col>
        </v-row>

    </div>

</template>
<script setup>
import { usestaffDetailStore } from '@/stores/staffDetailStore';
import DiffSelect from './DiffSelect.vue';
import DiffTextField from './DiffTextField.vue';
import QrMobileImageField from './QrMobileImageField.vue';
import ImageView from './ImageView.vue';
import { onMounted, ref } from 'vue';

const staffDetailStore = usestaffDetailStore();
const routeTypeArray = [
    {title:'電車' , value:'train', showType:'1'}
    ,{title:'バス・路面電車', value:'bus', showType:'1'}
    ,{title:'車', value:'car', showType:'2'}
    ,{title:'モノレール', value:'mono', showType:'1'}
    ,{title:'駐車（輪）場', value:'parking', showType:'4'}
    ,{title:'徒歩', value:'toll_road', showType:'3'}
    ,{title:'自転車', value:'bike', showType:'2'}
    ,{title:'新幹線', value:'shinkansen', showType:'1'}
];


const paymentTypeArray = [
    {title:'日割' , value:'0'}
    ,{title:'1ヵ月', value:'1'}
    ,{title:'6ヵ月', value:'6'}
];

function routeShowTypes(route){
    const option = routeTypeArray.find((e) => {
        return e.value == route;
    });
    return option?.showType;
}



const addRoute = () => {
    const maxId = staffDetailStore.staffData.route_array?.reduce((a, b) => {
        return Math.max(a.id, b.id)
    });
    let id;
    if(!maxId )
        id = 0;
    id = maxId + 1;
    staffDetailStore.staffData.route_array.push({id:id});
    console.log('staffDetailStore.staffData.route_array======', staffDetailStore.staffData.route_array);
}

const removeRoute = (index) => {
    if(staffDetailStore.staffData.route_array.length === 1){
        staffDetailStore.staffData.route_array = [{id:1}];
        return
    }
    staffDetailStore.staffData.route_array = staffDetailStore.staffData.route_array.filter((e, i) => i !== index );
}

const isCarSelected = ref(false);

// 通勤手段が車の時に画像登録項目を表示する関数
const routeTypeUpdate = () => {
    if (!staffDetailStore.staffData?.route_array) return;
    isCarSelected.value = staffDetailStore.staffData.route_array.some(
        (route) => route.type === "car"
    );
};

onMounted(() => {
  routeTypeUpdate();
});

watch(
  () => staffDetailStore.staffData.route_array,
  () => {
    routeTypeUpdate();
  },
  { deep: true }
);

</script>

<style scoped>
.depContainer{
    border: 1px black solid;
    padding: 5px;
    padding-bottom: 20px;
}
</style>