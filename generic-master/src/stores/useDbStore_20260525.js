// src/stores/useDbStore.js
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useDbStore = defineStore('dbStore', () => {
  const RETURN = 1
  const RESULT_TYPE = 1
  const QUERY_TYPE = 2

  const states = reactive({
    loading: false,
    currentRow: null,
    lastError: null,
  })

  const commonConstants = reactive({
    TRANSACTION_URL: '/dataEngine/v5/requestHandler.php',
    LOGIN_URL: '/dataEngine/v5/requestHandler.php',
    LOGOUT_URL: '/dataEngine/v5/requestHandler.php',
    VERIFY_URL: '/dataEngine/v5/requestHandler.php',
  })

  const commonParams = reactive({
    RETURN,
    RESULT_TYPE,
    QUERY_TYPE,
    SQL_PATH: '',
    tid: 'premier',
  })

  const notifier = ref(null)
  const setNotifier = (fn) => { if (typeof fn === 'function') notifier.value = fn }
  const notify = (message, type = 'info') => {
    try { notifier.value?.(message, type) } catch (_) {}
  }

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  const saveToken = (token, persist = false) => {
    if (!token) return
    sessionStorage.setItem('token', token)
    if (persist) localStorage.setItem('token', token)
  }
  const clearToken = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  const joinPath = (a = '', b = '') => `${String(a).replace(/\/$/, '')}/${String(b).replace(/^\//, '')}`

  const detectTenantId = () => {
    if (typeof window === 'undefined') return commonParams.tid

    const fromGlobal = window.__SURUPAS_CONFIG__?.tid
    const fromAttr = document.currentScript?.dataset?.tid
    const segs = window.location.pathname.split('/').filter(Boolean)
    const fromPath = segs[0]

    commonParams.tid = fromGlobal || fromAttr || fromPath || commonParams.tid
    return commonParams.tid
  }

  const configure = ({ tid, sqlPath, transactionUrl, loginUrl, logoutUrl, verifyUrl } = {}) => {
    if (tid) commonParams.tid = tid
    else detectTenantId()
    if (sqlPath) commonParams.SQL_PATH = sqlPath
    if (transactionUrl) commonConstants.TRANSACTION_URL = transactionUrl
    if (loginUrl) commonConstants.LOGIN_URL = loginUrl
    if (logoutUrl) commonConstants.LOGOUT_URL = logoutUrl
    if (verifyUrl) commonConstants.VERIFY_URL = verifyUrl
  }

  const endpoint = (url) => {
    const tid = detectTenantId()
    // Vite dev proxy では /dataEngine... をそのまま使うほうが便利な場合がある。
    if (import.meta?.env?.DEV && import.meta?.env?.VITE_USE_TID_PREFIX !== 'true') return url
    return joinPath(`/${tid}`, url)
  }

  const normalizeJsonBody = (payload) => ({ json_string: payload })

  const access = async (url, body, { requireAuth = true, timeoutMs = 30000 } = {}) => {
    states.loading = true
    states.lastError = null
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const headers = { 'Content-Type': 'application/json' }
      const token = getToken()
      if (requireAuth && token) headers.Authorization = `Bearer ${token}`
      if (requireAuth && !token) throw new Error('Authorization Bearer token is missing.')

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body ?? {}),
        signal: controller.signal,
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      return data
    } catch (e) {
      states.lastError = e
      throw e
    } finally {
      clearTimeout(timer)
      states.loading = false
    }
  }

  const buildCommon = (SQL_PATH = null) => ({
    ...commonParams,
    tid: detectTenantId(),
    SQL_PATH: SQL_PATH || commonParams.SQL_PATH,
  })

  const dbAccess = async (sqltag, params = {}, options = {}, SQL_PATH = null, URL = null) => {
    const payload = {
      COMMON: buildCommon(SQL_PATH),
      [sqltag]: { SQL_TAG: sqltag, ...params },
    }
    const resp = await access(endpoint(URL || commonConstants.TRANSACTION_URL), normalizeJsonBody(payload), {
      requireAuth: options.requireAuth ?? true,
      timeoutMs: options.timeoutMs ?? 30000,
    })
    options.onSuccess?.(resp)
    return resp
  }

  const dbAccessWithMultiTags = async (params = {}, options = {}, SQL_PATH = null, URL = null) => {
    const payload = { COMMON: buildCommon(SQL_PATH), ...params }
    const resp = await access(endpoint(URL || commonConstants.TRANSACTION_URL), normalizeJsonBody(payload), {
      requireAuth: options.requireAuth ?? true,
      timeoutMs: options.timeoutMs ?? 30000,
    })
    options.onSuccess?.(resp)
    return resp
  }

  const loopExecute = async (sqltag, loopRows = [], params = {}, options = {}, SQL_PATH = null) => {
    return dbAccess(sqltag, { ...params, LOOP: loopRows }, options, SQL_PATH)
  }

  const login = async (sqltag, params = {}, options = {}, SQL_PATH = null) => {
    const payload = {
      COMMON: buildCommon(SQL_PATH),
      [sqltag]: { SQL_TAG: sqltag, ...params },
    }
    const resp = await access(endpoint(commonConstants.LOGIN_URL), normalizeJsonBody(payload), {
      requireAuth: false,
      timeoutMs: options.timeoutMs ?? 30000,
    })
    if (resp?.token) saveToken(resp.token, !!options.persist)
    options.onSuccess?.(resp)
    return resp
  }

  const verify = async () => {
    try {
      if (!getToken()) return false
      const resp = await access(endpoint(commonConstants.VERIFY_URL), {}, { requireAuth: true })
      return !!resp?.valid || resp?.code === 0
    } catch (_) {
      clearToken()
      return false
    }
  }

  const logout = async () => {
    try { await access(endpoint(commonConstants.LOGOUT_URL), {}, { requireAuth: false }) } catch (_) {}
    clearToken()
  }

  const load = async (sqltag, params = {}, options = {}) => {
    try {
      const resp = await dbAccess(sqltag, params, options)
      if (resp?.code !== 0) throw new Error(resp?.message || 'DB error')
      const result = resp.result?.[sqltag]
      if (!result || result.code !== 0) throw new Error(result?.message || 'SQL error')
      if (!result.result || result.result.length === 0) {
        if (options.emptyMessage !== false) notify('条件に当てはまるデータはありませんでした。', 'warning')
        return []
      }
      return result.result
    } catch (e) {
      notify(e.message || 'エラーが発生しました。', 'error')
      return null
    }
  }

  const execute = async (sqltag, params = {}, options = {}) => {
    try {
      const resp = await dbAccess(sqltag, params, options)
      const result = resp?.result?.[sqltag]
      const arr = Array.isArray(result) ? result : [result].filter(Boolean)
      const errors = arr.filter((r) => r?.code !== 0)
      if (resp?.code !== 0 || errors.length) throw new Error(resp?.message || errors[0]?.message || 'DB error')
      if (options.successMessage !== false) notify('データ処理をしました。', 'success')
      return true
    } catch (e) {
      notify(e.message || 'データ処理にエラーが発生しました。', 'error')
      return false
    }
  }

  const executeMultiQuery = async (params = {}, options = {}) => {
    try {
      const resp = await dbAccessWithMultiTags(params, options)
      if (resp?.code !== 0) throw new Error(resp?.message || 'DB error')
      return resp.result
    } catch (e) {
      notify(e.message || 'エラーが発生しました。', 'error')
      return null
    }
  }

  const excecuteMultiQuery = executeMultiQuery // existing typo compatibility
  const save = execute
  const uniqueId = (prefix = '') => `${prefix}${prefix ? '_' : ''}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  configure()
  if (!commonParams.SQL_PATH) commonParams.SQL_PATH = `${commonParams.tid}/generic-folder/attentanceMerged.sql`

  return {
    states,
    commonConstants,
    commonParams,
    configure,
    setNotifier,
    notify,
    getToken,
    saveToken,
    clearToken,
    dbAccess,
    dbAccessWithMultiTags,
    loopExecute,
    login,
    verify,
    logout,
    load,
    execute,
    save,
    executeMultiQuery,
    excecuteMultiQuery,
    uniqueId,
  }
})
