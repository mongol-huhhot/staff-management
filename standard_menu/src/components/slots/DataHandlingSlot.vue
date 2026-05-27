<script setup>
import { ref, computed, defineExpose, } from "vue";
import { useBaseStore } from "@/stores/BaseStore";
import { showSnackbar } from "@/components/Snackbar.vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import OnboardingGuide from "@/components/OnboardingGuide.vue";

const BaseStore = useBaseStore();

const emit = defineEmits(["data-saved", "data-deleted", "update:modelValue"]);

const props = defineProps({
    data: { type: [Object, Array], required: false },
    sqlPath: { type: String, required: false },
    sqlTags: { type: Object, required: true,
        validator(value) {
            return (
                typeof value.select === "string" &&
                typeof value.insert === "string" &&
                typeof value.update === "string" &&
                typeof value.delete === "string" &&
                typeof value.upsert === "string" &&
                typeof value.multiupsert === "string"
            );
        },
    }, // SQL tags for operations
    params: { type: Object, required: false, default: () => null }, // Additional parameters
    successMessages: {
        type: Object,
        default: () => Object.freeze({
            fetch: "データ取得成功",
            save: "データ保存成功",
            delete: "データ削除成功",
            insert: "データ挿入成功",
            update: "データ更新成功",
            multiupsert:"複数データ保存成功",
        }),
    },
    fixedItems: {
        type: Array,
        default: () => ['staff_code','version','status','is_active','template_code',]
    },
    steps: {
        type: Array,
        default: () => []
    }
});

const loading = ref(false);

// Combine data and params for the default payload
const payload = computed(() => { 
    const content = Object.keys(props.data)
        .filter(key => (props.fixedItems || []).includes(key) === false)
        .reduce((obj, key) => {
            obj[key] = props.data[key];
            return obj;
        }, {});
    
    return {...content, ...props.params}
});

// Centralized error handler
function handleError(err, operation = "操作") {
    showSnackbar(`${operation}エラー: ${err.message}`, "error");
    console.error(`${operation} Error:`, err);
}

async function fetchData(payloadOverride = null) {
    try {
        loading.value = true;
        const result = await BaseStore.load(props.sqlTags.select, payloadOverride || payload.value);
        console.log("payload.value===", payload.value);
        if (result) {
            emit("update:modelValue", Array.isArray(result) ? [...result] : { ...result });
            showSnackbar(props.successMessages.fetch, "success");
            return result;
        } else {
            showSnackbar("条件に合うデータがありませんでした。", "warning");
        }
    } catch (err) {
        handleError(err, "データ取得");
        return null;
    } finally {
        loading.value = false;
    }
}

// Execute Generic Statement
async function execute(sqlTag, payloadOverride = null, successMessage = "操作成功") {
    try {
        const pl = payloadOverride || payload.value
        const dat = {...props.data, ...pl }
        console.log("dat===", dat, pl )
        loading.value = true;
        const result = await BaseStore.execute(sqlTag, dat);
        console.log("execute------------------", result)
        if (result) {
            console.log("Emitting data-saved event with result:", result);
            emit("data-saved", result); // Notify parent
            showSnackbar(successMessage, "success");
            return result;
        }
    } catch (err) {
        handleError(err, successMessage);
        return null;
    } finally {
        loading.value = false;
    }
}

// CRUD Operations
async function saveData(payloadOverride = null) {
    const pl = payloadOverride || payload.value
    const dat = {...props.data, ...pl }
    let sqltag = props.sqlTags.upsert
    loading.value = true

    console.log("saveData,,,,,, dat=======", dat, props.data.staff_code, typeof props.data)
    
    if( Array.isArray(props.data.staff_code) )
        sqltag = props.sqlTags.multiupsert

    try {
        dat.staff_code = JSON.stringify(props.data.staff_code)
        console.log("dat.staff_code------------------", dat.staff_code)

        const result = await BaseStore.execute(sqltag, dat);
        console.log("execute------------------", result)
        if (result) {
            console.log("Emitting data-saved event with result:", result);
            emit("data-saved", result); // Notify parent
            showSnackbar('保存しました', "success");
            return result;
        } 
    } catch (err) {
        handleError(err, '保存に失敗しました');
        return null;
    } finally {
        loading.value = false;
    }
    // return await execute(sqltag, dat.staff_code, props.successMessages.save);
}

async function insertData(payloadOverride = null) {
    return await execute(props.sqlTags.insert, payloadOverride, props.successMessages.insert);
}

async function updateData(payloadOverride = null) {
    return await execute(props.sqlTags.update, payloadOverride, props.successMessages.update);
}

async function deleteData(payloadOverride = null) {
    try {
        loading.value = true;
        const result = await BaseStore.execute(props.sqlTags.delete, payloadOverride || payload.value);
        if (result) {
            emit("data-deleted", props.data); // Notify parent
            showSnackbar(props.successMessages.delete, "success");
            return result;
        }
    } catch (err) {
        handleError(err, "データ削除");
        return null;
    } finally {
        loading.value = false;
    }
}

// Export to Excel
async function exportToExcel() {
    if (!props.data || !Array.isArray(props.data)) {
        showSnackbar("エクスポートするデータがありません。", "warning");
        return;
    }
    try {
        const worksheet = XLSX.utils.json_to_sheet(props.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "export.xlsx");
        showSnackbar("Excelファイルがエクスポートされました。", "success");
    } catch (err) {
        handleError(err, "Excelエクスポート");
    }
}

// Export to PDF
async function exportToPDF() {
    if (!props.data || !Array.isArray(props.data)) {
        showSnackbar("エクスポートするデータがありません。", "warning");
        return;
    }
    try {
        const doc = new jsPDF();
        let yPosition = 10;

        props.data.forEach((row) => {
            doc.text(JSON.stringify(row), 10, yPosition);
            yPosition += 10;
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 10;
            }
        });

        doc.save("export.pdf");
        showSnackbar("PDFファイルがエクスポートされました。", "success");
    } catch (err) {
        handleError(err, "PDFエクスポート");
    }
}

// Save data
async function saveWithRefresh(p={}) {
    let ret = await saveData();
    console.log("savewWithRefresh save===", ret);
    ret = await fetchData({ ...p });
    console.log("savewWithRefresh fetch===", ret);
}

// Delete data
async function deleteWithRefresh(p={}) {
    let ret = await deleteData();
    console.log("save===", ret);
    ret = await fetchData({ ...p });
}

// Reset form
const resetForm = () => {
    Object.keys(payload.value).forEach((key) => {
        if (key !== 'content') payload.value[key] = "";
        else resetForm(payload.value[key]);
    });
};

async function templateAsSave() {
    console.log("data====", payload.value)
}


// Expose Methods
defineExpose({
    fetchData,
    saveData,
    insertData,
    updateData,
    deleteData,
    saveWithRefresh,
    deleteWithRefresh,
    resetForm,
    templateAsSave,
    exportToExcel,
    exportToPDF,
});

</script>

<template>
    <div >
        <slot 
            :fetch="fetchData" 
            :save="saveData" 
            :delete="deleteData" 
            :update="updateData"
            :insert="insertData"
            :saveWithRefresh="saveWithRefresh"
            :deleteWithRefresh="deleteWithRefresh"
            :resetForm="resetForm"
            :templateAsSave="templateAsSave"
            :excel="exportToExcel"
            :pdf="exportToPDF"
            :params="props?.params"
            :data="props?.data"
            :loading="loading" 
        />

        <!-- Onboarding Guide -->
        <OnboardingGuide 
            :steps="props.steps" 
            :formData="props.data"
            v-if="steps && steps.length > 0"/>
    </div>
</template>

<style>
/* for displaying dynamic operation guide */
.highlight {
  position: relative;
  z-index: 9999;
  border: 3px solid red;
  box-shadow: 0px 0px 10px red;
  transition: 0.3s;
}
</style>
