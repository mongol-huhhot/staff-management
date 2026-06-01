<script setup>
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
const isFocused = ref(false);

const emit = defineEmits(['update:modelValue', 'input']);

const props = defineProps({
  modelValue: String,
  original: String,
  label: String,
  disabled: Boolean,
  type: String,
  rules: Array,
  isDate: Boolean,
  message: String,
  density: {
    type: String,
    default: 'compact',
  }
});

// Use a local ref for the input value
// const localValue = ref(props.modelValue);

// // Update localValue when modelValue prop changes
// watch(() => props.modelValue, (newVal) => {
//   localValue.value = newVal;
// });

const localValue = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val);
    emit('input', val);
  }
});

const messageText = computed(() => {
  if (props.message) return props.message;
  if (props.isDate) return 'YYYYMMDDまたはYYYY-MM-DDで入力してください (例:2024-01-02)';
  return '';
});

const onfocus = (focus) => {
  isFocused.value = focus;
  if (!focus) {
    blurEvents();
  }
};

const blurEvents = () => {
  if (props.isDate) {
    formatDate();
  }
};

const formatDate = () => {
  if (!localValue.value) return;
  
  // Format only if value is not already in YYYY-MM-DD format
  if (dayjs(localValue.value, 'YYYY-MM-DD', true).isValid()) {
    // Already in correct format
    emit('update:modelValue', localValue.value);
    return;
  }
  
  // Try parsing as YYYYMMDD
  if (dayjs(localValue.value, 'YYYYMMDD', true).isValid()) {
    const formatted = dayjs(localValue.value).format('YYYY-MM-DD');
    localValue.value = formatted;
    emit('update:modelValue', formatted);
  } else {
    // Invalid date, keep as-is but emit the value
    emit('update:modelValue', localValue.value);
  }
};

// Emit input event on every change
watch(localValue, (newVal) => {
  emit('input', newVal);
});
</script>

<template>
  <div>
    <div v-if="isFocused && messageText" style="font-size: 0.83em; color: cadetblue;">
      {{ messageText }}
    </div>
    <div v-else-if="(original || localValue) && original !== localValue" style="font-size: 0.83em; color: cadetblue;">
      既存値：{{ original }}
    </div>
    <div v-else style="font-size: 0.83em;">　</div>
    
    <v-text-field
      v-model="localValue"
      :density="density"
      :label="label"
      :rules="rules"
      :disabled="disabled"
      :type="type"
      @update:focused="onfocus"
    />
  </div>
</template>