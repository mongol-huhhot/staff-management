<template>
    <v-row class="wareki" :dense="true">
        <v-col cols="3">
            <v-select
                density="compact"
                :items="eras"
                class="warekiSelect"
                v-model="wareki"
            ></v-select>
        </v-col>
        <v-col cols="3">
            <v-text-field
                density="compact"
                v-model="year"
                type="number"
                :hide-spin-buttons="true"
                label="年"
                class="warekiYear"
            ></v-text-field>
        </v-col>
        <v-col cols="3">
            <v-text-field
                density="compact"
                v-model="month"
                type="number"
                :hide-spin-buttons="true"
                label="月"
            ></v-text-field>
        </v-col>
        <v-col cols="3">
            <v-text-field
                density="compact"
                v-model="day"
                type="number"
                :hide-spin-buttons="true"
                label="日"
            ></v-text-field>
        </v-col>
    </v-row>
</template>

<script setup>
import { defineModel, ref, onMounted,  watch, computed } from "vue";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useBaseStore } from "@/stores/BaseStore";
dayjs.extend(customParseFormat);

const baseStore = useBaseStore();

const wareki = defineModel('wareki', {default:0});

const modelDate = defineModel({});


const year = computed({
    get() {
        // modelDateの値から年を取り出し、その年から和暦の年数を引いた結果を返す
        const yearVal = Number(modelDate.value?.split('-')[0]);
        const result = yearVal - wareki.value;
        if(result < 1){
            modelDate.value = (1 + wareki.value) + modelDate.value.slice(4);
            return 1;
        }
        return result;
    },
    set(value) {
        const numVal = Number(value);

        // numValとwarekiを足した結果が1000以上9999未満でない場合、処理を終了
        if (!((numVal + wareki.value) >= 1000 && (numVal + wareki.value) <= 9999))
            return 0;

        // modelDateの値が有効な日付でない場合は、modelDateの値を設定して処理を終了
        if (!dayjs(modelDate.value, 'YYYY-MM-DD', true).isValid()) {
            modelDate.value = (numVal + wareki.value) + '-01-01';
            return;
        }

        // modelDateの値が有効な場合は新しい値に更新し、残りの日付部分はそのまま維持
        modelDate.value = (numVal + wareki.value) + modelDate.value.slice(4);
    }
});

const month = computed({
    get() {
        const monthValue = Number(modelDate.value?.split('-')[1]);
        return monthValue;
    },
    set(value) {
        const numVal = Number(value);
        // 月が範囲外の値（1~12以外）の場合、0を返して処理を終了
        if (numVal < 1 || numVal > 12) {
            return 0;
        }
        const parts = modelDate.value.split('-');
        // 月の部分を2桁で設定
        parts[1] = ('00' + value).slice(-2);

        //存在しない日の場合は1日にする
        if (!dayjs(parts.join('-'), 'YYYY-MM-DD', true).isValid()){
            parts[2] = '01';
        }

        modelDate.value = parts.join('-');
    }
});

const day = computed({
    get() {
        const dayValue = Number(modelDate.value?.split('-')[2]);
        return dayValue;
    },
    set(value) {
        const numVal = Number(value);
        // 日が範囲外の値（1~31以外）の場合、0を返して処理を終了
        if (numVal < 1 || numVal > 31) {
            return 0;
        }
        const parts = modelDate.value.split('-');
        // 日の部分を2桁で設定
        parts[2] = ('00' + value).slice(-2);

        if (!dayjs(parts.join('-'), 'YYYY-MM-DD', true).isValid()){
            return 0;
        }

        modelDate.value = parts.join('-');
        
    }
});


watch(wareki.value, () => {
    if(year.value < 0){
        year.value = 1;
    }
})

const eras = ref([
    { title: '西暦', value: 0 }
]);

onMounted(async () => {
    baseStore.sqlpath = 'sou/manaGement.sql';
    const result = await baseStore.load('sel_wareki_select')
    const setErasArray = result.map((e) => {
        return {title:e.year_name, value:e.plus_year}
    })
    eras.value = eras.value.concat(setErasArray);
    console.log('onmounte======', eras.value);
});

</script>

<style scoped>

.wareki span{
    font-size: 10px;
}


</style>

<style>

@media screen and (max-width:480px){
    .warekiSelect .v-select__menu-icon{
        font-size: 10px;
        
    }
    .warekiSelect .v-field.v-field--appended{
        padding: 0;
    }

    .warekiYear .v-text-field__suffix{
        padding-right: 5px;
    }
    .warekiYear .v-text-field__suffix__text{
        font-size: 10px;
    }
}
</style>