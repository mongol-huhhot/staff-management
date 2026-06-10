<!-- LookupTable.vue -->
<script setup>
/**
 * LookupTable component
 * by, Janga Chen, 2025/07/02
 * This component provides a combobox for selecting items from a lookup table.
 * It supports multiple selections, item creation, and dynamic loading of items.
 * 
 * usage:
 * <LookupTable
 *   identify_code="department"
 *   :params="{identify_code: 'department', active: true}"
 *   v-model="selectedDepartment"
 *   :multiple="true"
 *   :creatable="true"
 *   label="部署を選択"
 *   density="compact"
 *   :returnObject="false"
 *   :original="originalDepartment"
 *   :isAutoComp="false" <!-- use v-autocomplete instead of v-combobox
 * />
 * identify_code="department" should be a globelly unique code of the lookup table
 * params should contain some additional parameters to filter items in the table. 
 * the final parameters are passed look like
 * e.g., {identify_code: 'department', active: true}
 * This component will load items from the API based on the identify_code and params.
 */
import { ref, watch, onMounted, defineExpose, computed } from 'vue'
import { useLookupTableStore } from '@/stores/lookupTable/LookupTable'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { rules } from "@/utils/valitators";

const configStore = useAppConfigStore()
configStore.loadFromWindow()

const useApi = useLookupTableStore()

const props = defineProps({
  // the code to identify the lookup table, e.g., 'department'
  identify_code: {
      type: String,
      required: true
  },
  // some additional paraemter to filter items
  // e.g., {active: true} to only show active items
  // this will be passed to the API call to load items
  // to identify the lookup table
  // e.g., {identify_code: 'department', active: true}
  params: {
      type: Object,
      default: () => ({}),
      required: true
  },
  // whether to allow multiple selections
  multiple: Boolean, 
  // creatable: Boolean, // whether to allow creating new items
  // If creatable is true, the component will allow users to add new items
  // If false, it will only allow selection from existing items
  creatable: Boolean,
  // modelValue: [String, Number, Array, Object], // v-model binding
  // modelValue can be a single value or an array of values
  // If multiple is true, modelValue should be an array
  // If multiple is false, modelValue can be a single value or an object
  // If returnObject is true, modelValue will be an object with code and name
  // If returnObject is false, modelValue will be a string or number
  modelValue: [String, Number, Array, Object],
  // label for the combobox
  // this will be displayed as the label for the combobox
  label: {
      type: String,
      default: '選択または入力',
      required: false
  },
  // density for the combobox
  // this will be passed to the v-combobox component
  // options are 'default', 'comfortable', 'compact'
  // default is 'compact'
  density: {
      type: String,
      default: 'compact',
      required: false
  },
  // returnObject: Boolean, // whether to return the whole object or just the code
  // If true, the modelValue will be an object with code and name
  // If false, the modelValue will be just the code
  // If multiple is true, modelValue will be an array of objects
  // If multiple is false, modelValue will be a single object or code
  // If returnObject is true, the combobox will display the name of the item
  // If returnObject is false, the combobox will display the code of the item
  returnObject: {
    type: Boolean,
    default: false,
    required: false
  },
  // original value, used for diff display
  // if the original value is different from the current value
  // this is useful for displaying the original value in the diff display
  // e.g., <DiffSelect v-model="selected" :original="originalValue"
  // :items="items" label="選択" density="compact" />
  original:{
    type: String,
    default: '',
    required: false
  },
  selectType: {
    type: String,
    default: "select", // 'select/autocomplate/combobox'
    required: false
  },
  // ✅ NEW: readonly prop
  readonly: {
    type: Boolean,
    default: false
  },
  excludes: {
    type: [String, Array],
    default: () => [],
    validator: (value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) {
        return value.every(item => typeof item === 'string');
      }
      return false;
    }
  },
})

const emit = defineEmits(['update:modelValue', 'change']) // ✅ Declare 'change' here


console.log("props.excludes = ", props.excludes)

const excludedCodesSet = computed(() => {
  if (typeof props.excludes === 'string') {
    return new Set([props.excludes]);
  }
  return new Set(props.excludes || []);
});

const items = ref([])
const selected = ref(
  props.modelValue ?? (props.multiple ? [] : null)
)

const loading = ref(false)
const dialog = ref(false)
const editItem = ref({})
const suppressWatch = ref(false)
// const extrasJson = ref('')
const jsonError = ref(false)
const isEditing = ref(false)
const valid = ref(false);
const formRef = ref(null)
// Computed properties
const currentIdentifyCode = computed(() => props.identify_code)
const editDialogTitle = computed(() => 
  isEditing.value ? '項目を編集' : '項目を追加'
)

editItem.value = {
  id: null,
  identify_code: currentIdentifyCode.value,
  code: '',
  name: name,
  extras: {},                 // ✅ object, not '{}'
  sort_order: null,
  is_active: 'active'
}

const showEditButton = computed(() => {
  // Don't show edit button if readonly
  if (props.readonly) return false
  // props.editable が false なら非表示。config のフラグが明示 false の場合も非表示
  const cfg = configStore?.lookupTable?.editable
  return (cfg === undefined || cfg === null || cfg === true)
})

// Sync modelValue changes
watch(() => props.modelValue, (val) => {
  selected.value = val
  console.log("modelValue changed:", val)
})

// Emit code values only
watch(selected, (val) => {
  if (suppressWatch.value) return
  emit('update:modelValue', val ?? null)
})

// New item detection with debounce
watch(selected, (val) => {
  if (!props.creatable || loading.value || dialog.value) return
  if (props.returnObject) return // Skip in returnObject mode

  const existsInItems = (v) => 
    items.value.some(i => i.name === v || i.code === v)

  if (props.multiple && Array.isArray(val)) {
    const newItems = val.filter(v => 
      v && typeof v === 'string' && !existsInItems(v)
    )
    if (newItems.length) addNewItem(newItems[0])
  } 
  else if (typeof val === 'string' && val && !existsInItems(val)) {
    addNewItem(val)
  }
})

// Data loading
onMounted(loadItems)
// watch(() => props.params, loadItems, { deep: true })

// async function loadItems() {
//   try {
//     if( items.value.length > 0 ) return; // already loaded
//     loading.value = true
//     items.value = await useApi.loadLookupTable({ identify_code: props.identify_code, ...props.params })
//     items.value = (items.value || []).map(it => ({
//       ...it,
//       // ✅ normalize extras to object
//       extras: typeof it.extras === 'string'
//         ? ( (() => { try { return JSON.parse(it.extras) } catch { return {} } })() )
//         : (it.extras || {})
//     }))
//     if(!props.creatable) {
//       // If not creatable, filter out items with empty names
//       items.value = items.value.filter(item => item.is_active === 'active' && item.name)
//     }
//     items.value = items.value || []
//     // items.value = items.value.filter( el => !excludes.includes(el.code) )
//   } catch (error) {
//     console.error("Load failed:", error)
//   } finally {
//     loading.value = false
//   }
// }

async function loadItems() {
  try {
    if (items.value.length > 0) return;
    loading.value = true;
    let rawItems = await useApi.loadLookupTable({ 
      identify_code: props.identify_code, 
      ...props.params 
    });

    // Normalize extras
    rawItems = (rawItems || []).map(it => ({
      ...it,
      extras: typeof it.extras === 'string'
        ? (() => { try { return JSON.parse(it.extras) } catch { return {} } })()
        : (it.extras || {})
    }));

    // Filter inactive/empty if not creatable
    if (!props.creatable) {
      rawItems = rawItems.filter(item => item.is_active === 'active' && item.name);
    }

    // ✅ Apply excludes filter
    items.value = rawItems.filter(item => 
      !excludedCodesSet.value.has(item.code)
    );

  } catch (error) {
    console.error("Load failed:", error);
    items.value = [];
  } finally {
    loading.value = false;
  }
}

// Item creation
function addNewItem(name='') {
  editItem.value = {
    id: null,
    identify_code: currentIdentifyCode.value,
    code: '',
    name: name,
    extras: '{}',
    sort_order: null,
    is_active: 'active'
  }
  // extrasJson.value = JSON.stringify(editItem.value.extras, null, 2)
  isEditing.value = false

  console.log("Adding new item:", editItem.value)
}

function editSelectedItem() {
  console.log("Selected item for edit:", selected.value, items.value)
  if (!selected.value || selected.value.length===0) {
    addNewItem()
    dialog.value = true
    return
  }
  
  const selectedItem = props.returnObject 
    ? selected.value 
    : items.value.find(item => item.code === selected.value)
  
  console.log("Selected item for edit:", selectedItem)

  if (selectedItem) {
    editItem.value = { 
      ...selectedItem, 
      extras: (typeof selectedItem.extras === 'string'
        ? (() => { try { return JSON.parse(selectedItem.extras) } catch { return {} } })()
        : (selectedItem.extras || {}))
    }
    isEditing.value = true
    dialog.value = true
  }
}

function extractPart(str) {
  if (str.includes(":")) {
    // If the string contains ":", split and return the part after the colon
    return str.split(":")[1];
  } else {
    // If there is no ":", return the entire string
    return str;
  }
}

async function saveItem() {
  try {
    loading.value = true
    
    // Auto-generate code if empty
    if (!editItem.value.code.trim()) {
      editItem.value.code = `GEN_${Date.now().toString(36).slice(-6)}`
    }
    
    // Calculate sort order for new items
    if (!isEditing.value) {
      const maxSort = items.value.reduce(
        (max, item) => Math.max(max, item.sort_order || 0), 0
      )
      editItem.value.sort_order = maxSort + 1
    }

    const data = {
      identify_code: editItem.value.identify_code,
      code: editItem.value.code,
      name: extractPart(editItem.value.name),
      extras: editItem.value.extras,        // ✅ keep object
      sort_order: editItem.value.sort_order || 0,
      is_active: editItem.value.is_active || 'active'
    }

    console.log("data======", data)

    await useApi.saveLookupTable(data)
    await loadItems()

    dialog.value = false
    loading.value = false
    // selected.value = editItem.value.code

    suppressWatch.value = false

  } catch (error) {
    console.error("Save failed:", error)
  } finally {
    loading.value = false
    dialog.value = false
  }
}

async function deleteItem() {
  await useApi.deleteLookupTable(editItem.value)
  await loadItems()
}

function cancelDialog() {
  suppressWatch.value = true
  if (props.multiple) {
    selected.value = selected.value.filter(v => v !== editItem.value.name)
  } else {
    selected.value = null
  }
  suppressWatch.value = false
  dialog.value = false
}

const statusData = [{value: 'active', label: '有効' }, { value: 'inactive', label: '未使用' }, { value: 'removed', label:'削除済み' }]

const beforeTitle = computed(() => {
  return items.value?.find((e) => e.value == props.original)?.title
})

const selectedItem = computed(()=> items.value?.filter(el=> el.code === selected.value))

// the whole data of selected item
defineExpose({
  selectedItem
})

</script>

<template>
  <v-sheet class="d-flex">
    <!-- Prepend Slot -->
    <slot name="prepend"></slot>

    <!-- {{selectedItem}} -->
    <v-combobox
      v-if="props.selectType==='combobox'"
      v-model="selected"
      :items="items"
      item-title="name"
      item-value="code"
      :density="density"
      :multiple="multiple"
      :loading="loading"
      :clearable="!readonly"
      :label="label"
      :return-object="returnObject"
      :readonly="readonly"
    >
      <template #item="{ item, props }">
        <v-list-item v-bind="props">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <!-- Show extras, if needed -->
          <v-list-item-subtitle v-if="item.extras">
            <pre>{{ JSON.stringify(item.extras, null, 2) }}</pre>
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <!-- No Data Slot -->
      <template #no-data>
        <slot name="no-data">
          <v-list-item>No data available</v-list-item>
        </slot>
      </template>
    </v-combobox>

    <!-- Main Input Field -->
    <v-select
      v-if="props.selectType==='select'"
      v-model="selected"
      :items="items"
      item-title="name"
      item-value="code"
      :density="density"
      :multiple="multiple"
      :loading="loading"
      :clearable="!readonly"
      :label="label"
      :return-object="returnObject"
      :readonly="readonly"
      >
      <!-- Custom Item Rendering -->
      <template #item="{ item, props }">
        <v-list-item v-bind="props">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <!-- Show extras, if needed -->
          <v-list-item-subtitle v-if="item.extras">
            <pre>{{ JSON.stringify(item.extras, null, 2) }}</pre>
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <!-- No Data Slot -->
      <template #no-data>
        <slot name="no-data">
          <v-list-item>No data available</v-list-item>
        </slot>
      </template>
    </v-select>

    <v-autocomplete
      v-else
        v-model="selected"
        :items="items"
        item-title="name"
        item-value="code"
        :density="density"
        :multiple="multiple"
        :loading="loading"
        :clearable="!readonly"
        :label="label"
        :return-object="returnObject"
        :readonly="readonly"
      >
      <!-- Custom Item Rendering -->
      <template #item="{ item, props }">
        <v-list-item v-bind="props">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <!-- Show extras, if needed -->
          <v-list-item-subtitle v-if="item.extras">
            <pre>{{ JSON.stringify(item.extras, null, 2) }}</pre>
          </v-list-item-subtitle>
        </v-list-item>
      </template>

      <!-- No Data Slot -->
      <template #no-data>
        <slot name="no-data">
          <v-list-item>No data available</v-list-item>
        </slot>
      </template>
    </v-autocomplete>

    <!-- Append Slot -->
    <slot name="append"></slot>

    <!-- Creatable Button -->
    <v-btn
      v-if="showEditButton"
      icon
      variant="text"
      size="small"
      class="ml-1"
      @click="editSelectedItem"
    >
      <v-icon>mdi-pencil</v-icon>
    </v-btn>

    <!-- Dialog for Editing/Creating Items -->
    <v-dialog v-model="dialog" max-width="700">
      <v-card>
        <v-card-title>{{ editDialogTitle }}</v-card-title>
        <v-card-text>
          <v-form v-model="valid" ref="formRef">
          <v-row dense >
            <v-col cols="12" sm="6">
              <v-text-field 
                label="識別コード"
                v-model="editItem.identify_code"
                readonly
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
                label="ステータス"
                v-model="editItem.is_active"
                density="compact"
              >
                <template v-slot:append>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props">mdi-menu-down</v-icon>
                    </template>
                    <v-list>
                      <v-list-item 
                        v-for="status in statusData" 
                        :key="status.value"
                        @click="editItem.is_active = status.value"
                      >
                        {{ status.label }}
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
                label="ユニックコード" 
                v-model="editItem.code"
                :rules="[rules.required]"
                required
                density="compact"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
                label="表示順" 
                v-model="editItem.sort_order"
                type="number"
                density="compact"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field 
                label="通称（出勤、有休など）" 
                v-model="editItem.name"
                :rules="[rules.required]"
                required
                density="compact"
              />
            </v-col>
            <v-col cols="12">
              <slot
                  name="json"
                  :editItem="editItem"
                  :json="editItem.extras"
                  :setJson="(val) => { editItem.extras = val }"
                >
                  <!-- Default fallback: -->
                  <v-textarea 
                    label="追加情報 (JSON形式)" 
                    v-model="editItem.extras"
                    :error="jsonError"
                    rows="5"
                    auto-grow
                    density="compact"
                  />
                  <v-alert v-if="jsonError" type="error" density="compact">
                    無効なJSON形式です
                  </v-alert>
              </slot>            
            </v-col>
          </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="warning" @click="addNewItem">新規</v-btn>
          <v-btn color="primary" @click="saveItem" :disabled="!valid">保存</v-btn>
          <v-btn color="error" @click="deleteItem">削除</v-btn>
          <v-btn text @click="cancelDialog">キャンセル</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>
