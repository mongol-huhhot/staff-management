<script setup>
import { ref, computed, shallowRef } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'



// --- 1. Main Split Direction ---
const isMainHorizontal = ref(
  localStorage.getItem('splitDirection') !== 'vertical' // default horizontal
)
watch(isMainHorizontal, val => {
  localStorage.setItem('splitDirection', val ? 'horizontal' : 'vertical')
})

// --- 2. Dynamic Pane Defs ---
// (In real apps, use defineAsyncComponent for real lazy loading)
const paneDefs = [
  {
    title: 'ユーザ情報',
    key: 'userInfo',
    com: shallowRef(() => import('./user/userInfo.vue'))
  },
  {
    title: '個人情報',
    key: 'staffInfo',
    com: shallowRef(() => import('./personal/staffInfo.vue'))
  },
  {
    title: '契約情報',
    key: 'contractInfo',
    com: shallowRef(() => import('./contract/contractInfo.vue'))
  }
]

// --- 3. State for opened panes ---
const openPaneKeys = ref([]) // e.g. ['userInfo']

// --- 4. Dynamic area split direction (always opposite) ---
const isDynamicHorizontal = computed(() => !isMainHorizontal.value)

// --- 5. Example status (optional) ---
const status = ref(localStorage.getItem('splitStatus') || 'pending')
watch(status, val => localStorage.setItem('splitStatus', val))

// --- 6. Add/Remove pane logic ---
function addPane(key) {
  if (!openPaneKeys.value.includes(key)) openPaneKeys.value.push(key)
}
function removePane(key) {
  openPaneKeys.value = openPaneKeys.value.filter(k => k !== key)
}
</script>

<template>
  <!-- Top toolbar: master switch, split direction, and dynamic pane toggles -->
  <v-app-bar flat color="grey-lighten-4">
    <div style="display:flex; align-items:center;">
      <!-- Example status switcher (optional) -->
      <v-btn-toggle v-model="status" mandatory class="mr-4">
        <v-btn value="draft">作成中</v-btn>
        <v-btn value="pending">提出済</v-btn>
        <v-btn value="approved">承認済み</v-btn>
      </v-btn-toggle>
      <!-- Split direction toggle -->
      <v-btn @click="isMainHorizontal = !isMainHorizontal" variant="outlined" class="ml-2">
        <v-icon left>
          {{ isMainHorizontal ? 'mdi-view-split-horizontal' : 'mdi-view-split-vertical' }}
        </v-icon>
        {{ isMainHorizontal ? '横分割' : '縦分割' }}
      </v-btn>
      <!-- Dynamic pane toggles -->
      <v-btn-toggle v-model="openPaneKeys" multiple class="ml-6">
        <v-btn
          v-for="def in paneDefs"
          :key="def.key"
          :value="def.key"
          min-width="120"
        >
          {{ def.title }}
        </v-btn>
      </v-btn-toggle>
    </div>
  </v-app-bar>

  <!-- Main Split: Left = main/summary, Right = dynamic area -->
  <Splitpanes
    class="default-theme"
    :horizontal="isMainHorizontal"
    style="height: calc(100vh - 56px);"
  >
    <!-- Main/brief area -->
    <Pane min-size="20" style="padding:1em;">
      <h3>メインエリア（スタッフ一覧など）</h3>
      <div>必要なリストやサマリーをここに配置</div>
    </Pane>

    <!-- Dynamic area (multi-pane, always opposite direction to main) -->
    <Pane min-size="20" style="padding:0;">
      <Splitpanes
        class="default-theme"
        :horizontal="isDynamicHorizontal"
        style="height:100%;"
      >
        <!-- Only render open panes -->
        <Pane
          v-for="def in paneDefs.filter(p => openPaneKeys.includes(p.key))"
          :key="def.key"
          style="padding:1em; position:relative;"
        >
          <!-- Pane header with close button -->
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span class="font-weight-bold">{{ def.title }}</span>
            <v-btn
              icon
              size="small"
              @click.stop="removePane(def.key)"
              style="margin-left: 8px;"
            >
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>
          <!-- Actual dynamic content component -->
          <Suspense>
            <component :is="def.com" />
            <template #fallback>
              <div style="color:gray">Loading...</div>
            </template>
          </Suspense>
        </Pane>
      </Splitpanes>
      <!-- Optionally show message when no panes open -->
      <div v-if="openPaneKeys.length === 0" style="padding:2em; color:gray;">パネルを選択してください</div>
    </Pane>
  </Splitpanes>
</template>
