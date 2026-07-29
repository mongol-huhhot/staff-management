<script setup>
import { ref, watch, computed } from "vue";
import DataHandlingSlot from "@/components/slots/DataHandlingSlot.vue";
import { rules, userIdExists } from "@/utils/valitators";
import { useDataStore } from "@/stores/DataStore";
import ImageUploaderCropper from '@/components/ImageUploaderCropper.vue';
import MessageBox from '@/components/MessageBox.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { ja } from 'date-fns/locale';
import { useI18n } from 'vue-i18n';
import axios from "axios";
import { useAppConfigStore } from '@/stores/AppConfigStore';
import VerificationCodeSection from "@/components/VerificationCodeSection.vue";

const configStore = useAppConfigStore()
configStore.loadFromWindow()

// configStore?.depend

const { t } = useI18n();
const emit = defineEmits(["data-saved"]);
const dataStore = useDataStore();
const valid = ref(false);
const cropRef = ref(null);

const props = defineProps({
  data: { type: [Object, Array], required: true },
  actionType: { type: String, required: false, default: "" },
});

const showPassword = ref(false);
const userForm = ref(null);
const messageBox = ref(false);
const tooltipShow = ref(false);
const togglePassword = () => (showPassword.value = !showPassword.value);

// Verification logic
const codeSent = ref(false);
const codeVerified = ref(false);
const verificationCode = ref("");
const errorMessage = ref("");
const LOGIN_URI = "../"; // Set your login page here

const tenant_id = computed(() => {
  if (document.location.hostname !== "localhost") {
    const path = document.location.pathname;
    const paths = path.split("/");
    return paths[1];
  } 
  return 'janga_vue_base_system';
});

const sendCodeURI = computed(() =>
  tenant_id.value ? `/${tenant_id.value}/common/relayMailer/sendCode.php` : `${window.location.origin}/common/relayMailer/sendCode.php`
);

const verifyCodeURI = computed(() =>
  tenant_id.value ? `/${tenant_id.value}/common/relayMailer/verifyCode.php` : `${window.location.origin}/common/relayMailer/verifyCode.php`
);

async function sendCode(data) {
  errorMessage.value = "";
  if (!data.email) {
    errorMessage.value = "Please enter a valid email address.";
    return;
  }
  try {
    const response = await axios.post(sendCodeURI.value, {
      j: JSON.stringify({ mailaddress: data.email, name: data.content?.fullName }),
    });
    if (response.data.result === "ok") {
      codeSent.value = true;
      errorMessage.value = ""; // Clear error
    } else {
      errorMessage.value = response.data.message || "Failed to send verification code.";
    }
  } catch (error) {
    errorMessage.value = error.message || "An unexpected error occurred.";
  }
}

async function verifyCode(data) {
  errorMessage.value = "";
  if (!verificationCode.value) {
    errorMessage.value = "Please enter the verification code.";
    return;
  }
  try {
    const response = await axios.post(verifyCodeURI.value, {
      j: JSON.stringify({
        mailaddress: data.email,
        check_code: verificationCode.value,
      }),
    });
    if (response.data.result === "ok") {
      codeVerified.value = true;
      errorMessage.value = "";
    } else {
      errorMessage.value = response.data.message || "Invalid verification code.";
    }
  } catch (error) {
    errorMessage.value = error.message || "An unexpected error occurred.";
  }
}

function bubbleDataSaved(savedData) {
    messageBox.value = true;
  emit("data-saved", savedData);
}

const resetForm = (data) => {
    Object.keys(data).forEach((key) => {
        if (key !== 'content') data[key] = "";
        else data[key] = {};
    });
  userForm.value.resetValidation();
};

const imageMeta = ref(null);
const handleCropped = (data) => {
  imageMeta.value = data;
};

const userIdError = ref('');
const mailError = ref('');
async function checkUserIdMail(e) {
  userIdError.value = '';
  const valid = await userIdExists(e.target.value);
  return valid;
}
async function checkUserId(e) {
  const valid = await checkUserIdMail(e);
  if (!valid) {
    userIdError.value = t(`common.userIdExistError`, { userId: e.target.value });
  }
}
async function checkEmail(e) {
  mailError.value = '';
  const valid = await checkUserIdMail(e);
  if (!valid) {
    mailError.value = t(`common.emailExistError`, { email: e.target.value });
  }
}

async function saveAll(save, data) {
  data.content.password = data.password;
  // 
  data.content.signin = configStore.mail_confirm
  if(imageMeta.value) {
    data.content.thumbnail = { name: imageMeta.value.name, mime: imageMeta.value.mime, size: imageMeta.value.size, encode: 'base64' };
    data.draft_thumbnail_data = imageMeta.value.base64;
  } else {
    data.content.thumbnail = { name: '', mime: '', size: 0, encode: 'base64' };
    data.draft_thumbnail_data = null;
  }
  data.draft_status = 'pending';
  await save();

  if( configStore.mail_confirm)
    await sendCode(data);
}

function checkInput() {
  if (cropRef.value) cropRef.value.getCropped();
}

watch(() => imageMeta.value, () => {
  tooltipShow.value = !!imageMeta.value;
});

const genders = computed(() => [
  { label: t('common.genders.female'), value: 'female' },
  { label: t('common.genders.male'), value: 'male' },
  { label: t('common.genders.other'), value: 'other' }
]);
</script>


<template>
    <div>
      <DataHandlingSlot
        :data="props.data"
        :sqlTags="dataStore.sqlTags"
        v-slot="{ save, delete: deleteData, loading, data: slotData }"
        @data-saved="bubbleDataSaved"
      >
        <v-form ref="userForm" v-model="valid" >
          <v-row>
            <v-col cols="12" md="6">
              <!-- label="お名前" -->
              <v-text-field
                v-if="slotData.content"
                :label="t('common.fullName')"
                v-model="slotData.content.fullName"
                :rules="[rules.required]"
                required
                dense
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <!-- label="ユーザID" -->
              <v-text-field
                :label="t('common.userId')"
                v-model="slotData.userid"
                :rules="[rules.required]"
                :error="!!userIdError"
                :error-messages="userIdError"
                required
                @change="checkUserId"
                dense
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <!-- label="メール" -->
              <v-text-field
                :label="t('common.email')"
                v-model="slotData.email"
                :rules="[rules.required, rules.email]"
                required
                :error="!!mailError"
                :error-messages="mailError"
                @change="checkEmail"
                dense
                hide-details
              />
            </v-col>
            <v-col cols="12" md="6">
              <!-- label="パスワード" -->
              <v-text-field
                :label="t('common.password')"
                v-model="slotData.password"
                :type="showPassword ? 'text' : 'password'"
                :rules="[rules.required, rules.minLength(6)]"
                required
                append-icon="mdi-eye"
                @click:append="togglePassword"
                dense
                hide-details
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- label="性別" -->
              <v-autocomplete
                v-if="slotData.content"
                :label="t('common.gender')"
                v-model="slotData.content.gender"
                :items="genders"
                item-title="label"
                item-value="value"
                :rules="[rules.required]"
                dense
                hide-details
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- select-text="確定"
              cancel-text="キャンセル"
              placeholder="生年月日" -->
              <VueDatePicker v-model="slotData.content.bithday" 
                class="mt-2"
                :format-locale="ja"
                format="yyyy-MM-dd"
                :select-text="t('common.select-text')"
                :cancel-text="t('common.cancel-text')"
                :placeholder="t('common.placeholder')"
                style="margin: 0; padding: 0; width: 100%;"
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- label="住所" -->
              <v-textarea
                v-if="slotData.content"
                :label="t('common.address')"
                v-model="slotData.content.address"
                :rules="[rules.required]"
                dense
                hide-details
                :rows="2"
                auto-grow
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- width: { type: Number, default: 200 },
                height: { type: Number, default: 200 },
                label: { type: String, default: 'Upload or Take Photo' },
                returnType: { type: String, default: 'blob' }, // 'blob' or 'base64' -->
              <!-- label="顔写真"  -->
              <ImageUploaderCropper
                ref="cropRef" @cropped="handleCropped" 
                :label="t('common.faceImage')"
                returnType="base64"
                style="margin: 0; padding: 0;"
              />
            </v-col>

            <!-- <v-col cols="12" md="6">
              <v-radio-group
                v-if="data.content"
                v-model="data.content.gender"
                class="w-100"
                row
              >
                <v-radio label="男性" value="male" />
                <v-radio label="女性" value="female" />
                <v-radio label="その他" value="other" />
              </v-radio-group>
            </v-col> -->
          </v-row>
          <!-- <v-row>
            <v-col cols="12" md="6">
              <img :src="imageBlob" alt="Thumbnail" v-if="imageBlob"/>
            </v-col>
          </v-row> -->
          <v-row class="mb-2" align="center" justify="center">
             <!-- Button Group -->
            <v-col
              cols="12"
              md="8"
              class="d-flex flex-nowrap justify-center"
            >
              <v-btn
                :disabled="!valid || loading"
                size="large"
                color="primary"
                class="mx-2"
                @click="saveAll(save, slotData)"
              >
                <v-tooltip :disabled="tooltipShow" activator="parent" location="top">
                  <!-- 写真の範囲を確定されていない状態で申請されます -->
                  {{ $t('common.croppedImage') }}
                </v-tooltip>
                <!-- 登録 -->
                {{ $t('common.save') }}
              </v-btn>

              <v-btn
                color="success"
                size="large"
                class="mx-2"
                @click="resetForm(slotData)"
              >
                 <!-- リセット -->
                {{ $t('common.reset') }}
              </v-btn>

              <v-btn
                v-if="cropRef?.imageData"
                :disabled="loading"
                size="large"
                color="info"
                class="mx-2"
                @click="checkInput"
              >
                 <!-- 写真の範囲を確定 -->
                {{ $t('common.checkInput') }}
              </v-btn>
            </v-col>
          </v-row>
          <VerificationCodeSection
            v-if="configStore.mail_confirm"
            :email="slotData.email"
            :sendCode="() => sendCode(slotData)"
            :verifyCode="(code) => { verificationCode = code; verifyCode(slotData); }"
            :codeSent="codeSent"
            :codeVerified="codeVerified"
            :errorMessage="errorMessage"
            :rules="rules"
        />
        </v-form>
      </DataHandlingSlot>
      <MessageBox :openBox="messageBox"></MessageBox>
    </div>
</template>
