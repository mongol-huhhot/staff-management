<!-- S3FileManager.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useFileStore } from '@/stores/useFileStore'

const headers = [
  { title: 'Preview', key: 'thumbnailUrl', sortable: false },
  { title: 'File_uuid', key: 'file_uuid' },
  { title: 'Category', key: 'category' },
  { title: 'Original_name', key: 'original_name' },
  { title: 'Mime_type', key: 'mime_type' },
  { title: 'File_size', key: 'file_size' },
  { title: 'Created_by', key: 'created_by' },
  { title: 'Created_at', key: 'created_at' },
  { title: '操作', key: 'actions', sortable: false },
]

const fileStore = useFileStore()

console.log(fileStore.files)

const category = ref('staff/profile')
const selectedFile = ref(null)

const onFileChange = (event) => {
  selectedFile.value = event.target.files?.[0] || null
}

const upload = async () => {
  const result = await fileStore.uploadFile(selectedFile.value, category.value)

  if (result) {
    selectedFile.value = null
    await fileStore.loadFiles(category.value)
  }
}

const reload = async () => {
  await loadFiles()
}

const preview = async (fileUuid) => {
  await fileStore.previewFile(fileUuid)
}

const download = async (fileUuid) => {
  await fileStore.downloadFile(fileUuid)
}

const remove = async (fileUuid) => {
  if (!confirm('このファイルを削除しますか？')) return

  const ok = await fileStore.softDeleteFile(fileUuid)

  if (ok) {
    await fileStore.loadFiles(category.value)
  }
}

const formatSize = (size) => {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

onMounted(() => {
  // fileStore.loadFiles(category.value)
  loadFiles()
})

const loadFiles = async () => {
  await fileStore.loadFiles(category.value)

  for (const file of fileStore.files) {
    if (file.mime_type?.startsWith('image/')) {
      const preview = await fileStore.getPreviewUrl(file.file_uuid, {
        loading: false,
      })

      file.thumbnailUrl = preview?.url || null
    }
  }

  console.log('with thumbnail=', fileStore.files)
}

</script>

<template>
  <div class="s3-file-manager">
    <h3>S3ファイル管理</h3>

    <div class="toolbar">
      <label>
        カテゴリ：
        <input
          v-model="category"
          type="text"
          placeholder="staff/profile"
        />
      </label>

      <button @click="reload">
        再読込
      </button>
    </div>

    <div class="upload-box">
      <input
        type="file"
        @change="onFileChange"
      />

      <button
        :disabled="!selectedFile"
        @click="upload"
      >
        アップロード
      </button>
    </div>

    <!-- {{ fileStore.files }} -->
    <v-data-table
      :headers="headers"
      :items="fileStore.files"
    >
      <!-- サムネイル / アイコン -->
      <template #item.thumbnailUrl="{ item }">
        <v-avatar
          size="48"
          rounded
          color="grey-lighten-3"
        >
          <v-img
            v-if="item.mime_type?.startsWith('image/') && item.thumbnailUrl"
            :src="item.thumbnailUrl"
            cover
          />

          <v-icon v-else-if="item.mime_type === 'application/pdf'">
            mdi-file-pdf-box
          </v-icon>

          <v-icon
            v-else-if="
              item.mime_type?.includes('spreadsheet') ||
              item.mime_type?.includes('excel')
            "
          >
            mdi-file-excel
          </v-icon>

          <v-icon v-else-if="item.mime_type === 'text/csv'">
            mdi-file-delimited
          </v-icon>

          <v-icon v-else>
            mdi-file
          </v-icon>
        </v-avatar>
      </template>

      <!-- 操作ボタン -->
      <template #item.actions="{ item }">
        <v-btn
          size="small"
          variant="text"
          @click="preview(item.file_uuid)"
        >
          表示
        </v-btn>

        <v-btn
          size="small"
          variant="text"
          @click="download(item.file_uuid)"
        >
          DL
        </v-btn>

        <v-btn
          size="small"
          variant="text"
          color="error"
          @click="remove(item.file_uuid)"
        >
          削除
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<style scoped>
.s3-file-manager {
  padding: 16px;
}

.toolbar,
.upload-box {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.file-table {
  width: 100%;
  border-collapse: collapse;
}

.file-table th,
.file-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.file-table th {
  background: #f5f5f5;
}

button {
  margin-right: 6px;
}
</style>
