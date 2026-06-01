<template>
  <v-app>
    <v-main>
       <Index></Index>
    </v-main>
    <snackbar></snackbar>
  </v-app>
</template>

<script setup>
import Snackbar from './components/Snackbar.vue';
import Index from './pages/index.vue';
</script>
