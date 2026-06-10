<template>
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    :location="snackbar.location || 'top end'"
    multi-line
  >
    {{ snackbar.text }}
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="snackbar.show = false"
      />
    </template>
  </v-snackbar>
</template>

<script setup>
import { useBaseStore } from '@/stores/BaseStore'
import { storeToRefs } from 'pinia'

const baseStore = useBaseStore()
const { snackbar } = storeToRefs(baseStore)
</script>