<!-- S3FileManager.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useFileStore } from '@/stores/useFileStore'

const fileStore = useFileStore()

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
  await fileStore.loadFiles(category.value)
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
  fileStore.loadFiles(category.value)
})


const loadFiles = async () => {
  const list = await fileStore.loadFiles(category.value)

  if (!list) return

  for (const file of fileStore.files) {
    if (file.mime_type?.startsWith('image/')) {
      const preview = await fileStore.getPreviewUrl(file.file_uuid, {
        loading: false,
      })

      file.thumbnailUrl = preview?.url || null
    }
  }
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

    <table class="file-table">
      <thead>
        <tr>
          <th>ファイル名</th>
          <th>MIME</th>
          <th>サイズ</th>
          <th>作成者</th>
          <th>作成日</th>
          <th>操作</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="file in fileStore.files"
          :key="file.file_uuid"
        >
          <td>{{ file.original_name }}</td>
          <td>{{ file.mime_type }}</td>
          <td>{{ formatSize(file.file_size) }}</td>
          <td>{{ file.created_by }}</td>
          <td>{{ file.created_at }}</td>
          <td>
            <button @click="preview(file.file_uuid)">
              表示
            </button>

            <button @click="download(file.file_uuid)">
              DL
            </button>

            <button @click="remove(file.file_uuid)">
              削除
            </button>
          </td>
        </tr>

        <tr v-if="fileStore.files.length === 0">
          <td colspan="6">
            ファイルがありません。
          </td>
        </tr>
      </tbody>
    </table>
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
