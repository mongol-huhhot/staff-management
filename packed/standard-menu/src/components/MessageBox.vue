<template>
  <v-card>
    <v-btn @click="showDialog = true" color="primary">情報</v-btn>

    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5"> 登録情報 </v-card-title>
        <v-card-text>
          登録しました
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="close">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { useDataStore } from "@/stores/DataStore";

const showDialog = ref(false);

const props = defineProps({
  openBox:{
      type: Boolean,
      default: false,
  }
})

watch(props, (v)=>{
  showDialog.value = props.openBox
},{immediate: true})

const dataStore = useDataStore();

function close() {
  dataStore.logout()
  showDialog.value = false
}

</script>
