## アプリ権限ロール構造  

### actionsの有効な項目  

| 項目 | 説明 |
| --- | --- |
| view | 閲覧権限 |
| edit | 編集権限 |
| approve | 承認権限 |
| submit | 保存権限 |
| download | データダウンロード権限 |
| upload | データアップロード権限 |
|  |  |



### キー変数定義  

リソース（resources）アクセス範囲を決めるための変数。  
これらの変数はアプリ利用者の関連する情報で入れ替えられる。  



| 項目 | 説明 |
| --- | --- |
| own_company_id | アプリ利用者会社識別ID。この変数はアプリ利用者の会社IDで入れ替えられる |
| own_department_id | アプリ利用者部署識別ID |
|  |  |


### ローロ定義  

```text
{
  "approval_flow": [
    {
      "step": "step_1",
      "label": "Team Leader Approval",
      "role": "team_leader"
    },
    {
      "step": "step_2",
      "label": "Department Manager Approval",
      "role": "department_manager"
    },
    {
      "step": "step_3",
      "label": "HQ Manager Final Approval",
      "role": "hq_manager"
    }
  ],
  "users": {
    "12334": {
      "actions": {
        "view": {
          "excludes": ["submit"]
        },
        "edit": {
          "includes": ["a", "b", "c"]
        },
        "approve": {
          "includes": ["step_1", "step_2"],
          "excludes": ["step_3"]
        }
      },
      "resources": {
        "filter": "company_id = <%own_company_id%>"
      }
    }
  },
  "groups": {
    "team_leader": {
      "actions": {
        "view": true,
        "edit": true,
        "approve": {
          "includes": ["step_1"]
        }
      },
      "resources": {
        "filter": "company_id = <%own_company_id%> AND department_id = <%own_department_id%>"
      }
    },
    "department_manager": {
      "actions": {
        "view": {
          "excludes": ["submit"]
        },
        "edit": {
          "includes": ["a", "b", "c"]
        },
        "approve": {
          "includes": ["step_2"]
        }
      },
      "resources": {
        "filter": "company_id = <%own_company_id%> AND department_id IN (SELECT department_id FROM get_department_descendants(<%own_company_id%>, <%own_department_id%>))"
      }
    },
    "hq_manager": {
      "actions": {
        "view": {
          "excludes": ["submit"]
        },
        "edit": {
          "includes": ["a", "b", "c"]
        },
        "approve": true
      },
      "resources": {
        "filter": "company_id = <%own_company_id%>"
      }
    },
    "hr_department_staff": {
      "actions": {
        "view": true,
        "edit": true
      },
      "resources": {
        "filter": "company_id = <%own_company_id%>"
      }
    }
  }
}  


```  

### usePermissions.js説明  


| Feature                        | Supported                 |
| ------------------------------ | ------------------------- |
| `view`, `edit`, `delete` check | ✅ `can()` API             |
| Approval step check            | ✅ `canApproveStep(step)`  |
| Per-step role resolution       | ✅ `getApprovalStep(step)` |
| User’s own approval steps      | ✅ `getMyApprovalSteps()`  |
| Resource-level filter          | ✅ `getResourceFilter()`   |
|  |  |   




### usePermissions.js  

```text
import { ref } from 'vue'

const roleDefs = ref(null) // full app role definition
const userId = ref('')
const userRoles = ref([])
const contextVars = ref({})

export function usePermissions() {
  // Load roles, user info, and context
  const loadPermissions = async (def, uid, roles, ctxVars) => {
    roleDefs.value = def
    userId.value = uid
    userRoles.value = roles
    contextVars.value = ctxVars
  }

  // Merge group and user permissions
  const getMergedPermissions = () => {
    const result = { actions: {}, resources: {} }

    if (!roleDefs.value) return result

    // Merge from group roles
    for (const roleName of userRoles.value) {
      const group = roleDefs.value.groups?.[roleName]
      if (!group) continue
      Object.assign(result.actions, group.actions || {})
      if (group.resources?.filter) {
        result.resources.filter = group.resources.filter
      }
    }

    // Override with user-specific permissions
    const user = roleDefs.value.users?.[userId.value]
    if (user) {
      Object.assign(result.actions, user.actions || {})
      if (user.resources?.filter) {
        result.resources.filter = user.resources.filter
      }
    }

    return result
  }

  // Generic permission checker
  const can = (action, item = '') => {
    const perms = getMergedPermissions()
    const rule = perms.actions?.[action]

    if (!rule) return false
    if (rule === true) return true
    if (rule.includes && !rule.includes.includes(item)) return false
    if (rule.excludes && rule.excludes.includes(item)) return false

    return true
  }

  // Approve step checker: checks if user is allowed to approve this step
  const canApproveStep = (step) => {
    return can('approve', step)
  }

  // Get approval step definition from approval_flow
  const getApprovalStep = (step) => {
    return roleDefs.value?.approval_flow?.find(s => s.step === step) || null
  }

  // Get approval step for a specific user (for UI display or responsibility checks)
  const getMyApprovalSteps = () => {
    const steps = roleDefs.value?.approval_flow || []
    return steps.filter(step => userRoles.value.includes(step.role))
  }

  // Get resource filter (after replacing placeholders)
  const getResourceFilter = () => {
    const filter = getMergedPermissions().resources?.filter || 'true'

    return Object.entries(contextVars.value).reduce((acc, [key, value]) => {
      return acc.replace(new RegExp(`<%${key}%>`, 'g'), value)
    }, filter)
  }

  return {
    loadPermissions,
    can,
    canView: (item = '') => can('view', item),
    canEdit: (item = '') => can('edit', item),
    canDelete: (item = '') => can('delete', item),
    canApproveStep,
    getApprovalStep,
    getMyApprovalSteps,
    getResourceFilter
  }
}

```  

### full sample  

```text

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
const {
  loadPermissions,
  canView,
  canEdit,
  canApproveStep,
  getApprovalStep,
  getMyApprovalSteps,
  getResourceFilter
} = usePermissions()

// Simulated user info
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
</script>

```  




### commono configurations in hr apps

```text
🧩 1. Company & Organization Settings  

Configuration	Purpose
Company name, address, logo	Display and printing
Organization tree (departments)	For structuring hierarchy, approval flow
Business units / locations	Needed for work site management
Custom department codes/names	Localized naming conventions

👤 2. Staff Master & Roles
Configuration	Purpose
Staff number auto-increment format	"EMP0001", etc.
Staff statuses (active, retired)	For filtering and reporting
Job grades / positions	For salary tier or approval rights
Contract types	Full-time, Part-time, Intern, etc.
Permission roles	Role-based access control

🕒 3. Time & Attendance Settings
Configuration	Purpose
Working hours per day / week	For shift and overtime calculation
Holidays / non-working days calendar	Paid leave, shift validation
Late / early / absence rules	Penalty calculation or warnings
Break policies (auto or manual)	Regulation compliance
Work shift patterns	Morning / Evening / Split shift
Allowed shift assignment days ahead	For planning & self-booking

📝 4. Leave Management Settings
Configuration	Purpose
Leave types (paid, sick, maternity)	User request options
Leave unit (hour/day)	Hour-based leave supported?
Granting rules (fixed date, join date)	Compliance with labor law
Expiration period	E.g., 2-year validity in Japan
Maximum carry-over days	Limits for next year
Approval flow configuration	One-step / multi-step workflow

💰 5. Payroll & Compensation Settings
Configuration	Purpose
Salary items (base, bonus, etc.)	Calculation formula management
Tax rate settings	Varies by region or status
Social insurance options	Required for official payroll
Hourly rate vs monthly	Per contract
Overtime/allowance calculation	Based on actual attendance
Deduction rules	Absence or late penalty

🔐 6. Security & Access Control
Configuration	Purpose
Login method (ID/password, SSO)	Authentication flexibility
Password policy (length, expiry)	Security compliance
Access rights per module	e.g., Only HR can see salary
Action-based permissions	can_view, can_edit, can_approve
Terminal/device restriction	For attendance logging (PWA/Kiosk)

🔄 7. Workflow & Automation
Configuration	Purpose
Approval steps per application type	Multi-step approval per form
Auto-forwarding / delegation rules	Handle absence of approver
Escalation deadlines	If not approved in X days
Notification preferences	Email, Slack, in-app
Finalization conditions	Prevent saving incomplete forms

🌏 8. Localization & Customization
Configuration	Purpose
Multi-language support	Japanese, English, etc.
Date & time format	YYYY-MM-DD, MM/DD/YYYY
Currency and units	Salary in JPY, USD, etc.
Field label customization	Rename "Staff" to "Employee", etc.
Template editor for contracts/forms	Dynamic placeholders for export

📦 9. Integration & External Systems
Configuration	Purpose
API tokens / keys	External system integration
CSV import/export field mapping	Data interchange with payroll/tax
Attendance device setup	e.g., QR/IC card terminals
ERP/Payroll system linkage	Like OBIC, SAP, or Yayoi

```  



