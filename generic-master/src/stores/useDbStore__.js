// stores/useDbStore.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

/**
 * useDbStore
 * 既存 DBConnectionStore の互換 API を維持した整理版。
 * 維持:
 *  - dbAccess(sqltag, params)
 *  - dbAccessWithMultiTags(params)
 *  - executeMultiQuery / excecuteMultiQuery
 *  - login / verify / logout
 *  - LOOP は params の中にそのまま渡す
 *  - Vite / WebComponent 両方で tenant URL を解決
 */
export const useDbStore = defineStore('dbStore', () => {
  const RETURN = 1
  const RESULT_TYPE = 1
  const QUERY_TYPE = 2

  const commonConstants = reactive({
    TRANSACTION_URL: '/dataEngine/v5/handleRequest/requestHandler.php',
    LOGIN_URL: '/dataEngine/v5/handleRequest/login.php',
    LOGOUT_URL: '/dataEngine/v5/handleRequest/logout.php',
    VERIFY_URL: '/dataEngine/v5/handleRequest/verify.php',
  })

  const commonParams = reactive({
    RETURN,
    RESULT_TYPE,
    QUERY_TYPE,
    SQL_PATH: '',
    tid: 'janga_vue_base_system',
  })

  let notifier = null
  const setNotifier = (fn) => { if (typeof fn === 'function') notifier = fn }
  const notify = (message, level = 'info') => { try { notifier?.(message, level) } catch (_) {} }

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

  const joinPath = (a = '', b = '') => `${String(a).replace(/\/+$/, '')}/${String(b).replace(/^\/+/, '')}`

  const detectTid = () => {
    if (typeof window === 'undefined') return commonParams.tid
    const explicit = window.__SURUPAS__?.tid || window.__TENANT_ID__
    if (explicit) {
      commonParams.tid = explicit
      return explicit
    }
    const segs = window.location.pathname.split('/').filter(Boolean)
    if (segs[0]) commonParams.tid = segs[0]
    return commonParams.tid
  }

  const init = ({ tid = null, sqlPath = null, endpoints = null } = {}) => {
    if (tid) commonParams.tid = tid
    else detectTid()
    if (sqlPath) commonParams.SQL_PATH = sqlPath
    else if (!commonParams.SQL_PATH) commonParams.SQL_PATH = `${commonParams.tid}/generic-folder/genericShiftSqlTemplate.sql`
    if (endpoints) Object.assign(commonConstants, endpoints)
  }

  const buildUrl = (endpoint) => {
    const tid = detectTid()
    // 開発 proxy でも本番配置でも /:tid/dataEngine/... に統一
    return joinPath(`/${tid}`, endpoint)
  }

  const access = async (url, jsonBody, { requireAuth = true, timeoutMs = 30000 } = {}) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (requireAuth) {
        const token = getToken()
        if (!token) throw new Error('Authorization Bearer token is missing.')
        headers.Authorization = `Bearer ${token}`
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(jsonBody ?? {}),
        signal: controller.signal,
      })
      const text = await response.text()
      const data = text ? JSON.parse(text) : null
      if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
      return data
    } finally {
      clearTimeout(timer)
    }
  }

  const normalizeSqlParams = (sqltag, params = {}) => ({
    SQL_TAG: params.SQL_TAG || params.SQLTAG || sqltag,
    ...params,
  })

  const dbAccess = async (sqltag, params = {}, options = {}, SQL_PATH = null, URL = null) => {
    const payload = {
      COMMON: { ...commonParams, SQL_PATH: SQL_PATH || commonParams.SQL_PATH },
      [sqltag]: normalizeSqlParams(sqltag, params),
    }
    const resp = await access(buildUrl(URL || commonConstants.TRANSACTION_URL), { json_string: payload }, { requireAuth: options.requireAuth ?? true })
    options.onSuccess?.(resp)
    return resp
  }

  const dbAccessWithMultiTags = async (params = {}, options = {}, SQL_PATH = null, URL = null) => {
    const payload = {
      COMMON: { ...commonParams, SQL_PATH: SQL_PATH || commonParams.SQL_PATH },
      ...params,
    }
    // 各 tag に SQL_TAG が無い場合も key から補完する
    Object.keys(payload).forEach((key) => {
      if (key !== 'COMMON' && payload[key] && typeof payload[key] === 'object') {
        payload[key] = normalizeSqlParams(key, payload[key])
      }
    })
    const resp = await access(buildUrl(URL || commonConstants.TRANSACTION_URL), { json_string: payload }, { requireAuth: options.requireAuth ?? true })
    options.onSuccess?.(resp)
    return resp
  }

  const login = async (sqltag, params = {}, options = {}, SQL_PATH = null) => {
    const payload = {
      COMMON: { ...commonParams, SQL_PATH: SQL_PATH || commonParams.SQL_PATH },
      [sqltag]: normalizeSqlParams(sqltag, params),
    }
    const resp = await access(buildUrl(commonConstants.LOGIN_URL), { json_string: payload }, { requireAuth: false })
    if (resp?.token) saveToken(resp.token, !!options.persist)
    options.onSuccess?.(resp)
    return resp
  }

  const verify = async () => {
    try {
      if (!getToken()) return false
      const resp = await access(buildUrl(commonConstants.VERIFY_URL), {}, { requireAuth: true })
      return !!resp?.verified || resp?.code === 0
    } catch (_) {
      return false
    }
  }

  const logout = async () => {
    try { await access(buildUrl(commonConstants.LOGOUT_URL), {}, { requireAuth: false }) } catch (_) {}
    clearToken()
  }

  const load = async (sqltag, param = {}) => {
    try {
      const resp = await dbAccess(sqltag, param)
      const r = resp?.result?.[sqltag]
      if (resp?.code !== 0 || !r || r.code !== 0) {
        notify('データ取得にエラーが発生しました。', 'error')
        return null
      }
      if (!r.result || r.result.length === 0) {
        notify('条件に当てはまるデータはありませんでした。', 'warning')
        return null
      }
      return r.result
    } catch (e) {
      notify(e.message || 'エラーが発生しました。', 'error')
      return null
    }
  }

  const execute = async (sqltag, params = {}) => {
    try {
      const resp = await dbAccess(sqltag, params)
      const r = resp?.result?.[sqltag]
      const arr = Array.isArray(r) ? r : [r].filter(Boolean)
      if (resp?.code !== 0 || arr.some((x) => x?.code !== 0)) {
        notify('データ処理にエラーが発生しました。', 'error')
        return null
      }
      notify('データ処理をしました。', 'success')
      return true
    } catch (e) {
      notify(e.message || 'エラーが発生しました。', 'error')
      return null
    }
  }

  const executeMultiQuery = async (params = {}, options = {}) => {
    try {
      const resp = await dbAccessWithMultiTags(params, options)
      if (resp?.code !== 0) {
        notify('データ取得にエラーが発生しました。', 'error')
        return null
      }
      return resp.result
    } catch (e) {
      notify(e.message || 'エラーが発生しました。', 'error')
      return null
    }
  }

  // 既存 typo 互換
  const excecuteMultiQuery = executeMultiQuery
  const save = execute
  const setTenantId = (tid) => { if (tid) commonParams.tid = String(tid) }
  const setSQLPath = (sqlPath) => { commonParams.SQL_PATH = sqlPath || '' }
  const uniqueId = (prefix = '') => `${prefix}${prefix ? '_' : ''}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  init()

  return {
    commonConstants,
    commonParams,
    init,
    setNotifier,
    notify,
    getToken,
    saveToken,
    clearToken,
    setTenantId,
    setSQLPath,
    dbAccess,
    dbAccessWithMultiTags,
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
