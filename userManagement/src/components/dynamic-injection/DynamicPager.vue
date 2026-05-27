<script setup>
/**
 * this program is just a sample code for testing slot component & template based dynamic sheet generating
 * by chen
 * 2025/01/27
 */

import { ref, onMounted, } from "vue";
import html2pdf from "html2pdf.js";
import DataHandlingSlot from "@/base-slot/DataHandlingSlot.vue"; // Slot component
// import {rules} from "@/utils/valitators";
import { useDataStore } from "@/stores/DataStore";

const templateContent = ref("");

const sqlTags = {
    select: "load_contract",
    insert: "save_contract",
    update: "save_contract",
    delete: "delete_contract",
    upsert: "save_contract",
};

// const staff_code = '12287'

const mainSlot = ref(null);     // Reference to the slot component

const dataStore = useDataStore();

const dataInput = ref(
`{
    "staff_name": "成田 東京",
    "department": "本部",
    "contract_type": "正社員",
    "company_name": "フレックスカンパニー",
    "zip_code": "261-0023",
    "address": "海浜幕張",
    "director": "ジャンガ責任者",
    "period_type": "無期雇用",
    "start_date": "2024-04-01",
    "end_date": "",
    "auto_renewal": "",
    "work_place": "海浜幕張",
    "job_details": "システム開発",
    "work_start": "2024-04-01",
    "work_end": "",
    "work_week_days": "5",
    "leave_week_days": "土、日",
    "health_insurance": "対象者",
    "pension_insurance": "対象者",
    "employment_insurance": "対象者",
    "salary_type": "月給",
    "basic_salary": "300,000",
    "total_salary": "330,000",
    "over_time_base_value_min": "0",
    "over_time_base_value_max": "100,000",
    "over_time_price_min": "1,200",
    "over_time_deduction_max": "1,600",
    "allowances": [
        {"allowance_name":"住宅手当", "allowance_value":"10,000", "allowance_unit":"円/月"},
        {"allowance_name":"役職手当", "allowance_value":"40,000", "allowance_unit":"円/月"},
        {"allowance_name":"資格手当", "allowance_value":"6,000", "allowance_unit":"円/月"}
    ],
    "payment_terms": "毎月31日締切り、25日後御社指定口座に銀行振込により支給する。支給日が銀行休業日に応当する場合、直後の銀行営業日に繰り下げて支給する",
    "etc_content": ""
}`
);

const generatedContract = ref("");

// const data = {
//     "staff_name": "成田 東京",
//     "department": "本部",
//     "contract_type": "正社員",
//     "company_name": "フレックスカンパニー",
//     "zip_code": "261-0023",
//     "address": "海浜幕張",
//     "director": "ジャンガ責任者",
//     "period_type": "無期雇用",
//     "start_date": "2024-04-01",
//     "end_date": "",
//     "auto_renewal": "",
//     "work_place": "海浜幕張",
//     "job_details": "システム開発",
//     "work_start": "2024-04-01",
//     "work_end": "",
//     "work_week_days": "5",
//     "leave_week_days": "土、日",
//     "health_insurance": "対象者",
//     "pension_insurance": "対象者",
//     "employment_insurance": "対象者",
//     "salary_type": "月給",
//     "basic_salary": "300,000",
//     "total_salary": "330,000",
//     "over_time_base_value_min": "0",
//     "over_time_base_value_max": "100,000",
//     "over_time_price_min": "1,200",
//     "over_time_deduction_max": "1,600",
//     "allowances": [
//         {"allowance_name":"住宅手当", "allowance_value":"10,000", "allowance_unit":"円/月"},
//         {"allowance_name":"役職手当", "allowance_value":"40,000", "allowance_unit":"円/月"},
//         {"allowance_name":"資格手当", "allowance_value":"6,000", "allowance_unit":"円/月"},
//     ],
//     "payment_terms": "毎月31日締切り、25日後御社指定口座に銀行振込により支給する。支給日が銀行休業日に応当する場合、直後の銀行営業日に繰り下げて支給する",
//     "etc_content": ""
// }

const generate = () => {
    try {
        const template = templateContent.value;
        const data = JSON.parse(dataInput.value)

        // generatedContract.value = generateContract(template, data);
        generatedContract.value = applyTemplate(template, data)
    } catch (error) {
        alert("Invalid JSON input");
    }
};

function exportToPDF() {
  const element = document.getElementById('contract_page');
  html2pdf().from(element).save();
}

function applyTemplate(template, data) {
  let result = template;

  // Replace loop blocks
  result = result.replace(/<%loop:(.*?)%>([\s\S]*?)<%endloop:\1%>/g, (match, key, loopTemplate) => {
    if (!data[key] || !Array.isArray(data[key])) return "";
    return data[key]
      .map(item => applyTemplate(loopTemplate, item)) // Recursively replace placeholders in loop template
      .join("");
  });

  // Replace single-value placeholders
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`<%${key}%>`, "g");
    result = result.replace(placeholder, value || "");
  }

  return result;
}

onMounted(async () => {
    if (!mainSlot.value?.fetchData) return

    try {
        const result = await mainSlot.value.fetchData();
        if (!result) return
        // store to global storage to share among components
        dataStore.data.contractlist = result
    } catch (error) {
        console.error("Error loading data on mount:", error);
    }
});

</script>

<template>
    <v-container>
        <div style="display: flex;">
            <button @click="generate" style="margin-right: 20px;">契約作成</button>
            <button @click="exportToPDF">PDF</button>
        </div>
        <v-card class="mx-auto" max-width="500">
            <DataHandlingSlot
                v-if="dataStore.states.selectRow"
                ref="mainSlot"
                :data="dataStore.states?.selectRow"
                :sqlTags="sqlTags"
                v-slot="{ save, fetch: fetchData, delete: deleteData, loading, data }"
            >
                <v-card-title class="text-h5">ユーザー情報登録</v-card-title>
                <v-card-text>
                    <div id="contract_page" v-html="generatedContract"></div>
                </v-card-text>
            </DataHandlingSlot>
        </v-card>
    </v-container>
</template>
