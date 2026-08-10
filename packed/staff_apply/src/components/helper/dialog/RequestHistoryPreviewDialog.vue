<script setup>
import { computed, ref, watch } from 'vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { useFileStore } from '@/stores/useFileStore'

const props = defineProps({
  modelValue: Boolean,
  requestId: {
    type: [String, Number],
    default: null,
  },
  summaryRow: {
    type: Object,
    default: () => ({}),
  },
  fields: {
    type: Array,
    default: () => [],
  },
  categoryCode: {
    type: String,
    default: '',
  },
  staffCode: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const configStore = useAppConfigStore()
console.log("configstore",configStore)
const fileStore = useFileStore()

configStore.loadFromWindow()

const imageItems = ref([])
const imageLoading = ref(false)

function getFieldKey(field) {
  const definition = field.field_definition || {}

  const key =
    field.key ||
    definition.key ||
    field.db?.column ||
    definition.db?.column ||
    field.l_item_code ||
    field.g_item_code

  return key?.includes('.')
    ? key.split('.').pop()
    : key
}

const visibleFields = computed(() =>
  props.fields.filter(
    field => field && field.showable !== 'hide'
  )
)

const attachmentFields = computed(() =>
  visibleFields.value.filter(
    field => field.group === 'attachment'
  )
)

const previewFields = computed(() =>
  visibleFields.value
    .filter(field => field?.enabled !== 'inactive')
    .filter(field => field?.group !== 'attachment')
    .sort(
      (a, b) =>
        Number(a.show_order || 0) -
        Number(b.show_order || 0)
    )
    .map(field => {
      const key = getFieldKey(field)
      return {
        key,
        label:
          field.label ||
          field.field_definition?.label ||
          field.item_name ||
          key,
        value: props.summaryRow?.[key],
        field,
      }
    })
)

function findOptionLabel(field, value) {
  const items =
    field.items ||
    field.props?.items ||
    field.field_definition?.props?.items ||
    []

  const itemTitle =
    field.props?.itemTitle ||
    field.props?.['item-title'] ||
    'label'

  const itemValue =
    field.props?.itemValue ||
    field.props?.['item-value'] ||
    'value'

  const matched = items.find(item => {
    if (typeof item !== 'object') {
      return item === value
    }

    return item?.[itemValue] === value
  })

  if (matched == null) return null
  if (typeof matched !== 'object') return matched

  return matched[itemTitle]
}

function formatValue(item) {
  const { field, value } = item

  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (Array.isArray(value)) {
    return value
      .map(element =>
        findOptionLabel(field, element) ?? String(element)
      )
      .join('、')
  }

  const optionLabel = findOptionLabel(field, value)
  if (optionLabel != null) return optionLabel

  if (typeof value === 'boolean') {
    return value ? 'はい' : 'いいえ'
  }

  if (
    field.type === 'date' ||
    field.component === 'v-date-input'
  ) {
    return String(value).replace(/\//g, '-').slice(0, 10)
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const documentTypes = computed(() =>
  configStore.historyPreview
    ?.documentsByCategory
    ?.[props.categoryCode] || []
)

async function loadImages() {
    if (!props.requestId) return
//     console.log("loadfile start")
//   imageItems.value = []

//   if (!props.modelValue) return
  

//   const ownerType = 'staff'
//   const staffCode =
//     props.summaryRow?.staff_code ||
//     props.staffCode

//     console.log("loadfile staffcode check")

//   if (!staffCode) return

//   console.log("loadfile after staffcode check",staffCode)


//   imageLoading.value = true

//   try {
//     const recordId =
//       props.summaryRow?.record_id || null

//     for (const documentType of documentTypes.value) {
//       const config =
//         configStore.UploadFiles?.[documentType] || {}

//       const slots = config.files || []

      const fileKey = props.requestId
        ? `file`
        : documentType

//         console.log("yet occur error")

    //   const filters = slots.map(slot => ({
    //     category: `${ownerType}/${props.categoryCode}`,
    //     owner_type: ownerType,
    //     owner_id: `${ownerType}_${staffCode}`,
    //     file_kind: `${documentType}_${slot.field}`,
    //     record_id: recordId,
    //   }))

      const filters = {
        // category: `${ownerType}/${props.categoryCode}`,
        // owner_type: ownerType,
        // owner_id: `${ownerType}_${staffCode}`,
        // file_kind: `${documentType}_${slot.field}`,
        record_id: props.requestId,
      }

//       console.log("loadfiles action params",fileKey)
//       console.log("loadfiles action params",filters)

      await fileStore.loadFiles({
        file_key: fileKey,
        filters,
      })

      console.log("fileStore.files?.file",fileStore.files?.file)

      for(const file of fileStore.files?.file){
        console.log("file",file)
        const preview = await fileStore.getPreviewUrl(file?.file_uuid, {
          loading: false,
        })

        console.log("file.uuid=======",file?.file_uuid || null)
        console.log("previewurl=======",preview?.url || null)

        if(preview){
            file.thumbnailUrl = preview?.url || null
        }
      }
        

    //   const loadedFiles =
    //     fileStore.files[fileKey] || []

    //   for (const slot of slots) {
    //     const fileKind =
    //       `${documentType}_${slot.field}`

    //     const file = loadedFiles.find(
    //       item => item.file_kind === fileKind
    //     )

    //     let url = null

    //     if (file?.file_uuid) {
    //       const preview =
    //         await fileStore.getPreviewUrl(
    //           file.file_uuid,
    //           { loading: false }
    //         )

    //       url = preview?.url || null
    //     }

    //     imageItems.value.push({
    //       key: fileKind,
    //       label: slot.headerName || slot.field,
    //       url,
    //    })
    //  }
    }
//   } finally {
//     console.log("dooo!!!!!!!")
//     imageLoading.value = false
//   }


watch(
  [
    () => props.modelValue,
    () => props.requestId,
  ],
  ([open]) => {
    if (open) loadImages()
  },
  { immediate: true }
)
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="1000"
    @update:model-value="
      value => emit('update:modelValue', value)
    "
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        申請内容プレビュー

        <v-spacer />

        <v-btn
          icon="mdi-close"
          variant="text"
          @click="emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
           <v-table density="compact">
            <tbody>
              <tr>
                <th>申請種別</th>
                <td>{{ props.summaryRow.request_type }}</td>
              </tr>
              <tr>
                <th>適用日</th>
                <td>{{ props.summaryRow.valid_from }}</td>
              </tr>
              <tr>
                <th>申請日</th>
                <td>{{ props.summaryRow.requested_at }}</td>
              </tr>
              <tr>
                <th>申請コメント</th>
                <td>{{ props.summaryRow.request_comment || '―' }}</td>
              </tr>
            </tbody>
          </v-table>
        <v-row dense>
          <v-col
            v-for="item in previewFields"
            :key="item.key"
            cols="12"
            sm="6"
            md="4"
          >
            <div class="preview-field">
              <div class="text-caption text-medium-emphasis">
                {{ item.label }}
              </div>

              <div class="text-body-1">
                {{ formatValue(item) }}
              </div>
            </div>
          </v-col>
        </v-row>

        
          <v-divider class="my-6" />

          <div class="text-subtitle-1 mb-3">
            添付画像
          </div>

          <v-progress-linear
            v-if="imageLoading"
            indeterminate
            class="mb-4"
          />

          <v-row dense>
            <v-col
              v-for="image in fileStore.files?.file"
              :key="image.file_kind"
              cols="12"
              sm="6"
              md="4"
            >
              <div class="text-caption mb-1">
                {{ image.label }}
              </div>

              <v-img
                v-if="image.thumbnailUrl"
                :src="image.thumbnailUrl"
                height="240"
                cover
                class="rounded border"
              />

              <v-sheet
                v-else
                height="120"
                border
                rounded
                class="d-flex align-center justify-center text-medium-emphasis"
              >
                画像なし
              </v-sheet>
            </v-col>
          </v-row>
        
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.preview-field {
  min-height: 68px;
  padding: 10px 12px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}
</style>