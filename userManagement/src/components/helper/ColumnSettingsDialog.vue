<script setup>
import { computed, ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'

const props = defineProps({
  open: Boolean,
  columns: { type: Array, required: true },
  visibleMap: { type: Object, required: true },
  storageKey: { type: String, default: 'aggrid:columnVisibility' },
})

const emit = defineEmits([
  'update:open',
  'apply',
])

const selectableCols = computed(() => {
  return (props.columns || []).filter(c => c.field)
})

const storedMap = useStorage(props.storageKey, {})
const local = ref({})

function sanitizeMap(map) {
  const allowed = new Set(selectableCols.value.map(c => c.field))
  const out = {}

  for (const [k, v] of Object.entries(map || {})) {
    if (allowed.has(k)) {
      out[k] = v !== false
    }
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

function rebuildLocal() {
  const base = sanitizeMap(props.visibleMap || {})

  selectableCols.value.forEach(c => {
    if (!(c.field in base)) {
      base[c.field] = true
    }
  })

  const saved = sanitizeMap(storedMap.value || {})

  local.value = {
    ...base,
    ...saved,
  }
}

watch(
  () => [props.columns, props.visibleMap],
  () => rebuildLocal(),
  {
    immediate: true,
    deep: true,
  }
)

watch(
  () => props.open,
  isOpen => {
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
  },
})

function close() {
  emit('update:open', false)
}

function apply() {
  const payload = sanitizeMap(local.value)

  selectableCols.value.forEach(c => {
    if (!(c.field in payload)) {
      payload[c.field] = true
    }
  })

  storedMap.value = {
    ...payload,
  }

  emit('apply', {
    ...payload,
  })

  close()
}

function reset() {
  storedMap.value = {}
  local.value = buildDefaultMap()

  emit('apply', {
    ...local.value,
  })
}
</script>

<template>
  <v-dialog
    :model-value="open"
    max-width="520"
    @update:model-value="emit('update:open', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">
        Column Settings
      </v-card-title>

      <v-card-text>
        <div class="header-row">
          <div class="text-subtitle-2">
            Show / Hide Columns
          </div>

          <div class="header-actions">
            <span class="text-body-2">全選択</span>

            <v-checkbox
              v-model="selectAll"
              hide-details
              density="compact"
            />

            <v-btn
              size="small"
              variant="tonal"
              color="warning"
              @click="reset"
            >
              リセット
            </v-btn>
          </div>
        </div>

        <v-sheet
          class="column-list"
          border
          rounded
        >
          <div
            v-for="c in selectableCols"
            :key="c.field"
            class="column-row"
          >
            <div class="column-label">
              {{ c.headerName || c.field }}
              <span class="text-grey">
                ({{ c.field }})
              </span>
            </div>

            <v-checkbox
              v-model="local[c.field]"
              hide-details
              density="compact"
            />
          </div>
        </v-sheet>
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="text"
          @click="close"
        >
          キャンセル
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          @click="apply"
        >
          適用
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-list {
  max-height: 420px;
  overflow: auto;
  padding: 8px;
}

.column-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4px;
}

.column-label {
  font-size: 14px;
}
</style>