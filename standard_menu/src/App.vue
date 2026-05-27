<script setup>
import Snackbar from '@/components/Snackbar.vue'
import AppShell from './components/layout/AppShell.vue';
import LoginPage from '@/components/LoginPage.vue'
import { useDataStore } from './stores/DataStore';
import { ref } from 'vue';

const isLogged = ref(false);
const isReady = ref(false); // NEW: loading state
const user = ref({});
const loadingError = ref('')

const dataStore = useDataStore();

const handleLoginSuccess = async (payload) => {
  isLogged.value = true
  user.value = {
    user_id: payload.user.user.user_id,
    user_type: payload.user.user.user_type
  }

  isReady.value = false
  loadingError.value = null

  try {
    await dataStore.loadMasters({ user: user.value.user_id })
    isReady.value = true
  } catch (err) {
    console.error('Failed to load masters:', err)
    loadingError.value = 'メニューの読み込みに失敗しました。'
    isReady.value = true // Allow fallback UI
  }
}

function handleLogoutSuccess() {
  isLogged.value = false
  isReady.value = false
  user.value = {}
}

</script>

<template>
  <LoginPage v-if="!isLogged" @login-success="handleLoginSuccess" />
  <template v-else>
    <v-progress-linear
      v-if="!isReady"
      indeterminate
      color="primary"
      height="4"
    />
    <AppShell v-else :user="user" @logout-success="handleLogoutSuccess" />
  </template>
  <Snackbar />
</template>
