<script setup>
import { ref, onMounted } from "vue";
import { useBaseStore } from "@/stores/BaseStore";
import { showSnackbar } from "@/components/Snackbar.vue";

const dbStore = useBaseStore();

const props = defineProps({
    userInfo: {
        type: Object,
        required: false,
    },
    sqlTags: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['login-success', 'logout-success' , 'login-error']);
const loading = ref(false);

async function login() {
  loading.value = true;

  // console.log("ssssssssssssssssssssssssssss===", props.userInfo)
  try {
    const response = await dbStore.login(props.sqlTags.login, props.userInfo);

    console.log("LoginLogoutSlot===response=", response)

    // PROPER data structure handling
    if (response.token) {
      // Emit normalized user data
      emit('login-success', {
        user: response.user,
        token: response.token,
        expires: response.expires
      });
    }
  } catch (error) {
    showSnackbar(`Login failed: ${error}`);
    emit('login-error',error)
  } finally {
    loading.value = false;
  }
}

async function autoLogin() {
  try {
    const { user, token, expires } = await dbStore.verify();

    // console.log("autoLogin: user, token===", user, token, expires)
    
    // Validate token structure
    if (token.split('.').length !== 3) {
      throw new Error('Invalid token format');
    }

    emit('login-success', {
      user,
      token,
      expires: localStorage.getItem('token_expires') || sessionStorage.getItem('token_expires')
    });
  } catch (error) {
    dbStore.clearAuth();
  }
}

async function logout() {
    loading.value = true;
    try {
        await dbStore.logout();
        showSnackbar("ログアウトしました", "success");
        // localStorage.removeItem("token");
        emit("logout-success");
    } catch (err) {
        showSnackbar("ログアウト中にエラーが発生しました。", "error");
        console.error("Logout error:", err);
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    await autoLogin();
});
</script>

<template>
  <div>
    <slot
      :login="login"
      :autoLogin="autoLogin"
      :logout="logout"
      :loading="loading"
      :userInfo="props.userInfo"
    />
  </div>
</template>
