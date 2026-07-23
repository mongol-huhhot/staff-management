<!-- MenuPane.vue 全部（メニュー一覧）パネル -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const currentTab = ref('all')
</script>

<template>
  <v-card class="pane-card" flat>
    <v-tabs v-model="currentTab" density="compact" color="light-blue">
      <v-tab value="all">全部</v-tab>
    </v-tabs>

    <v-window v-model="currentTab">
      <v-window-item value="all">
        <v-container fluid>
          <v-row dense>
            <v-col
              v-for="(menu, index) in menus"
              :key="index"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card class="menu-card" variant="elevated" @click="emit('select', menu)">
                <v-avatar color="blue-lighten-4" size="40">
                  <v-icon color="primary">
                    {{ menu.icon }}
                  </v-icon>
                </v-avatar>

                <div class="menu-title">
                  {{ menu.title }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<style scoped>
.pane-card {
  height: 100%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.menu-card {
  height: 118px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-radius: 6px;
  cursor: pointer;
}

.menu-title {
  font-size: 14px;
  color: #333;
}
</style>
