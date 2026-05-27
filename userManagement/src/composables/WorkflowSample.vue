<script setup>
import { useWorkflow } from '@/composables/useWorkflow'

const {
  loadWorkflow,
  currentStep,
  isFinal,
  canAct,
  performAction
} = useWorkflow()

const workflowDefinition = await fetchWorkflowFromBackend() // or static import
loadWorkflow(workflowDefinition, 'department_manager', 'team_leader_approval', { amount: 400000 })

function approve() {
  if (canAct('approve')) {
    performAction('approve')
  } else {
    alert('You are not allowed to approve at this step.')
  }
}
</script>

<template>
  <div>
    <h3>Current Step: {{ currentStep?.label }}</h3>

    <button @click="approve" :disabled="!canAct('approve')">
      Approve
    </button>

    <p v-if="isFinal">✅ This workflow is completed.</p>
  </div>
</template>
