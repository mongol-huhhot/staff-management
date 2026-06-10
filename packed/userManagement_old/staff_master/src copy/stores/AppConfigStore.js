// stores/appConfig.js
import { defineStore } from 'pinia'
/***
 * a structured global confit store.
 * in some case, we can load config from db.
 * these items are immutable. 
 * they are original configuration value of system.
 */
export const useAppConfigStore = defineStore('appConfig', {
  // sample items. will be overwritten by app configuration values
  state: () => ({
    userid: '',
    staff_code: '',
    staff_input: false,
    approval_request: false,
    staff_deduction_share: false,
    user_register: false,
  }),
  actions: {
    loadFromWindow() {
      // copy from window.appConfig, assuming it's already available
      Object.assign(this, window.appConfig)
    }
  }
})

// main.js
// import { useAppConfigStore } from './stores/appConfig'
// const configStore = useAppConfigStore()
// configStore.loadFromWindow()

