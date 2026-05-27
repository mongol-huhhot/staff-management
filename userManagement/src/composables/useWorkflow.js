import { ref, computed } from 'vue'

const workflowDef = ref(null)
const currentStepId = ref('')
const userRole = ref('')
const context = ref({}) // optional, for conditions like amount, department, etc.

export function useWorkflow() {
  const loadWorkflow = (definition, userRoleInput, initialStepId, ctx = {}) => {
    workflowDef.value = definition
    currentStepId.value = initialStepId
    userRole.value = userRoleInput
    context.value = ctx
  }

  const getStepById = (id) => {
    return workflowDef.value?.steps?.find(step => step.id === id) || null
  }

  const currentStep = computed(() => getStepById(currentStepId.value))

  const isFinal = computed(() => currentStep.value?.final === true)

  const canAct = (action) => {
    if (!currentStep.value || !currentStep.value.actions) return false
    if (currentStep.value.role && currentStep.value.role !== userRole.value) return false

    if (!currentStep.value.actions.includes(action)) return false

    // check optional conditions
    const cond = currentStep.value.conditions || {}
    if (cond.max_amount && context.value.amount > cond.max_amount) return false

    return true
  }

  const performAction = (action) => {
    if (!canAct(action)) return false

    const next = currentStep.value?.next
    if (typeof next === 'string') {
      currentStepId.value = next
    } else if (typeof next === 'object') {
      const nextStep = next[action]
      if (nextStep) currentStepId.value = nextStep
    }

    return true
  }

  return {
    loadWorkflow,
    currentStep,
    isFinal,
    canAct,
    performAction
  }
}

/* 
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
*/




// {
//   "workflow_id": "contract_approval_v1",
//   "name": "Contract Approval Workflow",
//   "description": "A 3-step approval process for contracts.",
//   "steps": [
//     {
//       "id": "draft",
//       "label": "Draft Submission",
//       "role": "applicant",
//       "actions": ["submit"],
//       "next": "team_leader_approval"
//     },
//     {
//       "id": "team_leader_approval",
//       "label": "Team Leader Approval",
//       "role": "team_leader",
//       "actions": ["approve", "reject"],
//       "conditions": {
//         "max_amount": 500000
//       },
//       "next": {
//         "approve": "department_manager_approval",
//         "reject": "rejected"
//       }
//     },
//     {
//       "id": "department_manager_approval",
//       "label": "Department Manager Approval",
//       "role": "department_manager",
//       "actions": ["approve", "reject"],
//       "next": {
//         "approve": "hq_final_approval",
//         "reject": "rejected"
//       }
//     },
//     {
//       "id": "hq_final_approval",
//       "label": "HQ Final Approval",
//       "role": "hq_manager",
//       "actions": ["approve", "reject"],
//       "next": {
//         "approve": "approved",
//         "reject": "rejected"
//       }
//     },
//     {
//       "id": "approved",
//       "label": "Approved",
//       "final": true
//     },
//     {
//       "id": "rejected",
//       "label": "Rejected",
//       "final": true
//     }
//   ]
// }
