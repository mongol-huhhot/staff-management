<script setup lang="ts">
const props = defineProps<{ message: string }>()
</script>

<template>
  <v-footer app padless>
    <v-col cols="12" class="text-center">
      {{ message }}
    </v-col>
  </v-footer>
</template>
