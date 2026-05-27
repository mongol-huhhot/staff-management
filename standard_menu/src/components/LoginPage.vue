<script setup>
import LoginLogoutSlot from '@/components/slots/LoginLogoutSlot.vue';
import { ref, } from 'vue';
import LangaugeSwitcher from '@/components/LanguageSwitcher.vue';
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from 'qrcode.vue'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import AssitantTools from '@/components/AssitantTools.vue';

const configStore = useAppConfigStore()
configStore.loadFromWindow()

// Form and state references
const valid = ref(false);
const showPassword = ref(false);
const isLoggedIn = ref(false);

const message = ref(null);

// Emit event to parent
const emit = defineEmits(['login-success', 'logout-success']);

// Form data
const formData = ref({
  user: '',
  password: '',
  rememberMe: localStorage.getItem('token') || sessionStorage.getItem('token')?true:false,
});

// Validation rules
const rules = {
  required: (value) => !!value || '必須',
};

// Toggle password visibility
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Forgot password handler
const forgotPassword = () => {
  let tid = window.location.pathname.split('/').filter(Boolean)[0]

  // If no tid and on localhost, set to default
  if (!tid && location.hostname === 'localhost') {
      tid = 'janga_vue_base_system';
  }

  const url = `/${tid}/password_forget_v2.php`; 
  
  // Opens a new tab
  window.open(url, "_blank", "noopener,noreferrer");
  // alert('Redirecting to forgot password page...');
};

function handleLoginSuccess(response) {
  isLoggedIn.value = true;
  // Forward both login status and user data to the parent
  console.log("handleLoginSuccess(response)====", response)
  emit('login-success', { isLoggedIn: isLoggedIn.value, user: response });
}

function handleLogoutSuccess() {
  isLoggedIn.value = false;
  formData.value.user = '';
  formData.value.password = '';
  emit('logout-success', { isLoggedIn: isLoggedIn.value, user: null });
}

// const youtubeUri = 'https://www.youtube.com/embed/AvgAsJOepMs'

// const handleVideoError = () => {
//   console.error('Failed to load YouTube video')
// }

//error message
function LoginError(err){
  if(!err)return message.value = null;
  let str = String(err).split(':')[1]
  console.log('mess---',str)
  message.value = str
}

const loginForm = ref(null)
const props = defineProps({
  logoSrc:      String,
  logoWidth:    Number,
  logoHeight:   Number
})

const logo = {
  src   : props.logoSrc   || 'surupas-sms.png',
  width : props.logoWidth || 140,
  height: props.logoHeight|| 40
}

const registerUserURI = computed(() => {
  // Replace with your desired URLAdd commentMore actions
  // let tid = window.location.pathname.split('/').filter(Boolean)[0]

  // // If no tid and on localhost, set to default
  // if (!tid && location.hostname === 'localhost') {
  //     tid = 'janga_vue_base_system';
  // }

  // const url = `/${tid}/entrance/user_register/`; 
  return `${window.location.href}/user_register/`;
})

function openNewTab() {
  // Opens a new tab
  window.location.href = registerUserURI.value;
  // window.open(registerUserURI.value, "_blank", "ユーザ登録");
}

// const userRegisterEnabled = ref(false)

// onMounted(() => {
//   if (window?.appConfig?.user_register) {
//     userRegisterEnabled.value = true
//   }
// })

const currentURI = ref(window?.location?.href)

</script>

<template  >
  <LoginLogoutSlot
    :userInfo="formData"
    :sqlTags="{ login: 'login', logout: 'ADMIN_LOGOUT_SQL_TAG' }"
    @login-success="handleLoginSuccess"
    @logout-success="handleLogoutSuccess"
    @login-error="LoginError"
  >
    <template #default="{ login, userInfo, loading }">
      <!-- Updated container with responsive grid -->
      <v-container class="d-flex  justify-center pa-0" style="width: 100%; max-width: 1000px; margin: 40px auto; height: auto;">
        <v-row class="w-100" no-gutters style="border: 1px solid #00B9EF; " gup>
          <!-- Login Form Column -->
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column align-start justify-start px-0 pt-0 blue-grey-lighten-5"
            style="position: relative;"
          >
            <v-img
              :src="logo.src"
              :width="logo.width"
              :height="logo.height"
              style="position: absolute; top: 16px; left: 16px; z-index: 10;"
            />
            <div style="margin-top: 60px; width:100%; padding: 0 10px;">
                <v-card-title class="text-h5 text-center font-weight-medium mb-3" style="color: #00B9ef;">
                  <!-- SURUPAs&nbsp;ログイン -->
                  {{ $t("login.surupasTitle") }}
                  <h1>{{ $t('common.welcome') }}</h1>
                  <LangaugeSwitcher></LangaugeSwitcher>
                </v-card-title>
                <v-card-text>
                  <v-form ref="loginForm" v-model="valid" @keydown.enter.prevent="login">
                    <!-- Email/Username 
                      ログインID
                    -->
                    <v-text-field
                      :label="$t('login.loginId')"
                      v-model="formData.user"
                      :rules="[rules.required]"
                      required
                    ></v-text-field>
                    <!-- Password 
                      パスワード
                    -->
                    <v-text-field
                      :label="$t('login.loginPassword')"
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append="togglePassword"
                      :rules="[rules.required]"
                      required
                      class="mb-0"     
                      hide-details     
                      dense             
                    ></v-text-field>
                    <div class="d-flex align-center justify-space-between ">
                      <v-checkbox
                        label="Remember Me"
                        v-model="formData.rememberMe"
                        hide-details
                        dense
                      ></v-checkbox>
                      <v-btn text
                        @click="forgotPassword"
                        style="color: #00B9EF; box-shadow: none; border: none;"
                      >
                        {{ $t("login.forgetPassword") }}
                        <!-- パスワード忘れ? -->
                      </v-btn>
                    </div>

                    <div class="d-flex align-center justify-space-between mt-2 justify-center">
                      <!-- スマートフォーンからのアクセス方 -->
                      {{ $t("login.whileSmartPhoneQR") }}
                      <QrcodeVue :value="currentURI" :size="80" />
                    </div>
                  </v-form>
                </v-card-text>
                <v-card-actions class="d-flex flex-column">
                  <v-btn
                    :disabled="!valid"
                    size="large"
                    @click="login"
                    class="white--text rounded-pill"
                    style="background-color: #00B9ef !important; text-transform: none; border: 1px solid #00B9ef !important; width: 100%;width: 500px;opacity: 1 !important; "
                  >
                    <!-- login -->
                    {{ $t("login.loginBtn") }}
                  </v-btn>

                  <div class="d-flex align-center justify-space-between mt-2 justify-center" v-if="configStore?.user_register">
                    <QrcodeVue :value="registerUserURI" :size="100" />
                    <v-btn
                      size="large"
                      type="text"
                      @click="openNewTab"
                      style="color: #00B9ef; margin-top: 10px;"
                    >
                      <!-- 新規登録 -->
                      {{ $t("login.registerUserBtn") }}
                    </v-btn>
                  </div>
                </v-card-actions>
                <AssitantTools></AssitantTools>
            </div>
          </v-col>

          <!-- YouTube Video Column -->
          <v-col
            cols="12"
            md="6"
            class="blue-gradient"
          >
            <iframe
              src="JangaAdvertisement.html"
              style="width: 100%; height: 100%; min-height: 670px; border: none;"
            ></iframe>
          </v-col>
        </v-row>
     </v-container>
    </template>
    </LoginLogoutSlot>
</template>

<style scoped>
  .blue-gradient {
    background: linear-gradient(135deg, rgba(0, 185, 239, 0.85), rgba(0, 100, 255, 0.85)), 
                url('/diamond-upholstery.png');
    backdrop-filter: blur(6px);
    background-blend-mode: overlay;
    color: white;
  }
</style>
