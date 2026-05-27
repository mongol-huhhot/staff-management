<script setup>
import { ref, } from "vue";
import DataHandlingSlot from "@/components/slots/DataHandlingSlot.vue"; // Slot component
import {rules, userIdExists, } from "@/utils/valitators";
import { useDataStore } from "@/stores/DataStore";
import ImageUploaderCropper from '@/components/ImageUploaderCropper.vue'
import MessageBox from '@/components/MessageBox.vue'

const emit = defineEmits(["data-saved"]); // Define the event in the parent

const componentName = import.meta.url
  .split('/') // Split the URL by '/'
  .pop() // Get the last part (file name with extension and query parameters)
  .split('?')[0] // Remove query parameters (everything after '?')
  .replace('.vue', ''); // Remove the .vue extension

console.log(componentName); // Outputs the file name without the .vue extension

const dataStore = useDataStore();
const valid = ref(false);
const cropRef = ref(null)

const props = defineProps({
  data: { type: [Object, Array], required: true },
  actionType: { type: String, required: false, default: "" },
});

const showPassword = ref(false);
const userForm = ref(null); // Form reference
const messageBox = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

function bubbleDataSaved(savedData) {
    console.log("🔵 Bubbling data-saved event:", savedData);
    messageBox.value = true;
    emit("data-saved", savedData); // Re-emit the event
}

const resetForm = (data) => {
    console.log("resetForm::::: data===", data )
    Object.keys(data).forEach((key) => {
        if (key !== 'content') data[key] = "";
        else data[key] = {};
    });
};

const imageMeta = ref(null)

const handleCropped = (data) => {
  // data = { blob, mime, name, size } or { base64, mime, name, size }
  imageMeta.value = data
  console.log(imageMeta.value)
}

const userIdError = ref('')
const mailError = ref('')

async function checkUserIdMail(e) {
  userIdError.value = ''
  console.log(e, e.target.value)
  const valid = await userIdExists(e.target.value)
  return valid 
}

async function checkUserId(e) {
  const valid = await checkUserIdMail(e)
  if (!valid) {
    userIdError.value = `このユーザIDは既に存在します`
  }
}

async function checkEmail(e) {
  mailError.value = ''
  const valid = await checkUserIdMail(e)
  if (!valid) {
    mailError.value = `このメールアドレスは既に存在します`
  }
}

/** save data with base64 image(thumbnail) */
function saveAll(save, data) {
  // back up plain password
  data.content.password = data.password 
  // image mime context type
  data.content.thumbnail = {name: imageMeta.value.name, mime: imageMeta.value.mime, size: imageMeta.value.size, encode: 'base64'}
  // set base64 image data
  data.draft_thumbnail_data = imageMeta.value.base64
  console.log(imageMeta.value.base64)

  save()
}

function checkInput() {
  if(!cropRef.value ) return 
  cropRef.value.getCropped()
}

// const imageBlob = ref(null)

// onMounted(async () => {
//   try {
//     imageBlob.value = await dataStore.loadImage('userid3')
//     // const blob = await dataStore.loadImage('userid3')
//     // imageBlob.value = URL.createObjectURL(blob);
//   } catch (err) {
//     console.error("Failed to load image:", err);
//   }
// });

// onMounted(async ()=>{
//   imageBlob.value = await dataStore.loadImage('userid3')
// })

</script>

<template>
    <div>
      <DataHandlingSlot
        :data="props.data"
        :sqlTags="dataStore.sqlTags"
        v-slot="{ save, delete: deleteData, loading, data: slotData }"
        @data-saved="bubbleDataSaved"
      >
        <v-form ref="userForm" v-model="valid" class="pa-6">
          <v-row class="mb-2" align="center" justify="center">
            <!-- Button Group -->
            <v-col cols="12" md="8" class="d-flex flex-wrap flex-md-nowrap justify-center justify-md-start">
              <v-btn
                :disabled="!valid || loading"
                size="large"
                color="primary"
                class="ma-2"
                @click="saveAll(save, slotData)"
              >
                登録
              </v-btn>
              <v-btn
                color="success"
                size="warning"
                class="ma-2"
                @click="resetForm(slotData)"
              >
                リセット
              </v-btn>
              <v-btn
                :disabled="loading"
                size="large"
                color="info"
                class="ma-2"
                @click="checkInput"
              >
                入力確認
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-if="slotData.content"
                label="お名前"
                v-model="slotData.content.fullName"
                :rules="[rules.required]"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="ユーザID"
                v-model="slotData.userid"
                :rules="[rules.required]"
                :error="!!userIdError"
                :error-messages="userIdError"
                required
                @change="checkUserId"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="メール"
                v-model="slotData.email"
                :rules="[rules.required, rules.email]"
                required
                :error="!!mailError"
                :error-messages="mailError"
                @change="checkEmail"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="パスワード"
                v-model="slotData.password"
                :type="showPassword ? 'text' : 'password'"
                :rules="[rules.required, rules.minLength(6)]"
                required
                append-icon="mdi-eye"
                @click:append="togglePassword"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-if="slotData.content"
                label="住所"
                v-model="slotData.content.address"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="12" md="6">
              <!-- width: { type: Number, default: 200 },
                height: { type: Number, default: 200 },
                label: { type: String, default: 'Upload or Take Photo' },
                returnType: { type: String, default: 'blob' }, // 'blob' or 'base64' -->
              <ImageUploaderCropper ref="cropRef" @cropped="handleCropped" label="顔写真" returnType="base64"/>
            </v-col>
            <!-- <v-col cols="12" md="6">
              <v-radio-group
                v-if="data.content"
                v-model="data.content.gender"
                class="w-100"
                row
              >
                <v-radio label="男性" value="male" />
                <v-radio label="女性" value="female" />
                <v-radio label="その他" value="other" />
              </v-radio-group>
            </v-col> -->
          </v-row>
          <!-- <v-row>
            <v-col cols="12" md="6">
              <img :src="imageBlob" alt="Thumbnail" v-if="imageBlob"/>
            </v-col>
          </v-row> -->
        </v-form>
      </DataHandlingSlot>
      <MessageBox :openBox="messageBox"></MessageBox>
    </div>
</template>

