<template>
  <div>
    <h2>Permissions Test</h2>

    <!-- View Permission -->
    <div v-if="canView('a')">
      <p>You can <strong>view</strong> section A.</p>
    </div>
    <div v-else>
      <p>You <strong>cannot</strong> view section A.</p>
    </div>

    <!-- Edit Permission -->
    <div>
      <button :disabled="!canEdit('b')">Edit Section B</button>
    </div>

    <!-- Approval Steps -->
    <div>
      <h3>Approval Steps</h3>
      <ul>
        <li
          v-for="step in approvalFlow"
          :key="step.step"
        >
          <strong>{{ step.label }}:</strong>
          <span v-if="canApproveStep(step.step)">
            ✅ You can approve this step.
          </span>
          <span v-else>
            ❌ You cannot approve this step.
          </span>
        </li>
      </ul>
    </div>

    <!-- My Approval Responsibility -->
    <div>
      <h3>Your Responsible Steps</h3>
      <ul>
        <li v-for="step in mySteps" :key="step.step">
          {{ step.label }} ({{ step.step }})
        </li>
      </ul>
    </div>

    <!-- Resource Filter Preview -->
    <div>
      <h3>SQL Filter Applied</h3>
      <code>{{ getResourceFilter() }}</code>
    </div>
  </div>
</template>

<script setup>
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/stores/userStore'


// Sample data (simulate what you fetch from the backend)
const sampleRoleDef = {
  approval_flow: [
    { step: 'step_1', role: 'team_leader', label: 'Team Leader Approval' },
    { step: 'step_2', role: 'department_manager', label: 'Department Manager Approval' },
    { step: 'step_3', role: 'hq_manager', label: 'HQ Manager Final Approval' }
  ],
  users: {
    '12334': {
      actions: {
        view: { excludes: ['submit'] },
        edit: { includes: ['a', 'b', 'c'] },
        approve: { includes: ['step_1', 'step_2'], excludes: ['step_3'] }
      },
      resources: {
        filter: 'company_id = <%own_company_id%>'
      }
    }
  },
  groups: {
    team_leader: {
      actions: {
        view: true,
        edit: true,
        approve: { includes: ['step_1'] }
      },
      resources: {
        filter: 'company_id = <%own_company_id%> AND department_id = <%own_department_id%>'
      }
    },
    department_manager: {
      actions: {
        view: { excludes: ['submit'] },
        edit: { includes: ['a', 'b', 'c'] },
        approve: { includes: ['step_2'] }
      },
      resources: {
        filter: 'company_id = <%own_company_id%> AND department_id IN (SELECT department_id FROM get_department_descendants(<%own_company_id%>, <%own_department_id%>))'
      }
    },
    hq_manager: {
      actions: {
        view: { excludes: ['submit'] },
        edit: { includes: ['a', 'b', 'c'] },
        approve: true
      },
      resources: {
        filter: 'company_id = <%own_company_id%>'
      }
    }
  }
}

// Load permission system
// const {
//   loadPermissions,
//   canView,
//   canEdit,
//   canApproveStep,
//   getApprovalStep,
//   getMyApprovalSteps,
//   getResourceFilter
// } = usePermissions()

// // Simulated user info
const userId = '12334'
const userRoles = ['department_manager']
const contextVars = {
  own_company_id: '1000',
  own_department_id: '2001'
}

// Initialize permission system
await loadPermissions(sampleRoleDef, userId, userRoles, contextVars)

// Get approval steps
const approvalFlow = sampleRoleDef.approval_flow
const mySteps = getMyApprovalSteps()

const { loadPermissions, canView, canEdit, canApproveStep, getResourceFilter, getMyApprovalSteps } = usePermissions()

const userStore = useUserStore()

await loadPermissions(
  'staff_info_app',
  userStore.userId,
  userStore.roles,
  {
    own_company_id: userStore.companyId,
    own_department_id: userStore.departmentId
  }
)
</script>

