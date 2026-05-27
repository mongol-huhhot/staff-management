// src/stores/BaseStore.js
// Compatibility wrapper. New code should import useDbStore directly.
import { defineStore } from 'pinia'
import { useDbStore } from '@/stores/useDbStore.js'
import { showSnackbar } from '@/utils/Snackbar.vue'

export const useBaseStore = defineStore('baseStore', () => {
  const db = useDbStore()
  db.setNotifier(showSnackbar)

  return {
    tid: db.commonParams.tid,
    sql_path: db.commonParams.SQL_PATH,
    login: db.login,
    verify: db.verify,
    logout: db.logout,
    load: db.load,
    execute: db.execute,
    save: db.save,
    excecuteMultiQuery: db.excecuteMultiQuery,
    executeMultiQuery: db.executeMultiQuery,
    loopExecute: db.loopExecute,
    getId: db.uniqueId,
    loadImage: async (sqltag, params = {}) => db.dbAccess(sqltag, params),
  }
})
