<script setup>
import DiffTextField from './DiffTextField.vue';
import DiffSelect from './DiffSelect.vue';
import DynamicSelectBoxDiff from './DynamicSelectBoxDiff.vue';

const props = defineProps({
    modelValue: {
        type: Array,
        required: true,
        default: () => [],
    },
    diffData: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['update:modelValue']);

// Helper function to update a specific field in a dependent object
const updateDepField = (index, field, value) => {
  const updatedArray = [...props.modelValue];
  updatedArray[index] = { ...updatedArray[index], [field]: value };
  emit('update:modelValue', updatedArray);
};

// Helper function to get original data for a dependent by ID
const getOriginalData = (id) => {
  return props.diffData?.find((e) => e.id === id);
};

// Add a new dependent
const addDep = () => {
  const maxId = props.modelValue.reduce((max, dep) => Math.max(max, dep.id || 0), 0);
  const newDep = { id: maxId + 1 };
  emit('update:modelValue', [...props.modelValue, newDep]);
};

// Remove a dependent by index
const removeDep = (index) => {
  const updatedArray = props.modelValue.filter((_, i) => i !== index);
  if (updatedArray.length === 0) {
    updatedArray.push({ id: 1 }); // Ensure at least one dependent exists
  }
  emit('update:modelValue', updatedArray);
};
</script>

<template>
   modelValue:  {{ props.modelValue }}
  <div v-for="(dep, index) in modelValue" :key="dep.id" class="depContainer">
    <div class="text-h6">家族情報{{ index + 1 }}</div>
    <v-row>
      <v-col cols="6" md="3">
        <DynamicSelectBoxDiff
          :model-value="dep.dependent_relationship"
          label="扶養者続柄"
          :original="getOriginalData(dep.id)?.dependent_relationship"
          sql-tag="get_relation_ship_no_himself"
          @update:model-value="(value) => updateDepField(index, 'dependent_relationship', value)"
        ></DynamicSelectBoxDiff>
      </v-col>
      <v-col cols="6" md="3">
        <DiffSelect
          :model-value="dep.dependent_tax_flg"
          label="税扶養区分"
          :items="[{ title: '対象', value: '1' }, { title: '対象外', value: '0' }]"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_tax_flg"
          @update:model-value="(value) => updateDepField(index, 'dependent_tax_flg', value)"
        ></DiffSelect>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_name"
          label="家族氏名"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_name"
          @update:model-value="(value) => updateDepField(index, 'dependent_name', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_name_kana"
          label="家族氏名カナ"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_name_kana"
          @update:model-value="(value) => updateDepField(index, 'dependent_name_kana', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_birthday"
          label="生年月日"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_birthday"
          type="tel"
          :is-date="true"
          @update:model-value="(value) => updateDepField(index, 'dependent_birthday', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffSelect
          :model-value="dep.dependent_gender"
          label="性別"
          :items="[{ title: '男', value: '1' }, { title: '女', value: '0' }]"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_gender"
          @update:model-value="(value) => updateDepField(index, 'dependent_gender', value)"
        ></DiffSelect>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_business"
          label="職業"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_business"
          @update:model-value="(value) => updateDepField(index, 'dependent_business', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffSelect
          :model-value="dep.dependent_together_flg"
          label="同居区分"
          :items="[{ title: '同居', value: '1' }, { title: '別居', value: '0' }]"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_together_flg"
          @update:model-value="(value) => updateDepField(index, 'dependent_together_flg', value)"
        ></DiffSelect>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_post_code"
          label="郵便番号"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_post_code"
          @input="dependentPostCodeStter(index)"
          @update:model-value="(value) => updateDepField(index, 'dependent_post_code', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_address_1"
          label="都道府県"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_address_1"
          @update:model-value="(value) => updateDepField(index, 'dependent_address_1', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_address_2"
          label="市区町村"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_address_2"
          @update:model-value="(value) => updateDepField(index, 'dependent_address_2', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_address_3"
          label="丁目番地"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_address_3"
          @update:model-value="(value) => updateDepField(index, 'dependent_address_3', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_address_4"
          label="建物名・部屋番号"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_address_4"
          @update:model-value="(value) => updateDepField(index, 'dependent_address_4', value)"
        ></DiffTextField>
      </v-col>
      <v-col cols="6" md="3">
        <DiffTextField
          :model-value="dep.dependent_address_kana"
          label="住所カナ"
          density="compact"
          :original="getOriginalData(dep.id)?.dependent_address_kana"
          @update:model-value="(value) => updateDepField(index, 'dependent_address_kana', value)"
        ></DiffTextField>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn @click="addDep" v-if="modelValue.length === index + 1" color="success">追加</v-btn>
        <v-btn @click="removeDep(index)" style="margin-left: 50px;" color="#d9534f">削除</v-btn>
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
