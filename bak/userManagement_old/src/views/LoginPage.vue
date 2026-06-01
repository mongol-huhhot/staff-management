<script setup>
import LoginLogoutSlot from '@/components/slots/LoginLogoutSlot.vue';
import { ref, } from 'vue';

// Form and state references
const valid = ref(false);
const showPassword = ref(false);
const isLoggedIn = ref(false);

// Emit event to parent
const emit = defineEmits(['loginStatus']);

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
  alert('Redirecting to forgot password page...');
};

// Handle login success
function handleLoginSuccess(response) {
  isLoggedIn.value = true;

  // Emit login status
  emit('loginStatus', isLoggedIn.value);
}

// Handle logout success
function handleLogoutSuccess() {
  isLoggedIn.value = false;

  // Clear user info
  formData.value.user = '';
  formData.value.password = '';

  // Emit logout status
  emit('loginStatus', isLoggedIn.value);
}

</script>

<template>
  <LoginLogoutSlot
    :userInfo="formData"
    :sqlTags="{ login: 'login', logout: 'ADMIN_LOGOUT_SQL_TAG' }"
    @login-success="handleLoginSuccess"
    @logout-success="handleLogoutSuccess"
  >
    <template #default="{ login, userInfo, loading }">
      <v-container class="d-flex justify-center align-center fill-height">
        <v-card class="pa-5" width="680">
          <v-card-title class="text-h5 text-center">ログイン画面</v-card-title>
          <v-card-text>
            <v-form ref="loginForm" v-model="valid" @keydown.enter.prevent="login">
              <!-- Email/Username -->
              <v-text-field
                label="ログインID"
                v-model="formData.user"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <!-- Password -->
              <v-text-field
                label="パスワード"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="togglePassword"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <!-- Remember Me -->
              <v-checkbox
                label="Remember Me"
                v-model="formData.rememberMe"
              ></v-checkbox>

              <!-- Forgot Password Link -->
              <v-btn text color="primary" class="mt-2" @click="forgotPassword">
                パスワード忘れ?
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <!-- Submit Button -->
            <v-btn text :disabled="!valid" color="primary" block size="large" @click="login">
              ログイン
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </template>
  </LoginLogoutSlot>
</template>

<style scoped>
.v-container {
  background-color: #f5f5f5;
}
</style>

