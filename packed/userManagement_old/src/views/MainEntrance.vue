<script setup>
import { ref, watch, provide, onMounted, onUnmounted, } from "vue";
// import LoginPage from "./UserLogin.vue";
import IdentityList from "./UserList.vue";
import IdentityFrom from "./UserForm.vue";
import { showSnackbar } from "@/utils/Snackbar.vue"; // Abstracted notification utility  
import ResponsiveSplitFrame from "@/components/ResponsiveSplitFrame.vue";
import { useDataStore } from "@/stores/DataStore";

const listRef = ref(null)
// const isLogged = ref(false);

const LOCAL_STORAGE_KEY = "showGuideStatus";

// Initialize the reactive ref from localStorage if available, otherwise default to true.
const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
const showGuide = ref(storedValue !== null ? JSON.parse(storedValue) : true);

const isSmallScreen = ref(false);

const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 600; // Adjust breakpoint as needed
};

// Lifecycle hooks
onMounted(() => {
  checkScreenSize(); // Check screen size on mount
  window.addEventListener('resize', checkScreenSize); // Add resize listener
  login(); // Attempt login on mount

  if(window.location.hostname!=='localhost') handleLoginSuccess(true); //iframe内にログインページ表示しないように
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize); // Remove resize listener
});

// Watch for changes to the showGuide value and persist the new value to localStorage.
watch(showGuide, (newVal) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVal));
});

provide("showGuide", showGuide);

// function handleLoginSuccess(status) {
//   console.log("Login successful!", status);
//   isLogged.value = status;
// }

// const selectedAction = ref('edit')
const selectedRowData = ref(null)
const currentStatus = ref(false)

const addNew = () => {
  if (selectedRowData.value.mode === 'add' ) {
    selectedRowData.value = null
    return
  }

  selectedRowData.value = {
    'userid': '',
    'password': '',
    'is_active': true,
    content: {fullName:''},
    'mode':'add',
  };
};

// reload after data being saved 
async function handleDataSaved(result) {
  if(!listRef.value) return 
  const ret = await listRef.value.fetchData({})
  currentStatus.value = false
};

const rowSelected = (row) => {
  console.log("MainEntrance: rowSelected :::::: Row selected event received:", row);
  if(currentStatus.value) {
    showSnackbar('新規作成データを保存してないです。','error')
    return 
  }

  selectedRowData.value = {}
  console.log("MainEntrance: rowSelected :::::: Data saved event received:", row);
  console.log("row=====", row)
  selectedRowData.value = {...row}
}

// Reference to the HelpSidebar component
// const helpSidebar = ref(null);

async function login() {
  const dataStore = useDataStore()
  const result = await dataStore.login({
    user: 'its@janga.co.jp',
    password: 'janga1',
  },{remember: true})

  console.log('Login result:', result)
  return result
}


</script>

<template>
  <v-container style="max-width:100% !important;">
    <!-- Login Page -->
    <!-- <LoginPage v-if="!isLogged" @loginStatus="handleLoginSuccess" /> -->

    <ResponsiveSplitFrame>
      <template #header>
        <div class="text-h5" style="margin: 10px;">『ユーザー一覧』</div>
        <div class="mr-6">件数：{{listRef?.itemCount}}</div>
        <v-btn-toggle v-model="currentStatus" class="ma-2">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                @click="addNew"
                value="true"
                :color="currentStatus ? 'error' : ''"
                v-bind="attrs"
                v-on="on || {}"
              >
                <v-icon>mdi-plus</v-icon> 
                <template v-if="currentStatus">新ユーザ追加中...</template>
                <template v-else>新ユーザ追加します</template>
              </v-btn>
            </template>
            <!-- Tooltip Text -->
            <span>新規スタッフ追加には押して、「新スタッフ追加中...」してください</span>
          </v-tooltip>
        </v-btn-toggle>
      </template>
      <template #left>
         <IdentityList ref="listRef" @row-selected="rowSelected"></IdentityList>
      </template>
      <template #right>
        <v-card class="mx-auto" style="height: 100%;">
          <v-card-title style="display: flex;">
            『ユーザー情報詳細』<span class="text-body-1 mt-1">（ユーザ情報編集とユーザ・スタッフ突合）</span>
          </v-card-title>
          <v-card-text>
            <IdentityFrom
              v-if="selectedRowData"
              @data-saved="handleDataSaved"
              :data="selectedRowData || {}"
            ></IdentityFrom>
            <div v-else>ユーザ一覧から一つ選択して下さい</div>
          </v-card-text>
        </v-card>
      </template>
    </ResponsiveSplitFrame>
    <!-- <OnlineHelp ref="helpSidebar"></OnlineHelp> -->
  </v-container>
</template>
