<!-- StaffQualification.vue -->
<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue';
import DiffSelect from './DiffSelect.vue';
import DiffTextField from './DiffTextField.vue';
import QrMobileImageField from './QrMobileImageField.vue';
import ImageView from './ImageView.vue';

const props = defineProps({
  data: {
    type: Array,
    default: () => [{}],
  },
  staffId: {
    type: [String, Number],
    required: true,
  },
  qualList: {
    type: Array,
    default: () => [],
  },
  diffData: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:data', 'update:qualList']);

const initValue = {
    qid: '',
    other_name: '',
    is_future: '',
    qualification_date: '',
    expiration_date: '',
    qualification_number: '',
    fileObjArray: [],
    fileObjArray2: [],
  }
// Local copy to manipulate without mutating props directly
const localData = computed({
  get() {
    const arr = props.data || [];
    if (arr.length === 0) {
      // Return at least one empty object
      return [initValue];
    }
    return arr;
  },
  set(value) {
    emit('update:data', value);
  }
});

function addQua() {
  localData.value.push(initValue);
}

function removeQua(index) {
  if (localData.value.length === 1) {
    // Reset to one empty object if only one item
    localData.value = [{}];
  } else {
    localData.value = localData.value.filter((_, i) => i !== index);
  }
}

function setRef(el, qua, refName) {
  qua[refName] = el;
}
</script>

<template>
  <div class="depContainer" v-for="(qua, index) in localData" :key="index">
    <div class="text-h6">資格情報{{ index + 1 }}</div>

    <DynamicSelectBoxDiff
      sql-tag="sel_qualifications_select"
      sql-path="sou/entryCompany.sql"
      label="資格種別"
      :dataList="qualList"
      @update:data-list="(value) => $emit('update:qualList', value)"
      v-model="qua.qid"
      :original="
        diffData?.find((e) => e.qid === qua.qid && e.other_name === qua.other_name)?.qid
      "
      required
    />

    <DiffSelect
      v-if="qua.qid === 1"
      v-model="qua.is_future"
      label="取得見込み/取得済み"
      :items="[
        { title: '取得済み', value: '0' },
        { title: '取得見込み', value: '1' },
      ]"
      :original="
        diffData?.find((e) => e.qid === qua.qid && e.other_name === qua.other_name)?.is_future
      "
    />

    <DiffTextField
      v-if="qua.qid === 0"
      v-model="qua.other_name"
      label="資格名"
      :original="
        diffData?.find((e) => e.qid === qua.qid && e.other_name === qua.other_name)?.other_name
      "
    />

    <v-row>
      <v-col cols="6">
        <DiffTextField
          v-model="qua.qualification_date"
          :is-date="true"
          label="資格取得日"
          :original="
            diffData?.find((e) => e.qid === qua.qid && e.other_name === qua.other_name)
              ?.qualification_date
          "
        />
      </v-col>
      <v-col cols="6">
        <DiffTextField
          v-model="qua.expiration_date"
          :is-date="true"
          label="満了年月日"
          :original="
            diffData?.find((e) => e.qid === qua.qid && e.other_name === qua.other_name)
              ?.expiration_date
          "
        />
      </v-col>
    </v-row>

    <DiffTextField
      v-model="qua.qualification_number"
      label="登録番号"
      :original="
        diffData?.find((e) => e.qid === qua.qid && e.other_name === qua.other_name)
          ?.qualification_number
      "
    />

    <h4>資格証明書等</h4>
    <QrMobileImageField
      decsription="qualification"
      v-model:fileObjArray="qua.fileObjArray"
      :ref="(el) => setRef(el, qua, 'imageRef')"
      title="資格証明書"
    />
    <div style="margin-top: 10px;">
      <ImageView :fk-id="`qualification_${staffId}_${qua.qid}`" max-height="200" />
    </div>

    <div v-show="qualList.find((e) => e.value === qua.qid)?.image_num > 1">
      <h4>資格証明書裏面</h4>
      <QrMobileImageField
        decsription="qualification"
        title="資格証明書裏面"
        v-model:fileObjArray="qua.fileObjArray2"
        :ref="(el) => setRef(el, qua, 'imageRef2')"
      />
      <div style="margin-top: 10px;">
        <ImageView :fk-id="`qualification2_${staffId}_${qua.qid}`" max-height="200" />
      </div>
    </div>

    <v-row style="margin-top: 10px">
      <v-col cols="12">
        <v-btn @click="addQua" color="success">追加</v-btn>
        <v-btn
          @click="removeQua(index)"
          v-if="localData.length > 1"
          style="margin-left: 50px;"
          color="#d9534f"
        >
          削除
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.depContainer {
  border: 1px black solid;
  padding: 5px;
  padding-bottom: 20px;
}
</style>
