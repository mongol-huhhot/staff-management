// src/stores/useDbStore.js
import { defineStore } from 'pinia'
import { reactive, computed } from 'vue'
import { showSnackbar } from '@/utils/Snackbar.vue'
import { showLoading, hideLoading } from '@/utils/loadingService'

export const useDbStore = defineStore('dbStore', () => {
  const DEFAULT_RETURN = 1
  const DEFAULT_RESULT_TYPE = 1
  const DEFAULT_QUERY_TYPE = 2
  const DEFAULT_SQL_PATH = 'showcase/master/userMasterSqlTemplate.sql'

  const tenantId = computed(() => {
    const tid = window.location.pathname.split('/').filter(Boolean)[0]
    if (tid) return tid
    if (location.hostname === 'localhost') return 'premier'
    return ''
  })

  const common = reactive({
    tid: tenantId.value,
    RETURN: DEFAULT_RETURN,
    RESULT_TYPE: DEFAULT_RESULT_TYPE,
    QUERY_TYPE: DEFAULT_QUERY_TYPE,
    SQL_PATH: `${tenantId.value}/${DEFAULT_SQL_PATH}`,
  })

  const urls = reactive({
    DATABASE_ENGINE_URL: `/dataEngine/v3/databaseEngine.php`,
    LOAD_IMAGE_URL: `/dataEngine/v3/loadImage.php`,
  })

  function getApiUrl(path = urls.DATABASE_ENGINE_URL) {
    return `/${common.tid}${path}`
  }

  function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  function setToken(token, remember = true) {
    if (!token) return

    if (remember) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }
  }

  function clearToken() {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  function buildRequest(blocks = {}, options = {}) {
    return {
      COMMON: {
        ...common,
        ...(options.COMMON || {}),
      },
      ...blocks,
    }
  }

  async function postJson(json, options = {}) {
    const loading =
      options.showLoading === false
        ? null
        : showLoading(options.loadingText || '通信中です...')

    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      const token = getToken()

      if (options.auth !== false && token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(getApiUrl(options.url), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          json_string: JSON.stringify(json),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.COMMON?.message || `HTTP Error: ${response.status}`)
      }

      return data
    } finally {
      loading?.close()
    }
  }

  async function query(sqlTag, params = {}, options = {}) {
    if (!sqlTag) return null

    const json = buildRequest({
      [sqlTag]: {
        SQL_TAG: sqlTag,
        SQL_PATH: params.SQL_PATH || common.SQL_PATH,
        RETURN: params.RETURN ?? DEFAULT_RETURN,
        ...params,
      },
    }, options)

    return await postJson(json, options)
  }

  async function multiQuery(blocks = {}, options = {}) {
    const json = buildRequest(blocks, options)
    return await postJson(json, options)
  }

  function getSqlResult(response, sqlTag) {
    const result = response?.[sqlTag]
    if (Array.isArray(result)) return result[0] || null
    return result || null
  }

  function getRowsFromResult(result) {
    if (!result) return []
    if (Array.isArray(result.result)) return result.result
    if (result.result == null) return []
    return [result.result]
  }

  async function load(sqlTag, params = {}, options = {}) {
    try {
      const response = await query(sqlTag, params, {
        loadingText: options.loadingText || 'データ取得中です...',
        ...options,
      })

      if (response?.COMMON?.code !== 0) {
        showSnackbar(response?.COMMON?.message || 'データ取得に失敗しました。', 'error')
        return null
      }

      const result = getSqlResult(response, sqlTag)

      if (!result || result.code !== 0) {
        showSnackbar(result?.message || 'データ取得に失敗しました。', 'error')
        return null
      }

      const rows = getRowsFromResult(result)

      if (rows.length === 0 && options.showNoDataMessage !== false) {
        showSnackbar('条件に当てはまるデータはありませんでした。', 'warning')
      }

      return rows
    } catch (error) {
      console.error(error)
      showSnackbar(error.message || 'エラーが発生しました。', 'error')
      return null
    }
  }

  async function execute(sqlTag, params = {}, options = {}) {
    try {
      const response = await query(sqlTag, params, {
        loadingText: options.loadingText || 'データ処理中です...',
        ...options,
      })

      if (response?.COMMON?.code !== 0) {
        showSnackbar(response?.COMMON?.message || 'データ処理に失敗しました。', 'error')
        return false
      }

      const result = getSqlResult(response, sqlTag)

      if (!result || result.code !== 0) {
        showSnackbar(result?.message || 'データ処理に失敗しました。', 'error')
        return false
      }

      if (options.showSuccess !== false) {
        showSnackbar(options.successMessage || 'データ処理をしました。', 'success')
      }

      return true
    } catch (error) {
      console.error(error)
      showSnackbar(error.message || 'エラーが発生しました。', 'error')
      return false
    }
  }

  async function runLoad(sqlTag, params = {}, targetKey = null, options = {}) {
    const rows = await load(sqlTag, params, options)
    if (targetKey) return { [targetKey]: rows }
    return rows
  }

  async function runSave(sqlTag, params = {}, options = {}) {
    return await execute(sqlTag, params, options)
  }

  const save = runSave

  async function login(params = {}, options = {}) {
    const response = await query('login', params, {
      ...options,
      auth: false,
      loadingText: options.loadingText || 'ログイン中です...',
      COMMON: {
        AUTH_REQUIRED: '0',
        ...(options.COMMON || {}),
      },
    })

    const result = getSqlResult(response, 'login')

    const token =
      result?.token ||
      result?.result?.[0]?.token ||
      response?.COMMON?.token

    if (token) {
      setToken(token, options.remember ?? true)
    }

    return response
  }

  async function registerUser(sqlTag, params = {}, options = {}) {
    return await query(sqlTag, params, {
      ...options,
      auth: false,
      loadingText: options.loadingText || 'ユーザー登録中です...',
      COMMON: {
        AUTH_REQUIRED: '0',
        TRANSACTION: '1',
        ...(options.COMMON || {}),
      },
    })
  }

  async function verify(options = {}) {
    try {
      const token = getToken()
      if (!token) return false

      const response = await postJson(
        buildRequest({
          verify_token: {
            SQL_TAG: 'verify_token',
            RETURN: 1,
          },
        }, {
          COMMON: {
            AUTH_REQUIRED: '1',
            ...(options.COMMON || {}),
          },
        }),
        {
          ...options,
          auth: true,
          showLoading: options.showLoading ?? false,
        }
      )

      return response?.COMMON?.code === 0
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async function logout() {
    clearToken()
    hideLoading()
    return true
  }

  return {
    common,
    urls,

    getToken,
    setToken,
    clearToken,

    showLoading,
    hideLoading,

    query,
    multiQuery,
    load,
    execute,
    save,
    runLoad,
    runSave,

    login,
    registerUser,
    verify,
    logout,
  }
})