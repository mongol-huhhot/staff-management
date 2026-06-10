// stores/appConfig.js
// This file defines a Pinia store for managing the application configuration.
// It provides a structured way to handle global configuration values that are immutable.
// The configuration values can be loaded from a global `window.appConfig` object, which is assumed to be set before the store is used.
// The store includes properties like `userid`, `staff_code`, and various flags that control the behavior of the application, such as whether staff input is allowed or if user registration is enabled.
// The store can be used in the main application file to load the configuration values when the application starts.
// by chen, 2025/07/01
import { defineStore } from 'pinia'

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
