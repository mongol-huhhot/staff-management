<template>
  <div
    v-if="hasApproved"
    class="d-flex align-center text-medium-emphasis mb-1 pl-1 field-history-label"
  >
    <v-icon size="x-small" color="grey-darken-1" class="mr-1">mdi-history</v-icon>
    <span>変更前：</span>
    <span
      class="ml-1 font-weight-bold"
      :class="{ 'text-decoration-line-through text-error': isChanged }"
    >
      {{ displayValue }}
    </span>
    <v-tooltip v-if="isChanged" text="値が変更されています" location="top">
      <template v-slot:activator="{ props: tooltipProps }">
        <v-icon v-bind="tooltipProps" size="x-small" color="warning" class="ml-1">
          mdi-alert-circle-outline
        </v-icon>
      </template>
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  field: { type: Object, required: true },
  approvedValue: { type: [String, Number, Boolean, Array, Object], default: undefined },
  currentValue: { type: [String, Number, Boolean, Array, Object], default: undefined },
})

function normalize(value) {
  if (value == null || value === '') return ''
  if (props.field.component === 'v-date-input' || props.field.type === 'date') {
    return String(value).replace(/\//g, '-').slice(0, 10)
  }
  return String(value)
}

const hasApproved = computed(() => normalize(props.approvedValue) !== '')

const isChanged = computed(
  () => hasApproved.value && normalize(props.approvedValue) !== normalize(props.currentValue)
)

// v-select などのコード値は items から表示名に変換（例：male → 男性）
const displayValue = computed(() => {
  const items = props.field.items || props.field.props?.items || []
  const titleKey =
    props.field.props?.itemTitle || props.field.props?.['item-title'] || 'label'
  const valueKey =
    props.field.props?.itemValue || props.field.props?.['item-value'] || 'value'

  const hit = items.find(item => String(item?.[valueKey]) === String(props.approvedValue))
  if (hit) return hit[titleKey] ?? hit.title ?? hit.label ?? props.approvedValue

  return props.approvedValue
})
</script>

<style scoped>
.field-history-label {
  font-size: 12px;
  min-height: 20px;
}
</style>
