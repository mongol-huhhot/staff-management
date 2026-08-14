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

const imageItems = ref([])
const imageLoading = ref(false)

/*
 * 古い通信結果が、別の申請内容へ反映されることを防止する。
 */
let imageLoadSequence = 0

/*
 * attachmentFieldのpropsを取得する。
 * field_definition内に定義されている形式にも対応する。
 */
function getAttachmentProps(field) {
  return {
    ...(field.field_definition?.props || {}),
    ...(field.props || {}),
  }
}

/*
 * JSONBが配列・オブジェクト・JSON文字列の
 * いずれで渡されても配列へ正規化する。
 */
function normalizeAttachmentFiles(value) {
  let parsed = value

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch (error) {
      console.warn(
        '添付画像データのJSON解析に失敗しました',
        error
      )

      return []
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.filter(
      file =>
        file?.file_kind &&
        file?.file_uuid
    )
  }

  /*
   * 旧データなどで単一オブジェクトだった場合にも対応する。
   */
  if (
    parsed &&
    typeof parsed === 'object' &&
    parsed.file_kind &&
    parsed.file_uuid
  ) {
    return [parsed]
  }

  return []
}

/*
 * attachmentFields、フォームデータ、UploadFiles設定から
 * 表示すべき画像枠を構築する。
 *
 * configに2枠あり、フォームに1画像しかない場合は、
 * 残りの枠を「画像なし」として表示する。
 */
const attachmentImageSlots = computed(() => {
  const result = []

  for (const field of attachmentFields.value) {
    const fieldKey = getFieldKey(field)

    if (!fieldKey) {
      continue
    }

    const fieldProps = getAttachmentProps(field)

    const documentType =
      fieldProps.documentType ||
      fieldKey

    const attachmentLabel =
      field.label ||
      field.field_definition?.label ||
      field.item_name ||
      documentType

    const uploadConfig =
      configStore.UploadFiles?.[documentType] || {}

    const configuredSlots =
      Array.isArray(uploadConfig.files)
        ? uploadConfig.files
        : []

    const modelFiles = normalizeAttachmentFiles(
      props.summaryRow?.[fieldKey]
    )

    const filesByKind = new Map(
      modelFiles.map(file => [
        file.file_kind,
        file,
      ])
    )

    const configuredKinds = new Set()

    /*
     * configに定義された順番で画像枠を作成する。
     */
    for (const slot of configuredSlots) {
      const fileKind =
        `${documentType}_${slot.field}`

      configuredKinds.add(fileKind)

      const modelFile =
        filesByKind.get(fileKind) || null

      result.push({
        key: `${fieldKey}:${fileKind}`,
        fieldKey,
        documentType,
        fileKind,
        fileUuid:
          modelFile?.file_uuid || null,
        label: slot.headerName
          ? `${attachmentLabel}：${slot.headerName}`
          : attachmentLabel,
      })
    }

    /*
     * configには存在しないが、フォームデータには存在する画像も
     * 履歴から消さないように追加する。
     */
    for (const modelFile of modelFiles) {
      if (
        configuredKinds.has(modelFile.file_kind)
      ) {
        continue
      }

      result.push({
        key:
          `${fieldKey}:${modelFile.file_kind}:${modelFile.file_uuid}`,
        fieldKey,
        documentType,
        fileKind: modelFile.file_kind,
        fileUuid: modelFile.file_uuid,
        label:
          `${attachmentLabel}：${modelFile.file_kind}`,
      })
    }
  }

  return result
})

/*
 * summaryRow内の画像UUIDが変わった場合だけ、
 * プレビューURLを再取得するための署名。
 */
const attachmentImageSignature = computed(() =>
  attachmentImageSlots.value
    .map(item =>
      `${item.key}:${item.fileUuid || ''}`
    )
    .join('|')
)

async function loadImages() {
  const currentSequence =
    ++imageLoadSequence

  const slots = attachmentImageSlots.value

  imageItems.value = []

  if (!props.modelValue) {
    imageLoading.value = false
    return
  }

  if (slots.length === 0) {
    imageLoading.value = false
    return
  }

  imageLoading.value = true

  try {
    /*
     * 同じUUIDが複数回現れた場合に、
     * 同じAPIを重複して呼ばないためのキャッシュ。
     *
     * このloadImages()実行中だけ保持する。
     */
    const previewRequests = new Map()

    function getPreviewUrl(fileUuid) {
      if (!fileUuid) {
        return Promise.resolve(null)
      }

      if (!previewRequests.has(fileUuid)) {
        const request = fileStore
          .getPreviewUrl(
            fileUuid,
            {
              loading: false,
            }
          )
          .then(result => result?.url || null)
          .catch(error => {
            console.error(
              'プレビューURL取得に失敗しました',
              {
                fileUuid,
                error,
              }
            )

            return null
          })

        previewRequests.set(
          fileUuid,
          request
        )
      }

      return previewRequests.get(fileUuid)
    }

    const loadedItems = await Promise.all(
      slots.map(async slot => {
        const url = await getPreviewUrl(
          slot.fileUuid
        )

        return {
          ...slot,
          url,
          status:
            !slot.fileUuid
              ? 'empty'
              : url
                ? 'ready'
                : 'error',
        }
      })
    )

    /*
     * 通信中に別の履歴へ切り替わった場合は、
     * 古い結果を反映しない。
     */
    if (
      currentSequence !== imageLoadSequence
    ) {
      return
    }

    imageItems.value = loadedItems
  } finally {
    if (
      currentSequence === imageLoadSequence
    ) {
      imageLoading.value = false
    }
  }
}

watch(
  [
    () => props.modelValue,
    () => props.requestId,
    attachmentImageSignature,
  ],
  ([open]) => {
    if (!open) {
      /*
       * 実行中の通信結果を無効化する。
       * 再度開いたときは新しい一時URLを取得する。
       */
      imageLoadSequence++
      imageItems.value = []
      imageLoading.value = false
      return
    }

    loadImages()
  },
  {
    immediate: true,
  }
)

watch(
  props,
  (newVal) => {
    console.log("props",newVal)
  },
  {
    deep: true
  }
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

        
          <template v-if="attachmentFields.length">
  <v-divider class="my-6" />

  <div class="text-subtitle-1 mb-3">
    添付画像
  </div>

  <v-progress-linear
    v-if="imageLoading"
    indeterminate
    class="mb-4"
  />

  <v-row
    v-if="imageItems.length"
    dense
  >
    <v-col
      v-for="image in imageItems"
      :key="image.key"
      cols="12"
      sm="6"
      md="4"
    >
      <div class="text-caption mb-1">
        {{ image.label }}
      </div>

      <v-img
        v-if="image.status === 'ready'"
        :src="image.url"
        height="240"
        class="rounded border bg-grey-lighten-4"
      >
        <template #placeholder>
          <div
            class="
              d-flex
              align-center
              justify-center
              fill-height
            "
          >
            <v-progress-circular
              indeterminate
              color="primary"
            />
          </div>
        </template>
      </v-img>

      <v-sheet
        v-else
        height="120"
        border
        rounded
        class="
          d-flex
          align-center
          justify-center
          text-medium-emphasis
        "
      >
        <span v-if="image.status === 'empty'">
          画像なし
        </span>

        <span v-else>
          画像を取得できませんでした
        </span>
      </v-sheet>
    </v-col>
  </v-row>

  <v-sheet
    v-else-if="!imageLoading"
    height="120"
    border
    rounded
    class="
      d-flex
      align-center
      justify-center
      text-medium-emphasis
    "
  >
    添付画像はありません
  </v-sheet>
</template>
        
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