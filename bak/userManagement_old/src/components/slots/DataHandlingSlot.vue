<!-- DataHandlingSlot.vue -->
<script setup>
import { ref, computed, defineExpose } from "vue";
import { useBaseStore } from "@/stores/BaseStore";
import { showSnackbar } from "@/utils/Snackbar.vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import OnboardingGuide from "@/components/OnboardingGuide.vue";

const BaseStore = useBaseStore();

const emit = defineEmits(["data-saved", "data-deleted", "update:modelValue"]);

const props = defineProps({
  // 親が持つフォームデータ（Object想定。list用途なら Array でも可）
  data: { type: [Object, Array], required: false, default: () => ({}) },

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
    default: () => ["staff_code", "version", "status", "is_active", "template_code"],
  },

  steps: { type: Array, default: () => [] },

  /**
   * ★ここが肝
   * 変換処理を Slot 側で吸収するためのフック
   *
   * transforms: {
   *   fetch?: (result, ctx) => any
   *   beforeSave?: (payload, ctx) => any
   *   beforeExecute?: (payload, ctx) => any
   *   perTag?: {
   *     [sqlTag: string]: { fetch?: fn, beforeSave?: fn, beforeExecute?: fn }
   *   }
   * }
   */
  transforms: {
    type: Object,
    default: () => ({
      fetch: null,
      beforeSave: null,
      beforeExecute: null,
      perTag: {},
    }),
  },

  /**
   * jsonb を “文字列で返してくる” ケースの救済
   * - true: 自動的に JSONっぽい文字列を parse しに行く（安全に）
   * - false: 何もしない
   */
  autoParseJsonStrings: { type: Boolean, default: true },

  /**
   * “このキーは必ず JSON parse” のように指定したいとき用
   * 例: ["content", "effectiveDates", "income_summary_jsonb"]
   */
  forceJsonKeys: { type: Array, default: () => [] },
});

const loading = ref(false);

// -------------------------
// Utils
// -------------------------
function handleError(err, operation = "操作") {
  const msg = err?.message || String(err);
  showSnackbar(`${operation}エラー: ${msg}`, "error");
  console.error(`${operation} Error:`, err);
}

function deepClone(v) {
  // structuredClone があれば使う（対応ブラウザ多い）
  if (typeof structuredClone === "function") return structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function safeJsonParse(s) {
  if (typeof s !== "string") return s;
  const t = s.trim();
  if (!t) return s;
  // JSONっぽい開始文字のものだけ試す（誤爆を減らす）
  const looksJson = t.startsWith("{") || t.startsWith("[");
  if (!looksJson) return s;
  try {
    return JSON.parse(t);
  } catch {
    return s;
  }
}

function normalizeRecursively(value) {
  // fetch後：JSON文字列→Object（必要なら）
  if (Array.isArray(value)) return value.map(normalizeRecursively);
  if (isPlainObject(value)) {
    const out = {};
    for (const k of Object.keys(value)) {
      const v = value[k];

      // 強制JSONキー
      if (props.forceJsonKeys?.includes(k) && typeof v === "string") {
        out[k] = safeJsonParse(v);
        continue;
      }

      if (props.autoParseJsonStrings && typeof v === "string") {
        const parsed = safeJsonParse(v);
        out[k] = normalizeRecursively(parsed);
      } else {
        out[k] = normalizeRecursively(v);
      }
    }
    return out;
  }
  return value;
}

function denormalizeRecursively(value) {
  // save前：Object/Array → JSON文字列にしたいものがあればここで統一
  // 基本は “そのまま” でOK。必要なキーだけ transforms.beforeSave で stringfy する方が安全。
  return value;
}

function stripFixedItems(srcObj) {
  if (!isPlainObject(srcObj)) return srcObj;
  const out = {};
  for (const key of Object.keys(srcObj)) {
    if ((props.fixedItems || []).includes(key)) continue;
    out[key] = srcObj[key];
  }
  return out;
}

function mergePayload(dataObj, paramsObj) {
  const d = isPlainObject(dataObj) ? dataObj : {};
  const p = isPlainObject(paramsObj) ? paramsObj : {};
  // dataの固定項目を除外した“content”だけ作って params と合成
  return { ...stripFixedItems(d), ...p };
}

function getTransformsFor(sqlTag) {
  const per = props.transforms?.perTag?.[sqlTag] || {};
  return {
    fetch: per.fetch ?? props.transforms?.fetch ?? null,
    beforeSave: per.beforeSave ?? props.transforms?.beforeSave ?? null,
    beforeExecute: per.beforeExecute ?? props.transforms?.beforeExecute ?? null,
  };
}

// -------------------------
// Payload (default)
// -------------------------
const payload = computed(() => {
  return mergePayload(props.data, props.params);
});

// -------------------------
// Core Operations
// -------------------------
async function fetchData(payloadOverride = null) {
  try {
    loading.value = true;
    const pl = payloadOverride || payload.value;

    const raw = await BaseStore.load(props.sqlTags.select, pl);
    if (!raw) {
      showSnackbar("条件に合うデータがありませんでした。", "warning");
      return null;
    }

    // normalize（JSON文字列→Objectなど）
    let result = normalizeRecursively(raw);

    // fetch transform
    const tf = getTransformsFor(props.sqlTags.select);
    if (typeof tf.fetch === "function") {
      result = tf.fetch(result, { op: "fetch", sqlTag: props.sqlTags.select, payload: pl });
    }

    emit("update:modelValue", Array.isArray(result) ? [...result] : { ...result });
    showSnackbar(props.successMessages.fetch, "success");
    return result;
  } catch (err) {
    handleError(err, "データ取得");
    return null;
  } finally {
    loading.value = false;
  }
}

async function execute(sqlTag, payloadOverride = null, successMessage = "操作成功") {
  try {
    loading.value = true;
    const base = isPlainObject(props.data) ? deepClone(props.data) : {};
    const pl = payloadOverride || payload.value;

    let dat = { ...base, ...pl };

    // beforeExecute transform
    const tf = getTransformsFor(sqlTag);
    if (typeof tf.beforeExecute === "function") {
      dat = tf.beforeExecute(dat, { op: "execute", sqlTag, payload: pl });
    }

    const result = await BaseStore.execute(sqlTag, dat);

    if (result) {
      emit("data-saved", result);
      showSnackbar(successMessage, "success");
    }
    return result || null;
  } catch (err) {
    handleError(err, successMessage);
    return null;
  } finally {
    loading.value = false;
  }
}

async function saveData(payloadOverride = null) {
  try {
    loading.value = true;

    const base = isPlainObject(props.data) ? deepClone(props.data) : {};
    const pl = payloadOverride || payload.value;

    let dat = { ...base, ...pl };
    let sqltag = props.sqlTags.upsert;

    // multiupsert 判定
    if (Array.isArray(base.staff_code)) {
      sqltag = props.sqlTags.multiupsert;
      // backend が JSON配列文字列を期待しているならここで stringify
      dat.staff_code = JSON.stringify(base.staff_code);
    }

    // denormalize（必要なら）
    dat = denormalizeRecursively(dat);

    // beforeSave transform（ここで “特定キーは JSON.stringify する” などを実装）
    const tf = getTransformsFor(sqltag);
    if (typeof tf.beforeSave === "function") {
      dat = tf.beforeSave(dat, { op: "save", sqlTag: sqltag, payload: pl });
    }

    const result = await BaseStore.execute(sqltag, dat);

    if (result) {
      emit("data-saved", result);
      showSnackbar("保存しました", "success");
      return result;
    }
    return null;
  } catch (err) {
    handleError(err, "保存に失敗しました");
    return null;
  } finally {
    loading.value = false;
  }
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
    const base = isPlainObject(props.data) ? deepClone(props.data) : {};
    const pl = payloadOverride || payload.value;
    const dat = { ...base, ...pl };

    const result = await BaseStore.execute(props.sqlTags.delete, dat);
    if (result) {
      emit("data-deleted", base);
      emit("data-saved", result);
      showSnackbar(props.successMessages.delete, "success");
      return result;
    }
    return null;
  } catch (err) {
    handleError(err, "データ削除");
    return null;
  } finally {
    loading.value = false;
  }
}

async function saveWithRefresh(p = {}) {
  const ret = await saveData();
  await fetchData({ ...p });
  return ret;
}

async function deleteWithRefresh(p = {}) {
  const ret = await deleteData();
  await fetchData({ ...p });
  return ret;
}

// ★ resetForm のバグ修正：computed(payload) を直接書き換えない
function resetForm() {
  if (!isPlainObject(props.data)) return;

  const cleared = deepClone(props.data);
  const contentKeys = Object.keys(payload.value);

  for (const key of contentKeys) {
    // ここはあなたの元ロジックに寄せる（contentだけObject、それ以外は空）
    if (key === "content") cleared[key] = {};
    else cleared[key] = "";
  }

  emit("update:modelValue", cleared);
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

async function templateAsSave() {
  console.log("data====", payload.value);
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
  <div>
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

    <OnboardingGuide
      :steps="props.steps"
      :formData="props.data"
      v-if="steps && steps.length > 0"
    />
  </div>
</template>

<style>
.highlight {
  position: relative;
  z-index: 9999;
  border: 3px solid red;
  box-shadow: 0px 0px 10px red;
  transition: 0.3s;
}
</style>

<!-- 
<DbSlot
  v-model="form"
  :sqlTags="sqlTags"
  :params="{ adjust_year }"
  :forceJsonKeys="['content', 'effectiveDates']"
  :transforms="{
    beforeSave: (dat) => {
      // content は必ず文字列で保存したい等
      if (dat.content && typeof dat.content === 'object') {
        dat.content = JSON.stringify(dat.content)
      }
      return dat
    },
    perTag: {
      [sqlTags.select]: {
        fetch: (res) => {
          // select結果の整形（例：nullを空へ）
          if (res && res.content == null) res.content = {}
          return res
        }
      }
    }
  }"
/> -->
