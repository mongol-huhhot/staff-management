import { ref, computed } from 'vue'
import { usePermissionStore } from '@/stores/permissionStore.js'

const appId = ref('')
const userId = ref('')
const userRoles = ref<string[]>([])
const contextVars = ref<Record<string, string>>({})
const store = usePermissionStore()

export function usePermissions() {
  const loadPermissions = async (targetAppId: string, uid: string, roles: string[], ctxVars: Record<string, string>) => {
    appId.value = targetAppId
    userId.value = uid
    userRoles.value = roles
    contextVars.value = ctxVars

    if (!store.getRoles(appId.value)) {
      await store.loadRoles(appId.value)
    }
  }

  const roleDefs = computed(() => store.getRoles(appId.value))

  const getMergedPermissions = () => {
    const result = { actions: {}, resources: {} }
    const def = roleDefs.value
    if (!def) return result

    for (const role of userRoles.value) {
      const group = def.groups?.[role]
      if (group) {
        Object.assign(result.actions, group.actions || {})
        if (group.resources?.filter) {
          result.resources.filter = group.resources.filter
        }
      }
    }

    const user = def.users?.[userId.value]
    if (user) {
      Object.assign(result.actions, user.actions || {})
      if (user.resources?.filter) {
        result.resources.filter = user.resources.filter
      }
    }

    return result
  }

  const can = (action: string, item: string = '') => {
    const perms = getMergedPermissions()
    const rule = perms.actions?.[action]
    if (!rule) return false
    if (rule === true) return true
    if (rule.includes && !rule.includes.includes(item)) return false
    if (rule.excludes && rule.excludes.includes(item)) return false
    return true
  }

  const canApproveStep = (step: string) => can('approve', step)

  const getApprovalStep = (step: string) => {
    return roleDefs.value?.approval_flow?.find((s: any) => s.step === step) || null
  }

  const getMyApprovalSteps = () => {
    return (roleDefs.value?.approval_flow || []).filter((step: any) =>
      userRoles.value.includes(step.role)
    )
  }

  const getResourceFilter = () => {
    let filter = getMergedPermissions().resources?.filter || 'true'
    Object.entries(contextVars.value).forEach(([key, value]) => {
      filter = filter.replace(new RegExp(`<%${key}%>`, 'g'), value)
    })
    return filter
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
