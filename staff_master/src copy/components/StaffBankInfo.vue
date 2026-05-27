<script setup>
import DiffTextField from './DiffTextField.vue';
import DiffSelect from './DiffSelect.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        required: true,
    },
    diffData: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['update:modelValue']);

// Helper function to update a specific field in the modelValue object
const updateField = (field, value) => {
  const updatedValue = { ...props.modelValue, [field]: value };
  emit('update:modelValue', updatedValue);
};
</script>

<template>
  <v-form>
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="modelValue.bank_name"
          label="銀行名"
          density="compact"
          :original="props.diffData?.bank_name"
          @update:model-value="(value) => updateField('bank_name', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="modelValue.bank_code"
          label="銀行コード"
          density="compact"
          :original="props.diffData?.bank_code"
          @update:model-value="(value) => updateField('bank_code', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="modelValue.branch_name"
          label="支店名"
          density="compact"
          :original="props.diffData?.branch_name"
          @update:model-value="(value) => updateField('branch_name', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="modelValue.branch_code"
          label="支店コード"
          density="compact"
          :original="props.diffData?.branch_code"
          @update:model-value="(value) => updateField('branch_code', value)"
        ></DiffTextField>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" md="3">
        <DiffSelect
          :model-value="modelValue.bank_account_type"
          label="預金種別"
          :items="[
            { title: '普通', value: '0' },
            { title: '当座', value: '1' },
            { title: '貯蓄', value: '2' },
          ]"
          density="compact"
          :original="props.diffData?.bank_account_type"
          @update:model-value="(value) => updateField('bank_account_type', value)"
        ></DiffSelect>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="modelValue.bank_account"
          label="口座番号"
          density="compact"
          :original="props.diffData?.bank_account"
          @update:model-value="(value) => updateField('bank_account', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="modelValue.bank_account_kana"
          label="口座名義人"
          density="compact"
          :original="props.diffData?.bank_account_kana"
          @update:model-value="(value) => updateField('bank_account_kana', value)"
        ></DiffTextField>
      </v-col>
    </v-row>
    <h2 style="margin-top: 20px;">その他申請情報</h2>
    <v-row>
      <v-col cols="12" md="3">
        <DiffSelect
          :model-value="modelValue.self_type"
          label="障害者区分"
          :items="[
            { title: '障害者でない', value: '' },
            { title: '一般障害者', value: '1' },
            { title: '特別障害者', value: '2' },
          ]"
          density="compact"
          :original="props.diffData?.self_type"
          @update:model-value="(value) => updateField('self_type', value)"
        ></DiffSelect>
      </v-col>
      <v-col cols="12" md="9">
        <DiffTextField
          :model-value="modelValue.disabled_remark"
          label="障害者詳細"
          density="compact"
          :original="props.diffData?.disabled_remark"
          @update:model-value="(value) => updateField('disabled_remark', value)"
        ></DiffTextField>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="3">
        <DiffSelect
          :model-value="modelValue.widow_type"
          label="ひとり親・寡婦"
          :items="[
            { title: '対象外', value: '' },
            { title: 'ひとり親', value: '1' },
            { title: '寡婦', value: '2' },
          ]"
          density="compact"
          :original="props.diffData?.widow_type"
          @update:model-value="(value) => updateField('widow_type', value)"
        ></DiffSelect>
      </v-col>
      <v-col cols="12" md="9">
        <DiffTextField
          :model-value="modelValue.widow_remark"
          label="ひとり親・寡婦詳細"
          density="compact"
          :original="props.diffData?.widow_remark"
          @update:model-value="(value) => updateField('widow_remark', value)"
        ></DiffTextField>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4">
        <DiffSelect
          :model-value="modelValue.working_student_flag"
          label="勤労学生区分"
          :items="[
            { title: '対象外', value: '' },
            { title: '勤労学生', value: '1' },
          ]"
          density="compact"
          :original="props.diffData?.working_student_flag"
          @update:model-value="(value) => updateField('working_student_flag', value)"
        ></DiffSelect>
      </v-col>
      <v-col cols="12" md="4">
        <DiffTextField
          :model-value="modelValue.working_school_name"
          label="勤労学生詳細（学校名）"
          density="compact"
          :original="props.diffData?.working_school_name"
          @update:model-value="(value) => updateField('working_school_name', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="12" md="4">
        <DiffTextField
          :model-value="modelValue.working_admission_date"
          label="勤労学生詳細（入学年月日）"
          density="compact"
          :original="props.diffData?.working_admission_date"
          type="tel"
          :is-date="true"
          @update:model-value="(value) => updateField('working_admission_date', value)"
        ></DiffTextField>
      </v-col>
    </v-row>
  </v-form>
</template>