<script setup>
import { ref, watch, provide, onMounted, onUnmounted, } from "vue";
import LoginPage from "./LoginPage.vue";
import IdentityList from "./UserList.vue";
import IdentityFrom from "./UserForm.vue";
import OnlineHelp from "@/components/OnlineHelp.vue";
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { showSnackbar } from "@/utils/Snackbar.vue"; // Abstracted notification utility  

const listRef = ref(null)
const isLogged = ref(false);

const LOCAL_STORAGE_KEY = "showGuideStatus";

// Initialize the reactive ref from localStorage if available, otherwise default to true.
const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
const showGuide = ref(storedValue !== null ? JSON.parse(storedValue) : true);

const isSmallScreen = ref(false);

const newRecord = ref(false)

const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth < 600; // Adjust breakpoint as needed
};

// Lifecycle hooks
onMounted(() => {
  checkScreenSize(); // Check screen size on mount
  window.addEventListener('resize', checkScreenSize); // Add resize listener

  if(window.location.hostname!=='localhost')handleLoginSuccess(true); //iframe内にログインページ表示しないように
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize); // Remove resize listener
});

// Watch for changes to the showGuide value and persist the new value to localStorage.
watch(showGuide, (newVal) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVal));
});

provide("showGuide", showGuide);

function handleLoginSuccess(status) {
  console.log("Login successful!", status);
  isLogged.value = status;
}

// const selectedAction = ref('edit')
const selectedRowData = ref(null)
const currentStatus = ref('idle')

const addNew = () => {
  selectedRowData.value = {
    'userid': '',
    'password': '',
    'is_active': true,
    content: {fullName:''},
    'mode':'add',
  };
};

// watch(selectedAction, (value)=> {
//   if(value!=='new') return 

//   addNewStaffContract()
// })

// reload after data being saved 
async function handleDataSaved(result) {
  if(!listRef.value) return 
  const ret = await listRef.value.fetchData({})
  currentStatus.value = 'saved'
};

const rowSelected = (row) => {
  if(newRecord.value) {
    showSnackbar('新規作成データを保存してないです。','error')
    return 
  }

  selectedRowData.value = {}
  console.log("MainEntrance: rowSelected :::::: Data saved event received:", row);
  console.log("row=====", row)
  selectedRowData.value = {...row}
}

// Reference to the HelpSidebar component
const helpSidebar = ref(null);

// Function to toggle the help sidebar
const toggleHelpSidebar = () => {
  if (helpSidebar.value) {
    helpSidebar.value.helpSidebar = !helpSidebar.value.helpSidebar;
  }
};

const statusList = [
  { value: 'draft',  label: '作成中' ,},
  { value: 'pending', label: '登録済み' ,},
  { value: 'returned', label: '差戻し' ,},
  { value: 'approved', label: '承認済み' ,},
  { value: 'rejected', label: '拒絶' ,},
  { value: 'confirmed', label: '承諾' ,},
]

const selectedStatus = ref(null)

//選択時に表をフィルタ
const prosessChange=(d)=>{
  if(!listRef.value)return
  
  listRef.value.changeFilter(d)
}


</script>

<template>
  <v-container style="max-width:100% !important;">
    <!-- Login Page -->
    <LoginPage v-if="!isLogged" @loginStatus="handleLoginSuccess" />
    <splitpanes :horizontal="isSmallScreen" class="default-theme" v-else>
      <pane min-size="20" :size="isSmallScreen ? 50 : 75">
        <v-card class="mx-auto" style="height: 100%;">
          <v-card-title>
            『ユーザー一覧』
          </v-card-title>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="12" md="6">
                <v-btn-toggle v-model="newRecord" class="ma-2">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        @click="addNew"
                        value="true"
                        :color="newRecord ? 'error' : ''"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-plus</v-icon> 
                        <template v-if="newRecord">新ユーザ追加中...</template>
                        <template v-else>新ユーザ追加します</template>
                      </v-btn>
                    </template>
                    <!-- Tooltip Text -->
                    <span>新規スタッフ追加には押して、「新スタッフ追加中...」してください</span>
                  </v-tooltip>
                </v-btn-toggle>

                <!-- <v-btn color="secondary"
                  size="large"
                  @click="addNew"
                  class="ma-4"
                  >
                  新規追加
                </v-btn> -->
              </v-col>
              <v-col cols="12" md="6">
                <v-combobox
                v-if="false"
                  :items="statusList"
                  item-value="value"
                  item-title="label"
                  label="登録状況"
                  multiple
                  chips
                  deletable-chips
                  small-chips
                  :return-object="false"
                  clearable
                  @update:modelValue="prosessChange"
                />
              </v-col>
                <!-- <v-btn
                    size="small"
                    icon
                    color="primary"
                    @click="toggleHelpSidebar"
                    class="ma-4"
                  >
                  <v-icon>mdi-help-circle</v-icon>
                </v-btn> -->
            </v-row>
             <IdentityList ref="listRef" @row-selected="rowSelected"></IdentityList>
          </v-card-text>
        </v-card>
      </pane>
      <pane min-size="20" :size="isSmallScreen ? 50 : 25">
        <v-card class="mx-auto" style="height: 100%;">
          <v-card-title style="display: flex;">
            『ユーザー情報詳細』
          </v-card-title>
          <v-card-text>
            <IdentityFrom
              v-if="selectedRowData"
              @data-saved="handleDataSaved"
              :data="selectedRowData || {}"
            ></IdentityFrom>
          </v-card-text>
        </v-card>
      </pane>
    </splitpanes>
    <OnlineHelp ref="helpSidebar"></OnlineHelp>
  </v-container>
</template>

<style>
/* Ensure the parent container has a defined height */
.h-90 {
  height: 90vh;
}
/* Make the scrollable div take up the remaining space */
.flex-grow-1 {
  flex-grow: 1;
}
/* Ensure the scrollable div has overflow-y enabled */
.overflow-y-auto {
  overflow-y: auto;
}
.v-selection-control-group {
  grid-area: control;
  display: flex;
  flex-direction: row;
}
.v-messages, .v-input__details {
  min-height: 0px !important;
  padding-top: 0px !important;
}
.v-label {
  width: 8em;
}
</style>
