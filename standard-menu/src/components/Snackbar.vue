<!-- components/Snackbar.vue -->
<template>
    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom-right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </template>
  
<script>
  import { ref } from 'vue';
  
  const TINEOUT = 5000

  export const snackbar = ref({
    visible: false,
    message: '',
    color: '',
    timeout: TINEOUT,
  });
  
  export const showSnackbar = (message, color = 'success', timeout = TINEOUT) => {
    snackbar.value = { visible: true, message, color, timeout };
  };
  
    export default {
        setup() {
            return {
                snackbar,
            };
        },
    };
</script>
  