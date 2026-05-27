<script setup>
import { ref, } from "vue";
import { useBaseStore } from "@/stores/BaseStore"; // Import the store
import { showSnackbar } from "@/utils/Snackbar.vue"; // Notification utility

const dbStore = useBaseStore();
// dbStore.commonParams.SQL_PATH = "jwtr250558/work-report/shift/ShiftGanttChartSqlTemplate.sql"

const props = defineProps({
    userInfo: {
        type: Object,
        required: false, // User info object passed as a prop (e.g., { username, password, etc. })
    },
    sqlTags: {
        type: Object,
        required: true, // SQL tags for login and logout (e.g., { login: 'LOGIN_SQL_TAG', logout: 'LOGOUT_SQL_TAG' })
    },
});

const emit = defineEmits(['login-success', 'logout-success']); // Custom events

const loading = ref(false);

// response if successful
// (
//     [status] => success
//     [username] => demo3
//     [additional_info] => {"e_mail": "demo3@gmail.com", "department_code": "1234"}
//     [token] => eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8zIiwiaWF0IjoxNzM3MDk1NDcxLCJleHAiOjE3MzcwOTkwNzEsImlzcyI6InN1cnVwYXMubmF0aXZlMzY1Lm5ldCIsImF1ZCI6InN1cnVwYXMubmF0aXZlMzY1Lm5ldCJ9.5I4O26pS0K3MujyUJ-erW9GDjo12dzxpOZYPnhr1v1A
//     [message] => eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRlbW8zIiwiaWF0IjoxNzM3MDk1NDcxLCJleHAiOjE3MzcwOTkwNzEsImlzcyI6InN1cnVwYXMubmF0aXZlMzY1Lm5ldCIsImF1ZCI6InN1cnVwYXMubmF0aXZlMzY1Lm5ldCJ9.5I4O26pS0K3MujyUJ-erW9GDjo12dzxpOZYPnhr1v1A
// )

// Login Function
async function login() {
    loading.value = true;
    
    try {
        // if( !props.userInfo || !props.userInfo.user || props.userInfo.user==='') {
        // localStorage: saves permanently. sessionStorage: preserving temporarily with a time limit
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) { // verify-token
            const response = await dbStore.verify();
            console.log("verify response===", response)
            return;
        }

        // }

        const response = await dbStore.login(props.sqlTags.login, props.userInfo);
        // console.log("response====", response);
        if( response.status === 'success' ) {
            if (props.userInfo.rememberMe) {
                // Store in localStorage for persistence
                localStorage.setItem('token', response.token);
            } else {
                // Store in sessionStorage for session-only persistence
                sessionStorage.setItem('token', response.token);
            }
            // localStorage.setItem("token", response.token); // Save token locally
            emit("login-success", response); // Emit success event
            return response;
        }
        showSnackbar(`ログイン失敗: ${response.message}`, "error");
        return null;
    } catch (err) {
        showSnackbar("ログイン中にエラーが発生しました。", "error");
        console.error("Login error:", err);
        return null;
    } finally {
        loading.value = false;
    }
}

/**
 * auto login if you check 'Remember Me'
 */
const autoLogin = async () => {
    loading.value = true;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log("autoLogin token==", token)

    if (token) {
        try {
            const response = await dbStore.verify();
            // console.log("autoLogin response==", response)

            if (response) {
                console.log('Auto-login successful!');
                emit("login-success"); // Emit success event
            } else {
                logout()
            }
        } catch (error) {
            logout()
        } finally {
            loading.value = false;
        }
        return
    } 

    console.log('No token found for auto-login.');

    logout()
};

// Logout Function
async function logout() {
    loading.value = true;

    try {
        await dbStore.logout();
        showSnackbar("ログアウト成功", "success");
        localStorage.removeItem("token"); // Clear token locally
        emit("logout-success"); // Emit success event
    } catch (err) {
        showSnackbar("ログアウト中にエラーが発生しました。", "error");
        console.error("Logout error:", err);
    } finally {
        loading.value = false;
    }
}

onMounted(async () => {
    await autoLogin()
})

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
