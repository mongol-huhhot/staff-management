<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDbStore } from '@/stores/useDbStore'
import { useAppConfigStore } from '@/stores/AppConfigStore'

import LangaugeSwitcher from '@/components/LanguageSwitcher.vue'
import QrcodeVue from 'qrcode.vue'
import AssitantTools from '@/components/AssitantTools.vue'

const emit = defineEmits(['login-success', 'logout-success'])

const props = defineProps({
  logoSrc: String,
  logoWidth: Number,
  logoHeight: Number,
})

const dbStore = useDbStore()
const configStore = useAppConfigStore()
configStore.loadFromWindow()

const valid = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const message = ref(null)
const loginForm = ref(null)

const formData = ref({
  user: '',
  password: '',
  rememberMe: !!(
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')
  ),
})

const rules = {
  required: v => !!v || '必須',
}

const logo = {
  src: props.logoSrc || 'surupas-sms.png',
  width: props.logoWidth || 140,
  height: props.logoHeight || 40,
}

const tid = computed(() => {
  const pathTid = window.location.pathname.split('/').filter(Boolean)[0]

  if (!pathTid && location.hostname === 'localhost') {
    return 'premier'
  }

  return pathTid || 'premier'
})

const currentURI = ref(window.location.href)

const baseEntranceUrl = computed(() => {
  return `/${tid.value}/entrance`
})

const registerUserURI = computed(() => {
  return `${baseEntranceUrl.value}/user_register/`
})

const forgotPasswordURI = computed(() => {
  return `/${tid.value}/password_forget_v2.php`
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const forgotPassword = () => {
  window.open(forgotPasswordURI.value, '_blank', 'noopener,noreferrer')
}

const openNewTab = () => {
  window.location.href = registerUserURI.value
}

const setToken = token => {
  if (!token) return

  if (formData.value.rememberMe) {
    localStorage.setItem('token', token)
    sessionStorage.removeItem('token')
  } else {
    sessionStorage.setItem('token', token)
    localStorage.removeItem('token')
  }
}

const clearToken = () => {
  localStorage.removeItem('token')
  sessionStorage.removeItem('token')
}

const login = async () => {
  message.value = null

  const result = await loginForm.value?.validate()
  if (!result?.valid) return

  loading.value = true

  try {
    const res = await dbStore.login(
      'authenticate.login',
      {
        user: formData.value.user,
        password: formData.value.password,
      },
      {
        persist: formData.value.rememberMe,
        loading: true,
      }
    )
    console.log('Login response:', res)

    if (!res?.ok) {
      throw new Error(res?.message || 'ログインに失敗しました')
    }

    const token =
      res?.token ||
      res?.result?.token ||
      res?.result?.[0]?.token

    setToken(token)

    emit('login-success', {
      isLoggedIn: true,
      user: res?.user || res,
    })
  } catch (err) {
    message.value = err?.message || 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  clearToken()

  emit('logout-success', {
    isLoggedIn: false,
    user: null,
  })
}

onMounted(async () => {
  const token =
    localStorage.getItem('token') ||
    sessionStorage.getItem('token')

  if (!token) return

  try {

    const res = await dbStore.verify()
    console.log('Token verification response:', res)
    
    if (res?.code === 0) {
      emit('login-success', {
        isLoggedIn: true,
        user: res?.result || res,
      })
    } else {
      clearToken()
    }
  } catch {
    clearToken()
  }
})
</script>

<template>
  <v-container
    class="d-flex justify-center pa-0"
    style="width:100%; max-width:1000px; margin:40px auto;"
  >
    <v-row
      class="w-100"
      no-gutters
      style="border:1px solid #00B9EF;"
    >
      <v-col
        cols="12"
        md="6"
        class="d-flex flex-column align-start justify-start px-0 pt-0 blue-grey-lighten-5"
        style="position:relative;"
      >
        <v-img
          :src="logo.src"
          :width="logo.width"
          :height="logo.height"
          style="position:absolute; top:16px; left:16px; z-index:10;"
        />

        <div style="margin-top:60px; width:100%; padding:0 10px;">
          <v-card-title
            class="text-h5 text-center font-weight-medium mb-3"
            style="color:#00B9ef;"
          >
            {{ $t('login.surupasTitle') }}
            <h1>{{ $t('common.welcome') }}</h1>
            <LangaugeSwitcher />
          </v-card-title>

          <v-alert
            v-if="message"
            type="error"
            variant="tonal"
            class="mb-3"
          >
            {{ message }}
          </v-alert>

          <v-card-text>
            <v-form
              ref="loginForm"
              v-model="valid"
              @keydown.enter.prevent="login"
            >
              <v-text-field
                v-model="formData.user"
                :label="$t('login.loginId')"
                :rules="[rules.required]"
                autocomplete="username"
                clearable
                required
              />

              <v-text-field
                v-model="formData.password"
                :label="$t('login.loginPassword')"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :rules="[rules.required]"
                autocomplete="current-password"
                class="mb-0"
                hide-details
                required
                @click:append="togglePassword"
              />

              <div class="d-flex align-center justify-space-between">
                <v-checkbox
                  v-model="formData.rememberMe"
                  label="Remember Me"
                  hide-details
                  density="compact"
                />

                <v-btn
                  variant="text"
                  @click="forgotPassword"
                  style="color:#00B9EF;"
                >
                  {{ $t('login.forgetPassword') }}
                </v-btn>
              </div>

              <div class="d-flex align-center justify-center mt-2">
                <span class="mr-3">
                  {{ $t('login.whileSmartPhoneQR') }}
                </span>
                <QrcodeVue :value="currentURI" :size="80" />
              </div>
            </v-form>
          </v-card-text>

          <v-card-actions class="d-flex flex-column">
            <v-btn
              :disabled="!valid || loading"
              :loading="loading"
              size="large"
              class="white--text rounded-pill"
              style="background-color:#00B9ef !important; width:100%; max-width:500px;"
              @click="login"
            >
              {{ $t('login.loginBtn') }}
            </v-btn>

            <div
              v-if="configStore?.user_register"
              class="d-flex align-center justify-center mt-4"
            >
              <QrcodeVue :value="registerUserURI" :size="100" />

              <v-btn
                size="large"
                variant="text"
                @click="openNewTab"
                style="color:#00B9ef; margin-left:16px;"
              >
                {{ $t('login.registerUserBtn') }}
              </v-btn>
            </div>
          </v-card-actions>

          <AssitantTools />
        </div>
      </v-col>

      <v-col cols="12" md="6" class="blue-gradient">
        <iframe
          src="JangaAdvertisement.html"
          style="width:100%; height:100%; min-height:670px; border:none;"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.blue-gradient {
  background:
    linear-gradient(
      135deg,
      rgba(0, 185, 239, 0.85),
      rgba(0, 100, 255, 0.85)
    ),
    url('/diamond-upholstery.png');
  backdrop-filter: blur(6px);
  background-blend-mode: overlay;
  color: white;
}
</style>
