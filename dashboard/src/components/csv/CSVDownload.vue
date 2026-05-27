<script setup>
import { ref, } from 'vue';
import GridDataBrowser from '@/components/tools/GridDataBrowser.vue'
import { ElDialog, ElButton } from "element-plus";
import { Download } from '@element-plus/icons-vue'
import { useSalaryDefValStore } from '@/stores/SalaryDefValStore'

const salaryDefault = useSalaryDefValStore()

const openDialog = ref(false)

const props = defineProps({
    title: {
        type:String,
        required: false,
    }
})

const onClick = async () => {
    await salaryDefault.loadAllDefaultValues()
    // console.log(salaryDefault.data.salary_get_all_salary_item_default_values)
    openDialog.value=true
}

// const columnDefine = [
//     { name: "staff_id", label: "staff_id", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "salary_item_id", label: "salary_item_id", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "salary_value", label: "", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "effective_date", label: "effective_date", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "company_code", label: "company_code", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "enabled", label: "enabled", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "origin", label: "origin", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_name", label: "item_name", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_label", label: "item_label", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_type", label: "item_type", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_group_code", label: "item_group_code", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_order", label: "item_order", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "show_type", label: "show_type", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "setting_tag", label: "setting_tag", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "input_type", label: "input_type", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "require_flag", label: "require_flag", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_min", label: "item_min", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_max", label: "item_max", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
//     { name: "item_decimal_point", label: "item_decimal_point", style:{"text-align":"left", "padding": "4px", "width": "20px"} },
// ]

// const defaultVals = computed(() => {
//     if( salaryDefault.data.salary_all_salary_item_default_values 
//         && Array.isArray(salaryDefault.data.salary_all_salary_item_default_values)
//         && salaryDefault.data.salary_all_salary_item_default_values.length > 0 )
//     return salaryDefault.data.salary_all_salary_item_default_values
//     return []
// })

const myTitle = props.title?props.title:'全データ'

</script>

<template>
    <div style="padding-left: 12px; padding-right: 12px;">
        <el-button type="success" 
            @click="onClick" 
            :icon="Download"
            title="CSVファイルを出力します">{{myTitle}}</el-button>
    </div>
    <el-dialog title="全給与計算項目のデフォルト値のCSV出力" v-model="openDialog" width="70%" draggable>
        <div class="table-responsive" style="height:600px; overflow:scroll; width: 100%; overflow-x: auto;">
            <GridDataBrowser 
                :data="salaryDefault.data.salary_get_all_salary_item_default_values"></GridDataBrowser>
        </div>
    </el-dialog>
</template>


