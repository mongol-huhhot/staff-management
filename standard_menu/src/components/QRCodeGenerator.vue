<script setup>
import { ref, watch, } from 'vue'
import QrcodeVue, { QrcodeCanvas, QrcodeSvg } from 'qrcode.vue'

const props = defineProps({
    qrString:{
        type: String,
        default: "https://janga.co.jp",
    },
    showDialog: {
        type: Boolean,
        default: false,
    }
})

const showDialog = ref(false)

watch(props, () => {
    showDialog.value = props.showDialog;
},{immediate: true, deep: true})

// const qrString = ref('Hello, this is a QR code!')

function openDialog(str) {
  qrString.value = str
  showDialog.value = true
}
</script>

<template>
  <v-btn color="primary" @click="openDialog('https://janga.co.jp')">
    Show QR Code
  </v-btn>

  <v-dialog v-model="showDialog" max-width="360">
    <v-card>
      <v-card-title>QR Code</v-card-title>
      <v-card-text class="d-flex flex-column align-center">
        <QrcodeVue :value="props.qrString||window.location.href" :size="240" />
        <div class="mt-2">{{ props.qrString || window.location.href }}</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="showDialog = false">閉じる</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* Optional: for better dialog centering */
.v-card-text {
  min-height: 260px;
}
</style>
