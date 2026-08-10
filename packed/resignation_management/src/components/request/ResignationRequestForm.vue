<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import { showSnackbar } from '@/utils/SnackBar.vue'

const props = defineProps({
    initial: {
        type: Object,
        default: null,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    embedded: {
        type: Boolean,
        default: false,
    },
    extraParams: {
        type: Object,
        default: () => ({}),
    },
})

const emit = defineEmits(['submitted'])

const dataStore = useDataStore()

const formRef = ref(null)

const form = reactive({
    resignation_date: '',
    phone: '',
    postal_code: '',
    prefecture: '',
    city: '',
    town: '',
    address_line1: '',     // 番地
    address_line2: '',     // 建物名・部屋番号
    doc_gensen: null,      // 源泉徴収票 要/不要
    doc_rishoku: null,     // 離職票 要/不要
    doc_shikaku: null,     // 資格喪失証明書 要/不要
    reason: '',
})

const receiveItems = ['要', '不要']

//TODO:テスト用のため
const prefectureItems = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
]

const requiredRule = [(v) => !!v || '必須項目です']

// 退職日は本日以降のみ
const todayStr = () => {
    const d = new Date()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
}

const resignationDateRules = [
    (v) => !!v || '必須項目です',
    (v) => !v || toDateString(v) >= todayStr() || '本日以降の日付を選択してください',
]

const toDate = (value) => {
    if (!value) return null
    if (value instanceof Date) return value
    const d = new Date(String(value).replace(/\//g, '-') + 'T00:00:00')
    return isNaN(d.getTime()) ? null : d
}

const toDateString = (value) => {
    if (!value) return ''
    if (value instanceof Date) {
        const yyyy = value.getFullYear()
        const mm = String(value.getMonth() + 1).padStart(2, '0')
        const dd = String(value.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }
    return String(value).replace(/\//g, '-').slice(0, 10)
}

onMounted(() => {
    if (!props.initial) return
    for (const key of Object.keys(form)) {
        if (props.initial[key] != null) form[key] = props.initial[key]
    }
})

const handleSubmit = async () => {
    const { valid } = await formRef.value.validate()

    if (!valid) {
        showSnackbar('必須項目を入力してください。', 'warning')
        return
    }

    const ok = await dataStore.save_resignation_request({
        ...form,
        ...props.extraParams,
    })

    if (ok) {
        showSnackbar('退職願を提出しました。', 'success')
        emit('submitted')
    }
}
</script>

<template>
  <v-card
    class="container-card"
    :variant="embedded ? 'flat' : 'outlined'"
  >
    <template v-if="!embedded">
      <v-card-title class="card-header">
        <span class="form-title">退職願</span>
      </v-card-title>

      <v-divider />
    </template>

    <v-card-text :class="embedded ? 'pa-0' : 'pa-2 pa-sm-4'">
      <div class="form-notes">
        <div>・源泉徴収票、離職票、資格喪失証明書はこのページから出力下さい。</div>
        <div>・データ保存期間は退職後3年間です。必要に応じてログインし、ダウンロードしてください。</div>
        <div>注）保険証の返却がないと喪失手続きができかねますので退職後は早急に労務Gに返却してください</div>
      </div>

      <v-form ref="formRef">
        <!-- 基本情報 -->
        <v-card variant="outlined" class="section-card">
          <v-card-title class="text-subtitle-1">
            基本情報
          </v-card-title>

          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6" md="4">
                <v-date-input
                  :model-value="toDate(form.resignation_date)"
                  :readonly="readonly"
                  label="退職日（必須）"
                  :rules="resignationDateRules"
                  :min="todayStr()"
                  density="compact"
                  prepend-icon=""
                  prepend-inner-icon="$calendar"
                  @update:model-value="v => form.resignation_date = toDateString(v)"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="form.phone"
                  :readonly="readonly"
                  label="退職後連絡先電話番号"
                  placeholder="090-1234-5678"
                  maxlength="13"
                  density="compact"
                />
              </v-col>

            </v-row>

            <h4 class="sub-heading">退職後住所</h4>

            <v-row dense>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="form.postal_code"
                  :readonly="readonly"
                  label="郵便番号"
                  placeholder="123-4567"
                  maxlength="8"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="form.prefecture"
                  :readonly="readonly"
                  :items="prefectureItems"
                  label="都道府県"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="form.city"
                  :readonly="readonly"
                  label="市区町村"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="form.town"
                  :readonly="readonly"
                  label="町域"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="form.address_line1"
                  :readonly="readonly"
                  label="番地"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="form.address_line2"
                  :readonly="readonly"
                  label="建物名・部屋番号"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 必要書類受領 -->
        <v-card variant="outlined" class="section-card">
          <v-card-title class="text-subtitle-1">
            必要書類受領
          </v-card-title>

          <v-card-text>
            <div class="form-notes">
              <div>■ご自身で出力・印刷の場合は、「不要」を選択してください。</div>
              <div>■紙での送付をご希望の場合は、「要」を選択してください。</div>
              <div>※発送までにお時間をいただく場合がございますので、お急ぎの方はご自身での出力をお願いいたします。</div>
            </div>

            <v-row dense>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="form.doc_gensen"
                  :readonly="readonly"
                  :items="receiveItems"
                  label="源泉徴収票（必須）"
                  :rules="requiredRule"
                  hint="（目安は最終支給日から2週間以内）"
                  persistent-hint
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="form.doc_rishoku"
                  :readonly="readonly"
                  :items="receiveItems"
                  label="離職票（必須）"
                  :rules="requiredRule"
                  hint="（雇用保険加入の方 目安は最終支給日から2週間以内、ハローワーク認定後に掲載いたします）"
                  persistent-hint
                  density="compact"
                />
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-select
                  v-model="form.doc_shikaku"
                  :readonly="readonly"
                  :items="receiveItems"
                  label="資格喪失証明書（必須）"
                  :rules="requiredRule"
                  hint="（社会保険加入の方 提出先の都合で原本の提出が必要な場合は、労務Gまでご連絡ください）"
                  persistent-hint
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 退職理由 -->
        <v-card variant="outlined" class="section-card">
          <v-card-title class="text-subtitle-1">
            退職理由
          </v-card-title>

          <v-card-text>
            <v-row dense>
              <v-col cols="12">
                <v-textarea
                  v-model="form.reason"
                  :readonly="readonly"
                  label="退職理由（本人記載・必須）"
                  :rules="requiredRule"
                  rows="3"
                  auto-grow
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-form>

      <v-row v-if="!readonly">
        <v-col cols="12" class="text-right">
          <v-btn
            color="primary"
            @click="handleSubmit"
          >
            提出
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.container-card {
  height: auto;
  margin: 0;
  min-height: 100%;
  background-color: #fff;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  font-size: 1.25em;
  font-weight: bold;
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

.sub-heading {
  margin: 4px 0 8px;
  font-size: 0.95em;
  color: #333;
}
</style>
