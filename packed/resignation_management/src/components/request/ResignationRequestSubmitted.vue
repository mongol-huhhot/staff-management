<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { formatDateTime } from '@/utils/TimeUtils'
import ResignationRequestForm from '@/components/request/ResignationRequestForm.vue'

const emit = defineEmits(['edit'])

const dataStore = useDataStore()

const myRequest = computed(() => dataStore.states.myRequest)

const requestedAtLabel = computed(() => formatDateTime(myRequest.value?.requested_at))

// 退職願書参照 dialog
const viewOpen = ref(false)

const handleViewRequest = () => {
    viewOpen.value = true
}

const handleCheckDocuments = () => {}
</script>

<template>
  <v-card class="card_box">
    <v-card-title>
      <div class="d-flex align-center flex-wrap ga-3">
        <h4>
          退職願
        </h4>

        <v-chip
          color="primary"
          variant="flat"
          size="small"
        >
          提出済み{{ requestedAtLabel ? `（${requestedAtLabel}）` : '' }}
        </v-chip>

        <v-spacer />

        <v-btn
          prepend-icon="mdi-pencil"
          variant="tonal"
          color="primary"
          @click="emit('edit')"
        >
          再編集
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
      >
        退職願は提出済みです。内容を修正する場合は右上の「再編集」から行ってください。
      </v-alert>

      <v-card variant="outlined" class="section-card">
        <v-card-title class="text-subtitle-1">
          書類・資料
        </v-card-title>

        <v-card-text>
          <div class="form-notes">
            <div>・源泉徴収票、離職票、資格喪失証明書はこのページから出力下さい。</div>
            <div>・データ保存期間は退職後3年間です。必要に応じてログインし、ダウンロードしてください。</div>
            <div>注）保険証の返却がないと喪失手続きができかねますので退職後は早急に労務Gに返却してください</div>
          </div>

          <v-list density="comfortable">
            <v-list-item class="doc-item" @click="handleViewRequest">
              <template #prepend>
                <v-icon color="primary">mdi-file-document-outline</v-icon>
              </template>

              <template #title>
                退職願書参照
              </template>

              <template #subtitle>
                提出した退職願の内容を確認できます
              </template>

              <template #append>
                <v-btn
                  size="small"
                  rounded
                  variant="tonal"
                  color="primary"
                  @click.stop="handleViewRequest"
                >
                  参照
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item class="doc-item">
              <template #prepend>
                <v-icon color="grey">mdi-folder-download-outline</v-icon>
              </template>

              <template #title>
                資料確認（源泉徴収票・離職票・資格喪失証明書）
              </template>

              <template #subtitle>
                データの準備ができ次第、こちらからダウンロードできます
              </template>

              <template #append>
                <v-chip size="small" variant="tonal" color="warning" class="mr-2">
                  準備中
                </v-chip>

                <v-btn
                  size="small"
                  rounded
                  variant="tonal"
                  color="primary"
                  disabled
                  @click.stop="handleCheckDocuments"
                >
                  資料確認
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
      <v-dialog
        v-model="viewOpen"
        max-width="900"
        scrollable
      >
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>退職願（提出内容）</span>

            <v-btn
              icon="mdi-close"
              variant="text"
              @click="viewOpen = false"
            />
          </v-card-title>

          <v-divider />

          <v-card-text>
            <ResignationRequestForm
              :initial="myRequest"
              readonly
              embedded
            />
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<style scoped>
h4 {
  padding: 0;
  margin: 8px 20px 0 0 !important;
}

.section-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

.form-notes {
  font-size: 0.9em;
  color: #555;
  line-height: 1.7;
  margin-bottom: 16px;
}

.doc-item {
  border-bottom: 1px solid #eeeeee;
  min-height: 66px;
}

.doc-item:last-child {
  border-bottom: none;
}
</style>
