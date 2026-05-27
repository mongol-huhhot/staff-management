<script setup>
import { computed, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

const props = defineProps({
  open: Boolean,
  columns: { type: Array, required: true },
  visibleMap: { type: Object, required: true },
  storageKey: { type: String, default: 'aggrid:columnVisibility' },
})

const emit = defineEmits(['update:open', 'apply'])

const selectableCols = computed(() => (props.columns || []).filter(c => c.field))

function sanitizeMap(map) {
  const allowed = new Set(selectableCols.value.map(c => c.field))
  const out = {}
  for (const [k, v] of Object.entries(map || {})) {
    if (allowed.has(k)) out[k] = v !== false
  }
  return out
}

function buildDefaultMap() {
  const m = {}
  selectableCols.value.forEach(c => {
    m[c.field] = true
  })
  return m
}

const storedMap = useStorage(props.storageKey, {})
const local = ref({})

function rebuildLocal() {
  const base = sanitizeMap(props.visibleMap || {})

  selectableCols.value.forEach(c => {
    if (!(c.field in base)) base[c.field] = true
  })

  const saved = sanitizeMap(storedMap.value || {})
  local.value = { ...base, ...saved }
}

watch(
  () => [props.columns, props.visibleMap],
  () => rebuildLocal(),
  { immediate: true, deep: true }
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) rebuildLocal()
  }
)

const selectAll = computed({
  get() {
    const cols = selectableCols.value
    if (!cols.length) return false
    return cols.every(c => local.value[c.field] !== false)
  },
  set(val) {
    selectableCols.value.forEach(c => {
      local.value[c.field] = !!val
    })
  }
})

function close() {
  emit('update:open', false)
}

function apply() {
  const payload = sanitizeMap(local.value)

  selectableCols.value.forEach(c => {
    if (!(c.field in payload)) payload[c.field] = true
  })

  storedMap.value = { ...payload }
  emit('apply', { ...payload })
  close()
}

function reset() {
  storedMap.value = {}
  local.value = buildDefaultMap()
  emit('apply', { ...local.value })
}
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="520"
    @update:model-value="val => !val && close()"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Column Settings</span>
      </v-card-title>

      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-3">
          <div>Show / Hide Columns</div>
          <div class="d-flex align-center ga-3">
            <span>全選択</span>
            <v-checkbox
              v-model="selectAll"
              hide-details
              density="compact"
              class="ma-0 pa-0"
            />
            <v-btn
              size="small"
              variant="outlined"
              @click="reset"
            >
              リセット
            </v-btn>
          </div>
        </div>

        <div
          style="max-height: 420px; overflow:auto; border:1px solid #eee; padding:8px; border-radius:8px;"
        >
          <div
            v-for="c in selectableCols"
            :key="c.field"
            class="d-flex justify-space-between align-center py-2 px-1"
          >
            <div>{{ c.headerName }} ({{ c.field }})</div>
            <v-checkbox
              v-model="local[c.field]"
              hide-details
              density="compact"
              class="ma-0 pa-0"
            />
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close">キャンセル</v-btn>
        <v-btn color="primary" variant="flat" @click="apply">適用</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>