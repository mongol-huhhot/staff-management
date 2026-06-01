<script setup>
import { useDisplay } from 'vuetify'
const { mdAndDown } = useDisplay()
import { ref, } from 'vue'
import { useDbStore } from '@/stores/useDbStore'

const props = defineProps({
  menus:        { type: Array,  default: () => [] },
  selectedUri:  { type: [String, null], default: null },
  user:         { type: Object, default: () => ({}) },
  clock:        { type: String, default: '' },
  isDisabled:   { type: Function, default: () => () => false },
  logoSrc:      String,
  logoWidth:    Number,
  logoHeight:   Number,
  modelValue:   String
})

const emit = defineEmits([
  'menu-select',
  'toggle-drawer',
  'logout',
  'open-qr',
  'update:modelValue'
])

const dbStore = useDbStore()
const logoutLoading = ref(false)

const logo = {
  src   : props.logoSrc   || 'surupas-sms.png',
  width : props.logoWidth || 140,
  height: props.logoHeight|| 40
}

// detect current language
const lang = ref(localStorage.getItem('lang') || 'ja')

// helper to get label
function getLabel(menuItem) {
  if (!menuItem) return ''
  if (lang.value === 'ja' || !menuItem[`label_${lang.value}`]) {
    return menuItem.label
  }
  return menuItem[`label_${lang.value}`]
}

async function handleLogoutSuccess(payload) {
  console.log("Container::::: 222 Logoutsuccessful!");
  emit('logout', { isLoggedIn: false });
}

const options = [
  { label: '大', value: 'large' },
  { label: '中', value: 'medium' },
  { label: '小', value: 'small' },
]

function onChange(value) {
  emit('update:modelValue', value)
}

async function handleLogout() {
  logoutLoading.value = true

  try {
    await dbStore.logout({
      loading: true,
      loadingText: 'ログアウト中です...',
    })

    console.log('Logout successful')

    emit('logout', {
      isLoggedIn: false,
    })

    // 必要ならログイン画面へ
    window.location.href = '/'
  } catch (err) {
    console.error('Logout failed:', err)
  } finally {
    logoutLoading.value = false
  }
}

</script>

<template>
  <!-- 1st bar -->
  <v-app-bar dense elevation="0" app>
    <v-container fluid>
      <v-row align="center" no-gutters>
        <v-col cols="auto">
          <v-app-bar-nav-icon @click="emit('toggle-drawer')" />
        </v-col>

        <v-col cols="auto" class="pl-0">
          <v-img :src="logo.src" :width="logo.width" :height="logo.height" />
        </v-col>

        <v-col
          cols="auto"
          class="d-none d-sm-flex align-center ml-10"
          style="color:#00A0E9"
        >
           <div class="mr-10" style="font-size: 0.90rem;">
            <v-icon size="18" class="mr-1">mdi-account-circle-outline</v-icon>
            {{ user.staff_code || user.staff_m_id }} - {{ user.staff_name }}
          </div>
          <div class="mr-10" style="font-size: 0.90rem;">
            <v-icon size="18" class="mr-1">mdi-card-account-details-outline</v-icon>
            {{ user.department_code || user.department_id }} : {{ user.department_name }}
          </div>
          <div class="mr-10" style="font-size: 0.90rem;">
            <v-icon size="18" class="mr-1">mdi-calendar-blank-outline</v-icon>
            {{ clock }}
          </div>

            <div class="mr-10 hover-button" style="color: #00A0E9; cursor: pointer;font-size: 0.90rem;" @click="onBadgeClick">
              <v-badge color="error" content="5">
                <v-icon class="mr-1">mdi-bell-outline</v-icon>
              </v-badge>
              アラート
            </div>
            <div class="mr-10 hover-button" style="color: #00A0E9; cursor: pointer;font-size: 0.90rem;" @click="onHelpClick">
              <v-icon class="mr-1">mdi-help-circle-outline</v-icon>Help
            </div>
            <div>
              <v-select
                  :items="options"
                  :model-value="props.modelValue"
                  @update:modelValue="onChange"
                  item-title="label"
                  item-value="value"
                  density="compact"
                  hide-details
                  style="max-width: 80px"
                />
            </div>
          </v-col>
        <v-spacer />

        <!-- right-side icons -->
        <v-col cols="auto" class="d-flex align-center mr-2">
          <v-btn icon class="mr-3" color="#00A0E9" @click="emit('open-qr')">
            <v-tooltip activator="parent" text="QRスキャンでモバイルからアクセス" />
            <v-icon>mdi-qrcode-scan</v-icon>
          </v-btn>
          <div class="mr-8 hover-button" style="color: #00A0E9;">
            <v-tooltip text="メール確認・配信">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props">mdi-email-outline</v-icon>
              </template>
            </v-tooltip>
          </div>

          <slot name="right-action" />

          <div class="mr-8 hover-button" style="color: #E6003E;">
            <v-tooltip text="ログアウト">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  :disabled="logoutLoading"
                  @click="handleLogout"
                >
                  mdi-power
                </v-icon>
              </template>
            </v-tooltip>
          </div>

        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>

  <!-- 2nd bar (menus) -->
   <!-- for the mobile dropdown menu: -->
  <v-app-bar dense app class="gradient-app-bar">
    <template v-if="mdAndDown">
      <v-menu location="bottom" origin="top">
        <template #activator="{ props: p }">
          <v-btn icon v-bind="p"><v-icon>mdi-dots-vertical</v-icon></v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(m,i) in menus"
            :key="i"
            @click="emit('menu-select', m)"
            :class="{ 'selected': selectedUri === (m.uri || m.label) }"
            style="background:#00B9EF;color:white"
          >
            <v-list-item-title :style="m.style">{{ getLabel(m) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <!-- for Desktop menu -->
    <template v-else>
      <v-toolbar-items>
        <template v-for="(m, i) in menus" :key="m.label">
            <v-btn
              text
              :style="`${m.style};  color: white; padding: 0 6px; min-width: auto;`" 
              :disabled="props.isDisabled(m)"
              @click="emit('menu-select', m)"
              :class="{ 'selected-menu': selectedUri === (m.uri || m.label) }"
            > 
              {{ getLabel(m) }}
            </v-btn>
            <span
              v-if="i < menus.length - 1"
              style="color: white;
                font-weight: bold;
                margin: 0 1px;            
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;"
            >
            </span>
          </template>
        </v-toolbar-items>
     </template>
  </v-app-bar>
</template>

<style scoped>
.gradient-app-bar {
  background: linear-gradient(45deg, #00B9EF, #00B9EF) !important;
  top: 48px !important;
}

.selected-menu {
  background: #fff !important;
  color: #00B9EF !important;

  font-weight: bold;
  border-bottom: 2px solid #00B9EF;
}

.selected {
  background: #fff !important;
  color: #00B9EF !important;
  font-weight: bold;
}

:deep(.dim) {
  opacity: 0.45 !important;
  pointer-events: none;
}
</style>
