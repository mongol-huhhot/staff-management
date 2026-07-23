// stores/appConfig.js
import { defineStore } from 'pinia'
/***
 * a structured global config store.
 * in some case, we can load config from db.
 */
export const useAppConfigStore = defineStore('appConfig', {
  state: () => ({
    userid: '',
    staff_code: '',
    staff_input: false,
    approval_request: false,
    staff_deduction_share: false,
  }),
  actions: {
    loadFromWindow() {
      // copy from window.appConfig, assuming it's already available
      Object.assign(this, window.appConfig)
    },
    can(field)  {
      // check if the field is enabled in the config
      return this.excludes?.includes(field) ? false : true
    },
  }
})

// main.js
// import { useAppConfigStore } from './stores/appConfig'
// const configStore = useAppConfigStore()
// configStore.loadFromWindow()
