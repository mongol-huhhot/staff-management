<script setup>
companySettings.useWorkflow = false
</script>
<template>
  <div>
    <h3>{{ currentStep?.label }}</h3>

    <button @click="create" :disabled="!canAct('create')">Create</button>
    <button @click="update" :disabled="!canAct('update')">Update</button>
    <button @click="finalize" :disabled="!canAct('finalize')">Finalize</button>
  </div>
</template>
