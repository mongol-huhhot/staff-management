<script setup>
import { ref, } from "vue";
import { useAppConfigStore } from '@/stores/AppConfigStore';

const configStore = useAppConfigStore()
configStore.loadFromWindow()

const props = defineProps({
  email: { type: String, required: true },
  sendCode: { type: Function, required: true },
  verifyCode: { type: Function, required: true },
  codeSent: { type: Boolean, required: true },
  codeVerified: { type: Boolean, required: true },
  errorMessage: { type: String, default: "" },
  rules: { type: Object, required: true }
});
const verificationCode = ref("");

// function doSendCode() {
//   props.sendCode();
// }

function doVerifyCode() {
  props.verifyCode(verificationCode.value);
}

async function handleClick(event) {
  event.preventDefault();
  console.log('Link clicked!');

  // await baseStore.logout();

  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  sessionStorage.clear();

  const href = event.currentTarget.getAttribute("href");

  // Open the link in a new tab (simulate target="_blank")
  // window.open(href, "_self");
  window.location.href = href
}

</script>

<template>
  <div>
    <!-- Send Code Button -->
    <!-- <v-row v-if="!props.codeSent && !props.codeVerified">  
      <v-col cols="12" md="6">
        <v-btn color="primary" @click="doSendCode" :disabled="!props.email">
          {{ $t('common.sendVerificationCode') }}
        </v-btn>
      </v-col>
    </v-row> -->

    <v-row v-if="configStore.mail_confirm">
      <v-col cols="12" md="6" style="color:red; font-weight:700;font-size:1.2em">
        {{ $t('common.hasMailConfirm') }}！
      </v-col>
    </v-row>
    <!-- Enter & Verify Code -->
    <v-row v-if="props.codeSent && !props.codeVerified">
      <v-col cols="12" md="6">
        <v-text-field
          variant="outlined"
          color="error"
          v-model="verificationCode"
          :label="$t('common.enterVerificationCode')"
          :rules="[props.rules.required]"
          required
          class="red-bold-border"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-btn color="success" @click="doVerifyCode" :disabled="!verificationCode">
          {{ $t('common.verifyCode') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Success Message -->
    <v-row v-if="props.codeVerified">
      <v-col cols="12">
        <v-alert type="success" variant="tonal" class="mt-4">
            <!-- Verify Successfully.<br>
              Now you can forward to sign in and register your personal information.<br>
            -->
            {{ $t('common.verficationComplete') }}
            <a
              :href="configStore && configStore.linkto ? configStore.linkto : '../'"
              style="font-weight: bold; color: #1976d2;"
              @click="handleClick"
            >
              {{ $t('common.gotoLogin') }}
            </a>

        </v-alert>
      </v-col>
    </v-row>

    <!-- Error Message -->
    <v-alert v-if="props.errorMessage && !props.codeVerified" type="error" class="mt-4">
      {{ props.errorMessage }}
    </v-alert>
  </div>
</template>
<style scoped>
.red-bold-border .v-field__outline {
  border-color: #f44336 !important; /* Vuetify error color */
  border-width: 2px !important;     /* Make it bold */
}
</style>