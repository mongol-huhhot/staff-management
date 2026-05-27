<script setup>
import { usePermissions } from '@/composables/usePermissions'

const {
  loadPermissions,
  canView,
  canEdit,
  canApproveStep,
  getApprovalStep,
  getMyApprovalSteps,
  getResourceFilter
} = usePermissions()

await loadPermissions(
  appRoleDefFromServer,
  '12334', // userId
  ['department_manager'],
  {
    own_company_id: '1000',
    own_department_id: '2001'
  }
)

console.log(canView('submit'))            // false
console.log(canEdit('b'))                 // true
console.log(canApproveStep('step_2'))     // true
console.log(getApprovalStep('step_2'))    // { step: 'step_2', role: 'department_manager', ... }
console.log(getMyApprovalSteps())         // e.g., [step_2]
console.log(getResourceFilter())          // company_id = 1000 AND department_id IN ...
</script>

