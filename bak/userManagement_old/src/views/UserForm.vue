<script setup>
import { ref, watch, onMounted} from "vue";
import { useDataStore } from "@/stores/DataStore";
import {rules, userIdExists, } from "@/utils/valitators";
import WrapperImageDisplay from "@/components/WrapperImageDisplay.vue";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { ja } from 'date-fns/locale';


const emit = defineEmits(["data-saved"]); // Define the event in the parent

const data = ref(null)

const componentName = import.meta.url
  .split('/') // Split the URL by '/'
  .pop() // Get the last part (file name with extension and query parameters)
  .split('?')[0] // Remove query parameters (everything after '?')
  .replace('.vue', ''); // Remove the .vue extension

console.log(componentName); // Outputs the file name without the .vue extension

const dataStore = useDataStore();
const valid = ref(false);
const loginCheckStatus = ref({
  icon:'',
  color:'',
  text:''
})

const props = defineProps({
  data: { type: [Object, Array], required: true },
  actionType: { type: String, required: false, default: "" },
});

const showPassword = ref(false);
// const checkPassword = ref('');
const userForm = ref(null); // Form reference

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

function bubbleDataSaved(savedData) {
    console.log("🔵 Bubbling data-saved event:", savedData);
    emit("data-saved", savedData); // Re-emit the event
}

const resetForm = (data) => {
  data = null
};

const userIdError = ref('')
const mailError = ref('')

async function checkUserIdMail(e) {
  
  console.log(e)
  const valid = await userIdExists(e.target.value)
  return valid 
}

async function checkUserId(e) {
  userIdError.value = null
  const valid = await checkUserIdMail(e)
  if (!valid) {
    userIdError.value = `このユーザIDは既に存在します`
  }
}

async function checkEmail(e) {
  mailError.value = null
  const valid = await checkUserIdMail(e)
  if (!valid) {
    mailError.value = `このメールアドレスは既に存在します`
  }
}

async function saveAll(save, data) {

  if(!data.password) data.password = data.save_password

  data.draft_status = 'approved'

  save()

  resetForm(data)
}

function loginCheck(data) {
  if(!data.draft_status)return loginCheckStatus.value = {icon:'mdi-alert-circle',color:'red',text:'ログインできません'}
  loginCheckStatus.value = data.draft_status=='approved'?{icon:'mdi-check-circle',color:'green',text:'ログインできます'}:{icon:'mdi-alert-circle',color:'red',text:'ログインできません'}
}

onMounted(async ()=>{
  loginCheck(props.data)

  try{
    await userForm.value.validate()
  }catch(mess){
    console.log(mess)
  }
})
watch(()=>props.data,async ()=>{
  loginCheck(props.data)
  
  try{
    await userForm.value.validate()
  }catch(mess){
    console.log(mess)
  }
})

const matched = ref(false)
function changeCheck(e) {
  if( !e.target.value || e.target.value === '')
    matched.value = false
  else
    matched.value = true
}

const gentles = [
  {label: '女性', value: 'female'},
  {label: '男性', value: 'male'},
  {label: 'その他', value: 'other'},
]

</script>

<template>
    <div>
      <!-- <DataHandlingSlot
        :data="props.data"
        :sqlTags="dataStore.sqlTags"
        v-slot="{ save, delete: deleteData, loading, data }"
        @data-saved="bubbleDataSaved"
      > -->
        <v-form ref="userForm" v-model="valid" class="pa-6">
          <v-row class="mb-2" align="center" justify="center">
            </v-row>
            <v-row class="mb-2" align="center" justify="center">
            <!-- Button Group -->
            <v-col cols="12" md="8" class="d-flex flex-wrap flex-md-nowrap justify-center justify-md-start">
              <v-btn
                :disabled="!valid || loading"
                size="large"
                color="primary"
                class="ma-2"
                @click="saveAll(save,data)"
              >
                {{ data.mode=="add"?"登録":data.draft_status=="approved"?"更新":"承認"}}
              </v-btn>
              <v-btn
                color="success"
                size="large"
                class="ma-2"
                @click="resetForm(data)"
              >
                リセット
              </v-btn>
              <v-btn
                :disabled="loading"
                size="large"
                color="error"
                class="ma-2"
                @click="deleteData"
              >
                削除
              </v-btn>
            </v-col>
          </v-row>
          <b>【注】： </b>
          <p class="ml-6 mb-2">
            ※ ユーザはスタッフコードと連携により、ログインしてサービスをご利用になります。
          </p>
          <p class="ml-6 mb-2">
            ※ この画面上ユーザに権限を与えて下さい（付与するロール選択して与えます）
          </p>
          <p class="ml-6 mb-2">
            ※ 権限が乱れないため、普段、ロールはプロバーダーが御社状況にあわせて管理します。
          </p>
          <p class="ml-6 mb-2">
            ※ 管理者がユーザ設定する場合、入力可能な項目で十分です。下部の入力不能な項目は本人が登録する時、本人特定するための項目です。
          </p>
          <v-row>
            <v-col cols="12" md="12" v-if="data.userid">
              <WrapperImageDisplay :imageId="data.userid" width="150" height="150"/>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="お名前"
                v-model="data.content.fullName"
                :rules="[rules.required]"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="ユーザID"
                v-model="data.userid"
                :rules="[rules.required]"
                required
                @change="checkUserId"
              />
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-body-1 mt-3 ml-1" v-if="matched">スタッフコード:  {{data.content.staff_code}}(突合済み)</div>
              <v-text-field v-else label="連携するスタッフコード（ユーザ・スタッフ突合）" 
                v-model="data.content.staff_code"
                @blur="changeCheck">
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="メール"
                v-model="data.email"
                :rules="[rules.required, rules.email]"
                required
                @change="checkEmail"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="パスワード：既存値確認不可が再設定可能"
                v-model="data.password"
                :type="showPassword ? 'text' : 'password'"
                append-icon="mdi-eye"
                @click:append="togglePassword"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                label="権限ロール"
                v-model="data.content.roles"
                :items="dataStore.data.get_role_list"
                item-title="label"
                item-value="value"
                :rules="[rules.required]"
                multiple
                chips
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-btn
                block
                :color="data.content.signin ? 'success' : 'error'"
                :prepend-icon="data.content.signin ? 'mdi-check' : 'mdi-block-helper'"
                @click="data.content.signin = !data.content.signin"
                class="justify-start"
              >
                {{ data.content.signin ? 'ログイン可' : 'ログイン不可' }}
              </v-btn>
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-if="data.content"
                :disabled="true"
                label="性別"
                v-model="data.content.gentle"
                :items="gentles"
                item-title="label"
                item-value="value"
              />
            </v-col>

            <v-col cols="12" md="6">
              <VueDatePicker v-model="data.content.bithday" 
                :disabled="true"
                class="mt-2"
                :format-locale="ja" 
                format="yyyy-MM-dd" 
                select-text="確定"
                cancel-text="キャンセル"
                placeholder="生年月日"
              ></VueDatePicker>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-if="data.content"
                :disabled="true"
                label="本人確認用住所"
                v-model="data.content.address"
              />
            </v-col>

          </v-row>
        </v-form>
      <!-- </DataHandlingSlot> -->
    </div>
</template>
<style>
label{
  text-wrap: nowrap !important;
}
</style>

