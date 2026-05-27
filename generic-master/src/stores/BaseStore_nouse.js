// stores/BaseStore.js
// 既存 import を壊さないための wrapper。
import { defineStore } from 'pinia'
import { useDbStore } from './useDbStore.js'

export const useBaseStore = defineStore('baseStore', () => {
  const dbStore = useDbStore()
  return {
    sql_path: dbStore.commonParams.SQL_PATH,
    tid: dbStore.commonParams.tid,
    login: dbStore.login,
    verify: dbStore.verify,
    logout: dbStore.logout,
    load: dbStore.load,
    execute: dbStore.execute,
    save: dbStore.save,
    excecuteMultiQuery: dbStore.excecuteMultiQuery,
    executeMultiQuery: dbStore.executeMultiQuery,
    getId: dbStore.uniqueId,
    setNotifier: dbStore.setNotifier,
    setTenantId: dbStore.setTenantId,
    setSQLPath: dbStore.setSQLPath,
  }
})
