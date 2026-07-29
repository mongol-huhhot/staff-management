<template>
  <v-dialog v-model="dialog" max-width="900">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        variant="text"
        size="small"
        color="grey-darken-1"
        prepend-icon="mdi-history"
      >
        変更前の画像
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="grey-darken-1">mdi-history</v-icon>
        変更前の画像（承認済）
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-alert v-else-if="!images.length" type="info" variant="tonal">
          変更前の画像はありません
        </v-alert>

        <v-row v-else>
          <v-col
            v-for="image in images"
            :key="image.file_uuid"
            cols="12"
            sm="6"
          >
            <div class="text-caption text-medium-emphasis mb-1">
              {{ image.headerName }}
            </div>
            <v-img
              :src="image.url"
              max-height="360"
              class="bg-grey-lighten-4 rounded"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { useFileStore } from '@/stores/useFileStore'

const configStore = useAppConfigStore()
configStore.loadFromWindow()

const fileStore = useFileStore()

const props = defineProps({
  documentType: { type: String, required: true }, // 例: mynumber_card
  categoryCode: { type: String, default: '' },    // 例: basic
  ownerType: { type: String, default: 'staff' },
  staffCode: { type: String, default: '' },
  recordId: { type: [String, Number], required: true }, // 承認済レコードの record_id
})

const dialog = ref(false)
const loading = ref(false)
const loaded = ref(false)
const images = ref([])

const cfgFiles = computed(
  () => configStore.UploadFiles?.[props.documentType]?.files || []
)

// UploadImageWrapper と同じキー体系で、承認済レコードの画像を検索する
const load = async () => {
  if (loaded.value) return

  loading.value = true

  try {
    const fileKey = `${props.documentType}#approved#${props.recordId}`

    const filters = cfgFiles.value.map(fileConfig => ({
      category: `${props.ownerType}/${props.categoryCode}`,
      owner_type: props.ownerType,
      owner_id: `${props.ownerType}_${props.staffCode}`,
      file_kind: `${props.documentType}_${fileConfig.field}`,
      record_id: props.recordId,
    }))

    await fileStore.loadFiles(
      { file_key: fileKey, filters },
      { loading: false }
    )

    const rows = fileStore.files[fileKey] || []
    const result = []

    for (const file of rows) {
      if (!file.mime_type?.startsWith('image/')) continue

      const preview = await fileStore.getPreviewUrl(file.file_uuid, {
        loading: false,
      })

      const matched = cfgFiles.value.find(
        f => `${props.documentType}_${f.field}` === file.file_kind
      )

      result.push({
        ...file,
        url: preview?.url || null,
        headerName: matched?.headerName || file.file_kind,
      })
    }

    images.value = result
    loaded.value = true
  } catch (error) {
    console.error('変更前画像の取得に失敗:', error)
  } finally {
    loading.value = false
  }
}

watch(dialog, opened => {
  if (opened) load()
})

watch(
  () => props.recordId,
  () => {
    loaded.value = false
    images.value = []
  }
)
</script>
