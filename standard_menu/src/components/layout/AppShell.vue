<!-- src/components/layout/AppShell.vue -->
<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'

/* stores & composables */
import { useDataStore } from '@/stores/DataStore'
import { useClock }     from '@/composables/useClock'
import { usePermission } from '@/composables/usePermission'

/* presentational children */
import AppToolbar   from '@/components/layout/AppToolbar.vue'
import AppDrawer    from '@/components/layout/AppDrawer.vue'
import AppContent  from '@/components/layout/AppContent.vue'
import AppFooter    from '@/components/layout/AppFooter.vue'

import QRCodeGenerator from '@/components/QRCodeGenerator.vue'
/* 文字サイズ変更*/
const fontSize = ref('medium')

watch(fontSize, (newVal) => {
  let size = '16px'
  if (newVal === 'small') size = '12px'
  else if (newVal === 'large') size = '20px'
  else size = '16px'

  document.documentElement.style.fontSize = size
})
/* ---------- Constants & props ----------------------------------------- */
const LICENSE = 'Copyright 2025 Janga Tech. Inc.'

const props = defineProps({ user: Object})
const emit  = defineEmits(['logout-success'])

/* ---------- Global store + responsiveness ----------------------------- */
const dataStore = useDataStore()
const { mdAndDown } = useDisplay()

/* ---------- Clock & permission helpers -------------------------------- */
const { now: clockStr } = useClock()

/* ---------- Drawer & menu state --------------------------------------- */
const drawerOpen  = ref(true)
const drawerWidth = ref(250)

// const topMenus  = computed(() => dataStore.data?.menulist ?? [])
const topMenus = computed(() =>
  (dataStore.data?.menulist ?? []).map(m => m.content ?? m)
)

const leftMenus = ref([])

const selectedTopUri = ref(null)

/* ---------- Main-content payload -------------------------------------- */
const activeType       = ref('')
const activeComponent  = ref(null)
const iframeSrc        = ref('')
const footerMsg        = ref(LICENSE)

const currentUserIdRef   = computed(() => props.user?.user_id  ?? '')
const currentUserTypeRef = computed(() => props.user?.user_type ?? '')

// ← single source of truth
const { isDisabled } = usePermission(currentUserIdRef, currentUserTypeRef)

/* ---------- Component / iframe loader --------------------------------- */
function loadItem( item ) {
  if (!item?.uri) return

  if (isDisabled(item)) return

  // auto-detect type when not specified
  let type = item.load_type
  if (!type) {
    type = /^https?:\/\//.test(item.uri) ? 'external'
         : item.uri.endsWith('.vue')     ? 'component'
         : 'iframe'
  }

  /* external url → new tab */
  if (type === 'external') {
    window.open(item.uri, '_blank')
    footerMsg.value = `${LICENSE} 外部ページ、新タブに表示します: ${item.label}`
    return
  }

  /* vue component */
  if (type === 'component') {
    activeComponent.value = defineAsyncComponent(() =>
      import(/* @vite-ignore */ (item.load_type ? item.label : item.uri))
    )
    activeType.value = 'component'
    iframeSrc.value  = ''
    footerMsg.value  = `${LICENSE} コンポネント: ${item.label}`
    return
  }

  /* iframe app */
  const tid =
    window.location.pathname.split('/').filter(Boolean)[0] ||
    (location.hostname === 'localhost' ? 'jslm230436' : '')

  iframeSrc.value  = `/${tid}/${item.uri.replace(/^\/+/, '')}`
  activeType.value = 'iframe'
  activeComponent.value = null
  footerMsg.value  = `${LICENSE} アプリケーション: ${item.label}`
}

/* ---------- Top-bar menu click ---------------------------------------- */
function onTopMenu(menu) {
  // selectedTopUri.value = menu?.uri ?? menu?.label

  const m = menu.content ?? menu 
  selectedTopUri.value = m.label ?? m.uri

  // if (menu?.uri) {
  if (m.uri) {           // ← use unwrapped “m”
      loadItem(m)
      leftMenus.value = []
      return
  } else {
    // leftMenus.value = m.children ?? []
    leftMenus.value = (m.children ?? []).map(c => c.content ?? c)
    activeType.value = ''
    activeComponent.value = null
    iframeSrc.value  = ''
    footerMsg.value  = `${LICENSE} (現在使用中機能: ${menu.label})`
  }
}

/* ---------- Drawer menu click ----------------------------------------- */
function onLeftMenu(item) {
  loadItem(item)
}

/* ---------- Logout proxy ---------------------------------------------- */
function logout() {
  emit('logout-success')
}

/* ---------- Default page on login ------------------------------------- */
function findByUri(list, uri){
  if (!uri) return null
  for (const m of list) {
    const cand = m?.content?.uri ?? m?.content?.label ?? m.uri ?? m.label
    if (cand === uri) return m.content ?? m
    const found = findByUri(m.children ?? m?.content?.children ?? [], uri)
    if (found) return found
  }
  return null
}

const loading = ref(true)

watch(
  () => dataStore.data,
  async (newData) => {
    console.warn('newData:', newData)
    const arr = newData?.loginuser
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      loading.value = false
      console.warn('No user data found, stopping loading.')
      return
    }

    const user = arr[0]
    if (!user) return

    await nextTick()
    const def = findByUri(topMenus.value, user.default_display)
    if (def) {
      onTopMenu(def)
      leftMenus.value = def.children ?? []
    }

    loading.value = false
  },
  { immediate: true, deep: true }
)

const qrString = ref(window.location.href)
const showDialog = ref(false)

function openDialog(str=null) {
  qrString.value = str || window.location.href
  showDialog.value = true
}

watchEffect(() => {
  console.log('currentUserId:', currentUserIdRef.value)
  console.log('currentUserType:', currentUserTypeRef.value)
})

</script>

<template>
  <v-app v-if="!loading">
    <!-- {{ topMenus }} -->
     <!-- -- {{ leftMenus }} -- {{ selectedTopUri }} -- {{ activeType }} -- {{ activeComponent }} -- {{ iframeSrc }} -->

    <!-- ── Toolbar (two app-bars inside) ────────────────────────────── -->
    <AppToolbar
      v-model="fontSize"
      :menus="topMenus"
      :selected-uri="selectedTopUri"
      :user="dataStore.data?.loginuser?.[0] ?? {}"
      :clock="clockStr"
      @toggle-drawer="drawerOpen = !drawerOpen"
      @menu-select="onTopMenu"
      @logout="logout"
      @open-qr="openDialog('https://surupas-dev.native365.net/jwtr250558/entrance/')"
      :isDisabled="isDisabled"
    />

    <!-- ── Drawer ──────────────────────────────────────────────────── -->
    <AppDrawer
      v-model:open="drawerOpen"
      v-model:width="drawerWidth"
      :menus="leftMenus"
      :isDisabled="isDisabled"
      :currentTopMenuLabel="selectedTopUri"
      @select="onLeftMenu"
    >
      <template #right-action>
        <div class="mr-8 hover-button" style="color: #00A0E9;">
          <v-tooltip text="メール確認・配信">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props">mdi-email-outline</v-icon>
            </template>
          </v-tooltip>
        </div>
      </template>
    </AppDrawer>

    <!-- ── Main Content Area ───────────────────────────────────────── -->
    <AppContent
      :contentType="activeType"
      :activeComponent="activeComponent"
      :iframeSrc="iframeSrc"
    />

    <!-- ── Footer ──────────────────────────────────────────────────── -->
    <AppFooter :message="footerMsg" />

    <QRCodeGenerator :qrString="qrString" :showDialog="showDialog"/>
  </v-app>
  <div v-else>loading...</div>
</template>
