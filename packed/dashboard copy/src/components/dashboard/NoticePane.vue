<!-- NoticePane.vue 通知・お知らせパネル -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  notices: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['add'])

const currentTab = ref('notice')
</script>

<template>
  <v-card class="pane-card" flat>
    <v-tabs v-model="currentTab" density="compact" color="light-blue">
      <v-tab value="notice">
        通知
        <v-badge v-if="notices.length" :content="notices.length" color="red" inline />
      </v-tab>
      <v-tab value="news">お知らせ</v-tab>

      <v-spacer />

      <v-btn icon variant="text" color="light-blue" @click="emit('add')">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-tabs>

    <v-window v-model="currentTab">
      <v-window-item value="notice">
        <v-list density="compact">
          <v-list-item
            v-for="(notice, index) in notices"
            :key="index"
            class="notice-item"
          >
            <template #prepend>
              <v-icon color="grey">mdi-bell-outline</v-icon>
            </template>

            <v-list-item-title class="notice-text">
              {{ notice }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-window-item>

      <v-window-item value="news">
        <div class="empty-box">お知らせはありません</div>
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

.notice-item {
  border-bottom: 1px solid #eeeeee;
  min-height: 66px;
}

.notice-text {
  white-space: normal;
  line-height: 1.5;
}

.empty-box {
  padding: 40px;
  color: #999;
  text-align: center;
}
</style>
