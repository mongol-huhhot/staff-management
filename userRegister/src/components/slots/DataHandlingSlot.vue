<script setup>
import { ref, computed, reactive, watch, defineExpose } from "vue";
import { useBaseStore } from "@/stores/bak/BaseStore";
import { showSnackbar } from "@/utils/Snackbar.vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import OnboardingGuide from "@/components/OnboardingGuide.vue";

const BaseStore = useBaseStore();
const emit = defineEmits(["data-saved", "data-deleted", "update:modelValue"]);

const props = defineProps({
  data: { type: [Object, Array], required: false },
  sqlPath: { type: String, required: false },
  sqlTags: {
    type: Object,
    required: true,
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
  },
  params: { type: Object, required: false, default: () => null },
  successMessages: {
    type: Object,
    default: () =>
      Object.freeze({
        fetch: "データ取得成功",
        save: "データ保存成功",
        delete: "データ削除成功",
        insert: "データ挿入成功",
        update: "データ更新成功",
        multiupsert: "複数データ保存成功",
      }),
  },
  fixedItems: {
    type: Array,
    default: () =>
      ["staff_code", "version", "status", "is_active", "template_code"],
  },
  steps: {
    type: Array,
    default: () => [],
  },
});

const loading = ref(false);

// --- ✅ use local reactive data
const localData = reactive({ ...(props.data || {}) });

// --- ✅ sync with props.data if changed
watch(
  () => props.data,
  (newVal) => {
    if (newVal) Object.assign(localData, newVal);
  },
  { deep: true }
);

// --- computed payload
const payload = computed(() => {
  const content = Object.keys(localData)
    .filter((key) => !props.fixedItems.includes(key))
    .reduce((obj, key) => {
      obj[key] = localData[key];
      return obj;
    }, {});
  return { ...content, ...props.params };
});

function handleError(err, operation = "操作") {
  showSnackbar(`${operation}エラー: ${err.message}`, "error");
  console.error(`${operation} Error:`, err);
}

// --- CRUD functions
async function fetchData(payloadOverride = null) {
  try {
    loading.value = true;
    const result = await BaseStore.load(
      props.sqlTags.select,
      payloadOverride || payload.value
    );
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

async function execute(sqlTag, payloadOverride = null, successMessage = "操作成功") {
  try {
    const pl = payloadOverride || payload.value;
    const dat = { ...localData, ...pl };
    loading.value = true;
    const result = await BaseStore.execute(sqlTag, dat);
    if (result) {
      emit("data-saved", result);
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

async function saveData(payloadOverride = null) {
  const pl = payloadOverride || payload.value;
  const dat = { ...localData, ...pl };
  let sqltag = props.sqlTags.upsert;

  loading.value = true;

  if (Array.isArray(localData.staff_code)) sqltag = props.sqlTags.multiupsert;
  try {
    dat.staff_code = JSON.stringify(localData.staff_code);
    const result = await BaseStore.execute(sqltag, dat);
    if (result) {
      emit("data-saved", result);
      showSnackbar("保存しました", "success");
      return result;
    }
  } catch (err) {
    handleError(err, "保存に失敗しました");
    return null;
  } finally {
    loading.value = false;
  }
}

async function deleteData(payloadOverride = null) {
  try {
    loading.value = true;
    const pl = payloadOverride || payload.value;
    const dat = { ...localData, ...pl };
    const result = await BaseStore.execute(props.sqlTags.delete, dat);
    if (result) {
      emit("data-deleted", localData);
      emit("data-saved", result);
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

// --- Export utilities
async function exportToExcel() {
  if (!Array.isArray(localData)) {
    showSnackbar("エクスポートするデータがありません。", "warning");
    return;
  }
  try {
    const worksheet = XLSX.utils.json_to_sheet(localData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "export.xlsx");
    showSnackbar("Excelファイルがエクスポートされました。", "success");
  } catch (err) {
    handleError(err, "Excelエクスポート");
  }
}

async function exportToPDF() {
  if (!Array.isArray(localData)) {
    showSnackbar("エクスポートするデータがありません。", "warning");
    return;
  }
  try {
    const doc = new jsPDF();
    let yPosition = 10;

    localData.forEach((row) => {
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

// --- Additional exposed methods
async function saveWithRefresh(p = {}) {
  await saveData();
  await fetchData({ ...p });
}

async function deleteWithRefresh(p = {}) {
  await deleteData();
  await fetchData({ ...p });
}

const resetForm = () => {
  Object.keys(localData).forEach((key) => {
    if (key !== "content") localData[key] = "";
    else localData[key] = {};
  });
};

async function templateAsSave() {
  console.log("data====", payload.value);
}

// expose
defineExpose({
  fetchData,
  saveData,
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
  <div>
    <slot
      :fetch="fetchData"
      :save="saveData"
      :delete="deleteData"
      :saveWithRefresh="saveWithRefresh"
      :deleteWithRefresh="deleteWithRefresh"
      :resetForm="resetForm"
      :templateAsSave="templateAsSave"
      :excel="exportToExcel"
      :pdf="exportToPDF"
      :params="props?.params"
      :data="localData"
      :loading="loading"
    />

    <OnboardingGuide
      :steps="props.steps"
      :formData="localData"
      v-if="steps && steps.length > 0"
    />
  </div>
</template>

<style scoped>
.highlight {
  position: relative;
  z-index: 9999;
  border: 3px solid red;
  box-shadow: 0px 0px 10px red;
  transition: 0.3s;
}
</style>
