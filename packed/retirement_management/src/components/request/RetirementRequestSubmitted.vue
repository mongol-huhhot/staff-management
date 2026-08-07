<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import RetirementRequestForm from '@/components/request/RetirementRequestForm.vue'

const emit = defineEmits(['edit'])

const dataStore = useDataStore()

const myRequest = computed(() => dataStore.states.myRequest)

// 退職願書参照 dialog
const viewOpen = ref(false)

const handleViewRequest = () => {
    viewOpen.value = true
}

// TODO: 資料確認 (離職資料ダウンロード) は S3 連携後に実装
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
          提出済み{{ myRequest?.requested_at ? `（${myRequest.requested_at}）` : '' }}
        </v-chip>
      </div>
    </v-card-title>

    <v-card-text>
      <div class="mb-4">
        <div>・源泉徴収票、離職票、資格喪失証明書はこのページから出力下さい。</div>
        <div>・データ保存期間は退職後3年間です。必要に応じてログインし、ダウンロードしてください。</div>
        <div>注）保険証の返却がないと喪失手続きができかねますので退職後は早急に労務Gに返却してください</div>
      </div>

      <div class="d-flex justify-center mb-4">
        <v-btn
          color="primary"
          @click="emit('edit')"
        >
          再編集
        </v-btn>
      </div>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-card
            variant="outlined"
            hover
            class="d-flex align-center justify-center pa-8"
            min-height="130"
            @click="handleViewRequest"
          >
            <b>退職願書参照</b>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card
            variant="outlined"
            disabled
            class="d-flex align-center justify-center pa-8"
            min-height="130"
          >
            離職資料準備中
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card
            variant="outlined"
            hover
            class="d-flex align-center justify-center pa-8"
            min-height="130"
            @click="handleCheckDocuments"
          >
            <b>資料確認</b>
          </v-card>
        </v-col>
      </v-row>
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
            <RetirementRequestForm
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
</style>
