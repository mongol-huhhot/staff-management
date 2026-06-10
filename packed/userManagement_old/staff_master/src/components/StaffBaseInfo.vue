<script setup>
import { computed, } from 'vue'
import DiffTextField from '@/components/DiffTextField.vue'
import DiffSelect from './DiffSelect.vue'
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue'
import WrapperImageDisplay from "@/components/WrapperImageDisplay.vue";
import LookupTable from './LookupTable/lookupTable.vue';

// === PROPS ===
// This component is used to display and edit staff base information.
// It includes personal information, current address, residence address, and household information.
// It also allows for email updates and user selection.
// It emits events for updating the model value, saving the email, and handling post code inputs. 
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  diffData: {
    type: Object,
    default: () => ({})
  },
  rules: {
    type: Object,
    required: true
  },
  isNew: {
    type: String,
    default: "false",
  }
})

const emit = defineEmits(['update:modelValue', 'save-mail', 'current-post-code-input', 'residence-post-code-input'])

// === LOCAL DATA ===
const localStaffData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// === ACTIONS ===
const dialogVisible = ref(false)

function equalCurrent() {
  // Create a new object instead of mutating
  localStaffData.value = {
    ...JSON.parse(JSON.stringify(localStaffData.value)),
    residence_post_code: localStaffData.value.current_post_code,
    residence_address_1: localStaffData.value.current_address_1,
    residence_address_2: localStaffData.value.current_address_2,
    residence_address_3: localStaffData.value.current_address_3,
    residence_address_4: localStaffData.value.current_address_4,
    residence_address_kana: localStaffData.value.current_address_kana
  }
}

function onCurrentPostCodeInput(value) {
  emit('current-post-code-input', value)
}

function onResidencePostCodeInput(value) {
  emit('residence-post-code-input', value)
}

const dentisyDef = 'compact'

function sameWithAbove() {
  localStaffData.value.business_family_name = localStaffData.value.family_name
  localStaffData.value.business_given_name = localStaffData.value.given_name

}

function openDialog() {
  dialogVisible.value = true
}

const listRef = ref(null)
const userDialogVisible = ref(false)
const currentStatus = ref(false)
const selectedRowData = ref([])

const rowSelected = (row) => {
  if(currentStatus.value) {
    showSnackbar('新規作成データを保存してないです。','error')
    return 
  }

  selectedRowData.value = {}
  console.log("MainEntrance: rowSelected :::::: Data saved event received:", row);
  console.log("row=====", row)

  localStaffData.value.user_id = row.userid
  localStaffData.value.user_full_name = row.fullname
  localStaffData.value.email = row.email

  console.log("localStaffData.value===", localStaffData.value)
  
  selectedRowData.value = {...row}

  userDialogVisible.value = false;
}

const genders = [
  { title: '男', value: 'Male' },
  { title: '女', value: 'Female' },
  { title: '無回答', value: 'Unkown' }
]

// const nationalities = [
//   { title: '日本人', value: 'Japanese' },
//   { title: '外国人', value: 'Expatriate' }
// ]

</script>

<template>
  <v-form>
    <v-row justify="center">
      <v-col cols="12" md="12" class="d-flex flex-column align-center text-center" v-if="!props.isNew || localStaffData?.staff_code">
        <WrapperImageDisplay :imageId="localStaffData?.staff_code" width="150" height="150"/>
      </v-col>
      <v-col cols="12" md="12" class="d-flex flex-column align-center text-center">
        <div style="display: inline;" class="text-subtitle-1">
          <div v-if="localStaffData?.user_id">現在ユーザ:{{localStaffData.user_id}}:{{localStaffData.user_full_name}}({{localStaffData.email}})</div>
          <v-btn color="secondary" class="ml-4" @click="userDialogVisible = true" v-if="props.isNew==='true'">ユーザ選択</v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" md="3">
        <LookupTable
          identify_code="nationalities"
          :params="{}"
          v-model="localStaffData.is_foreigner"
          label="国籍区分"
          :density="dentisyDef"
          :creatable="false"
          :returnObject="false"
          :original="diffData?.is_foreigner"
        />
      </v-col>
      <v-col cols="6" md="3">
        <div class="pa-4 text-center" style="margin-top: 10px;">
          <v-btn
            class="text-none font-weight-regular"
            text="メールアドレス更新"
            color="info"
            @click="openDialog"
          ></v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Personal Info -->
     <v-row>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.staff_code" :original="diffData?.staff_code" label="スタッフコード" :density="dentisyDef" />
      </v-col>
      <v-col cols="6" md="3"></v-col>
      <v-col cols="6" md="3"></v-col>
     </v-row>
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.family_name" :original="diffData?.family_name" label="姓" :density="dentisyDef" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.given_name" :original="diffData?.given_name" label="名" :density="dentisyDef" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.family_name_kana" :original="diffData?.family_name_kana" label="姓カナ" :density="dentisyDef" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.given_name_kana" :original="diffData?.given_name_kana" label="名カナ" :density="dentisyDef" />
      </v-col>
    </v-row>

    <!-- Business & Old Names -->
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.business_family_name" label="ビジネスネーム姓" :density="dentisyDef" :original="diffData?.business_family_name" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.business_given_name" label="ビジネスネーム名" :density="dentisyDef" :original="diffData?.business_given_name" />
      </v-col>
      <v-col cols="6" md="3">
        <v-btn class="text-none font-weight-regular"
          text="上記と同じ"
          color="info"
          style="margin-top: 18px;"
          @click="sameWithAbove"
           />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.old_family_name" label="旧姓" :density="dentisyDef" :original="diffData?.old_family_name" />
      </v-col>
    </v-row>

    <!-- DOB / Gender / Email -->
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.birthday" label="生年月日" type="tel" :density="dentisyDef" :original="diffData?.birthday" :is-date="true" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffSelect
          v-model="localStaffData.gender"
          label="性別"
          :items="genders"
          :density="dentisyDef"
          :original="diffData?.gender"
        />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.pc_mail" label="メールアドレス" type="email" :density="dentisyDef" :disabled="true" :original="diffData?.pc_mail" />
      </v-col>
    </v-row>

    <!-- Current Address -->
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.current_post_code" label="郵便番号" type="tel" message="数字のみ" :density="dentisyDef" :original="diffData?.current_post_code" @input="onCurrentPostCodeInput" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.current_address_1" label="都道府県" :density="dentisyDef" :original="diffData?.current_address_1" />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.current_address_2" label="市区町村" :density="dentisyDef" :original="diffData?.current_address_2" />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.current_address_3" label="丁目番地" :density="dentisyDef" :original="diffData?.current_address_3" />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.current_address_4" label="建物名・部屋番号" :density="dentisyDef" :original="diffData?.current_address_4" />
      </v-col>
      <v-col cols="12" md="9">
        <DiffTextField v-model="localStaffData.current_address_kana" label="住所カナ" :density="dentisyDef" :original="diffData?.current_address_kana" />
      </v-col>
    </v-row>

    <!-- Household Info -->
    <v-row>
      <v-col cols="6" md="3">
        <DynamicSelectBoxDiff
          v-model="localStaffData.household_relationship"
          label="世帯主続柄"
          :density="dentisyDef"
          :original="diffData.household_relationship"
          sql-tag="get_relation_ship_all"
        />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.household_name" label="世帯主名" :density="dentisyDef" :original="diffData.household_name" />
      </v-col>
    </v-row>

    <!-- Copy Button -->
    <v-row style="padding-top: 20px;">
      <v-btn @click="equalCurrent">現住所から住民票住所にコピー</v-btn>
    </v-row>

    <!-- Residence Address -->
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.residence_post_code" label="住民票郵便番号" type="tel" message="数字のみ" :density="dentisyDef" 
          :original="diffData.residence_post_code" @input="onResidencePostCodeInput" />
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField v-model="localStaffData.residence_address_1" label="都道府県" :density="dentisyDef" :original="diffData.residence_address_1" />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.residence_address_2" label="市区町村" :density="dentisyDef" :original="diffData.residence_address_2" />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.residence_address_3" label="丁目番地" :density="dentisyDef" :original="diffData.residence_address_3" />
      </v-col>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.residence_address_4" label="建物名・部屋番号" :density="dentisyDef" :original="diffData.residence_address_4" />
      </v-col>
      <v-col cols="12" md="9">
        <DiffTextField v-model="localStaffData.residence_address_kana" label="住所カナ" :density="dentisyDef" :original="diffData.residence_address_kana" />
      </v-col>
    </v-row>

    <!-- Phone -->
    <v-row>
      <v-col cols="12" md="3">
        <DiffTextField v-model="localStaffData.tel_no" label="電話番号" :density="dentisyDef" type="tel" :original="diffData.tel_no" />
      </v-col>
    </v-row>
    <!-- {{ dialogVisible }} -->

    <!-- Dialog -->
    <v-dialog
        v-model="dialogVisible"
        max-width="600"
    >
        <v-card title="メールアドレス更新">
        <v-card-text>
            <v-row dense>
            <v-col cols="12">
                <DiffTextField
                  v-model="localStaffData.update_pc_mail"
                  label="更新するメールアドレス"
                  type="email"
                  :density="dentisyDef"
                  :rules="[rules.email]"
                  :original="diffData.update_pc_mail"
                />
            </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn text="閉じる" variant="plain" @click="dialogVisible = false" />
            <v-btn color="primary" text="保存" variant="plain" @click="$emit('save-mail')" />
        </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog
      v-model="userDialogVisible"
      max-width="1000"
    >
        <v-card title="ユーザ選択（ダブルクリックして選択）">
        <v-card-text>
          <UserList ref="listRef" @row-selected="rowSelected"></UserList>
        </v-card-text>
        <v-card-actions>
          <v-btn text="閉じる" variant="plain" @click="userDialogVisible = false" />
        </v-card-actions>
        </v-card>
    </v-dialog>

  </v-form>
</template>

<style scoped>
.diffColor .v-input__control{
    background-color: yellow;
}

[class^="v-col-"] {
    padding-top: 0;
    padding-bottom: 0;
}

.v-input__details{
    padding-top: 0;
    height: 0;
    display: none;
}
</style>
