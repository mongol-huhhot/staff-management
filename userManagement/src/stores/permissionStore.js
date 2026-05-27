import { defineStore } from 'pinia'

export const usePermissionStore = defineStore('permissionStore', {
  state: () => ({
    appRoles: {}, // e.g., { "staff_info_app": { approval_flow, users, groups } }
  }),

  actions: {
    async loadRoles(appId) {
      // Fetch roles from server or load statically
      const res = await fetch(`/api/roles/${appId}`)
      const json = await res.json()
      this.appRoles[appId] = json
    },

    getRoles(appId) {
      return this.appRoles[appId] || null
    }
  }
})
