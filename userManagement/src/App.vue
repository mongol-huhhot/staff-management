<script setup>
import  Snackbar from "@/utils/Snackbar.vue"; // Abstracted notification utility
import EntranceContainer from '@/views/MainEntrance.vue'
// import MyFormkit from "./views/MyFormkit.vue";

</script>

<template>
  <v-app>
    <EntranceContainer></EntranceContainer>
    <Snackbar />
  </v-app>
</template>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height:95vh;
}
</style>
