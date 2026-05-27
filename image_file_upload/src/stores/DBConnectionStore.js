// stores/DBConnectionStore.js
import { defineStore } from "pinia";
import { reactive, onBeforeMount } from "vue";
// import { showSnackbar } from "@/utils/Snackbar.vue"; // Abstracted notification utility

/**
 * Merged DBConnection + Base helpers
 * - One store to rule them all.
 * - Inject a notifier via setNotifier(fn) (e.g. setNotifier(showSnackbar))
 * Revised: 2025-01-15
 */
export const useDBConnectionStore = defineStore("dbConnectionStore", () => {
  /** ---- backend constants (kept for compatibility) ---- */
  /** ---- endpoints ---- */
  const RETURN = 1;
  const RESULT_TYPE = 1;
  const QUERY_TYPE = 2;
  const VERIFY_URL = "/dataEngine/v1/handleRequest/verify.php";
  const testMode = true; // if true, token valid, else invalid

  let tid = window.location.pathname.split('/').filter(Boolean)[0];
  if (!tid) {
      tid = 'janga_vue_base_system';
  }

  const sqlPath = `${tid}/generic-folder/image-operations.sql`

  console.log("tid===", tid, sqlPath)

  const commonConstants = reactive({
    TRANSACTION_URL: "/dataEngine/v1/handleRequest/requestHandler.php",
    IMAGE_UPLOAD_URL: "/dataEngine/v1/handleRequest/imageUploadHandler.php",
    LOGIN_URL: "/dataEngine/v1/handleRequest/login.php",
    LOGOUT_URL: "/dataEngine/v1/handleRequest/logout.php",
    VERIFY_URL: "/dataEngine/v1/handleRequest/verify.php",
  });

  /** ---- common params ---- */
  const commonParams = reactive({
    RETURN,
    RESULT_TYPE,
    QUERY_TYPE,
    SQL_PATH:sqlPath,
    tid:tid,
  });

  /** ---- notifier (snackbar) injection ---- */
  let notifier = null; // (message: string, level: 'success'|'warning'|'error')
  const setNotifier = (fn) => {
    if (typeof fn === "function") notifier = fn;
  };
  const notify = (msg, level = "info") => {
    try { notifier?.(msg, level); } catch { /* noop */ }
  };

  /** ---- token helpers ---- */
  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";

  const saveToken = (token, persist = false) => {
    if (!token) return;
    if (persist) localStorage.setItem("token", token);
    sessionStorage.setItem("token", token);
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  };

  /** ---- path / tid helpers ---- */
  const joinPath = (a, b) => {
    const left = a?.endsWith("/") ? a.slice(0, -1) : a || "";
    const right = b?.startsWith("/") ? b : `/${b || ""}`;
    return `${left}${right}`;
  };

  const detectTid = () => {
    if (typeof window === "undefined") return tid;
    const { hostname, pathname } = window.location;
    if (hostname !== "localhost" && pathname) {
      const segs = pathname.split("/").filter(Boolean);
      if (segs.length > 0) commonParams.tid = segs[0];
    }
    return tid;
  };

  const transactionURL = (url = commonConstants.TRANSACTION_URL) => {
    const tid = detectTid();
    console.log("tid===", tid)
    return joinPath(`/${tid}`, url);
  };

  // Initialize defaults similar to your base store
  (() => {
    detectTid();
    if (!commonParams.SQL_PATH) {
      commonParams.SQL_PATH = sqlPath;
    }
  })();

  /** ---- low-level POST (JSON), with optional auth and timeout ---- */
  const access = async (
    url,
    jsonBody,
    { requireAuth = true, timeoutMs = 20000 } = {}
  ) => {
    console.log("access====XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX, requireAuth==-", requireAuth)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    console.log("access====AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa")
    try {
      const headers = { "Content-Type": "application/json" };
      if (requireAuth) {
        const token = getToken();
        console.log("access====YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY", token)
        if (!token) throw new Error("Missing auth token");
        headers.Authorization = `Bearer ${token}`;
      }

      console.log("access====", url, jsonBody )

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(jsonBody ?? {}),
        signal: controller.signal,
      });
      console.log("access====11111111111111111111111111111", response)

      const text = await response.text();
      console.log("access====222222222222222222222222222222", text)
      const data = (() => {
        try { return text ? JSON.parse(text) : null; } catch { return { raw: text }; }
      })();

      if (!response.ok) {
        const msg = data?.message || `HTTP ${response.status}`;
        throw new Error(`Request failed: ${msg}`);
      }
      return data;
    } catch(e) {
      console.log("access====eeeeeeeeeeeeeeeeeeeeeee", e)
    } finally {
      clearTimeout(t);
    }
  };

  /** ---- public config helpers ---- */
  const setTenantId = (tid) => { if (tid) commonParams.tid = String(tid); };
  const setSQLPath = (sqlPath) => { commonParams.SQL_PATH = sqlPath || ""; };

  /** ---- DB core calls ---- */
  const dbAccessWithMultiTags = async (
    params,
    options = {},
    SQL_PATH = null,
    URL = null
  ) => {
    const { onSuccess, onError } = options;
    try {
      const json = { COMMON: { ...commonParams }, ...params };
      if (SQL_PATH) json.COMMON.SQL_PATH = SQL_PATH;

      const url = transactionURL(URL ?? commonConstants.TRANSACTION_URL);
      const resp = await access(url, { json_string: json }, { requireAuth: true });
      onSuccess?.(resp);
      return resp;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };

  const dbAccess = async (
    sqltag,
    params = {},
    options = {},
    SQL_PATH = null,
    URL = null
  ) => {
    const { onSuccess, onError } = options;
    try {
      const payload = {
        COMMON: { ...commonParams },
        [sqltag]: { SQL_TAG: sqltag, ...params },
      };

      if (SQL_PATH) payload.COMMON.SQL_PATH = SQL_PATH;

      const url = transactionURL(URL ?? commonConstants.TRANSACTION_URL);
      console.log("dbAccess======", payload, url )

      const resp = await access(url, { json_string: payload }, { requireAuth: true });
      console.log("resp====",  resp)
      onSuccess?.(resp);
      return resp;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };

  /** ---- Auth ---- */
  const login = async (sqltag, params = {}, options = {}, SQL_PATH = null) => {
    const { onSuccess, onError, persist = false } = options;
    try {
      const payload = {
        COMMON: { ...commonParams },
        [sqltag]: { SQL_TAG: sqltag, ...params },
      };
      if (SQL_PATH) payload.COMMON.SQL_PATH = SQL_PATH;

      const url = transactionURL(commonConstants.LOGIN_URL);
      const resp = await access(url, { json_string: payload }, { requireAuth: false });

      if (resp?.token) saveToken(resp.token, !!persist);
      onSuccess?.(resp);
      return resp;
    } catch (error) {
      onError?.(error);
      throw error;
    }
  };

  /**
   * Verify user authentication
   * @returns {Promise} - Verification result
   */
  const verify = async () => {
    try {
      // Login check test for localhost
      if (location.hostname === 'localhost' || testMode ) {
          sessionStorage.setItem('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiZGVtbzMiLCJ1c2VyX3R5cGUiOiJzeXNhZG1pbiIsInN0YWZmX2NvZGUiOm51bGwsImlhdCI6MTc0OTYxMjc3OCwiZXhwIjoxNzQ5NjE0NTc4LCJpc3MiOiJzdXJ1cGFzLm5hdGl2ZTM2NS5uZXQiLCJhdWQiOiJzdXJ1cGFzLm5hdGl2ZTM2NS5uZXQifQ.BAB5yiPBS2FRKpvIgMrYvqoRVyY2Fqpl0bjvLSNwA3g');
          return
      }

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return false;
      
      const url = `/${tid}${VERIFY_URL}`;
      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
      });

      const resdata = await response.json();
      console.log("verify response====", resdata.data?.user);

      return response.ok ? resdata.data?.user : false;
    } catch (error) {
        console.error("Error during logout:", error.message);
        return false;
    }
  };

  const logout = async () => {
    try {
      const url = transactionURL(commonConstants.LOGOUT_URL);
      await access(url, {}, { requireAuth: false });
    } catch {
      // ignore
    } finally {
      clearToken();
    }
  };

  /** ---- Convenience: ID & image helpers (compat with your base usage) ---- */
  const uniqueId = (prefix = "") => {
    const rnd = Math.random().toString(36).slice(2, 8);
    const ts = Date.now();
    return `${prefix}${prefix ? "_" : ""}${ts}_${rnd}`;
  };

  // Basic image loader: expects backend to return { data: 'data:image/*;base64,...' } or similar.
  const loadImage = async (sqltag, params = {}, options = {}, SQL_PATH = null, URL = null) => {
    const resp = await dbAccess(sqltag, params, options, SQL_PATH, URL);
    return resp?.result?.[sqltag]?.data || null; // adjust to your backend shape
  };

  /** =========================================================================
   * Higher-level helpers (merged from BaseStore)
   * ========================================================================= */

  /** Query single SQL tag with UX messaging */
  const load = async (sqltag = null, param = {}) => {
    if (!sqltag) return null;
    try {
      const resp = await dbAccess(sqltag, { ...param });
      if (!resp) {
        notify("データ取得にエラーが発生しました。", "error");
        return null;
      }
      if (resp.code !== 0) {
        notify("データ取得にエラーが発生しました。", "error");
        return null;
      }

      const result = resp.result?.[sqltag];
      if (!result || result.code !== 0) {
        notify("データ取得にエラーが発生しました。", "error");
        return null;
      }
      if (!result.result || result.result.length === 0) {
        notify("条件に当てはまるデータはありませんでした。", "warning");
        return null;
      }
      return result.result;
    } catch (error) {
      notify("エラーが発生しました。", "error");
      return null;
    }
  };

  /** Execute multiple tags with UX messaging */
  const excecuteMultiQuery = async (param = {}) => {
    try {
      const resp = await dbAccessWithMultiTags({ ...param });
      if (resp?.code !== 0) {
        notify("データ取得にエラーが発生しました。", "error");
        return null;
      }
      return resp.result;
    } catch {
      notify("エラーが発生しました。", "error");
      return null;
    }
  };
  // alias with correct spelling too
  const executeMultiQuery = excecuteMultiQuery;

  /** Save / delete like operations with UX messaging */
  const execute = async (sqltag = null, params = {}) => {
    if (!sqltag) return null;
    try {
      const resp = await dbAccess(sqltag, { ...params });
      const result = resp?.result?.[sqltag];
      const arr = Array.isArray(result) ? result : [result].filter(Boolean);
      const errors = arr.filter((el) => el?.code !== 0);

      if (errors.length > 0) {
        notify("データ処理にエラーが発生しました。", "error");
        return null;
      }
      notify("データ処理をしました。", "success");
      return true;
    } catch {
      notify("エラーが発生しました。", "error");
      return null;
    }
  };

  const save = async (sqltag = null, params = {}) => {
    console.log("sssaaavvveee===", sqltag, params)
    if (!sqltag) return null;
    return await execute(sqltag, params);
  };

  const deleteImage = async(fieldKey) => {
    const sqltag = 'delete_image'
    const response = await execute(sqltag,  { field_key: fieldKey });
    console.log("delete response=", response)
  }

  /**
   * Upload a single image using the dedicated endpoint
   * @param {string} fieldKey - Unique identifier
   * @param {Blob} imageBlob - Image to upload
   * @returns {Promise} - API response
   */
  const uploadImage = async (fieldKey, imageBlob) => {
    try {
        const formData = new FormData();
        
        // Add image file
        formData.append('image', imageBlob, 'image.jpg');
        formData.append('field_key', fieldKey);
        
        // Add authentication token if available
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            formData.append('token', token);
        }
        
        // const url = `${transactionURL().replace(TRANSATION_URL, '')}${IMAGE_UPLOAD_URL}`;
        const url = transactionURL(commonConstants.IMAGE_UPLOAD_URL)
        console.log('📤 Sending image upload request to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        
        // Handle response properly - this is the key fix
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            const text = await response.text();
            console.error('❌ Non-JSON response received:', text);
            
            // Try to extract error message from HTML/text response
            let errorMessage = 'Unknown server error';
            const errorMatch = text.match(/<title>(.*?)<\/title>|<h1>(.*?)<\/h1>|ERROR: (.*?)(?:<br|<\/)/);
            if (errorMatch) {
                errorMessage = errorMatch[1] || errorMatch[2] || errorMatch[3] || text.substring(0, 100);
            }
            
            throw new Error(`Server error: ${errorMessage}`);
        }
        
        console.log('✅ Upload successful:', result);
        return result;
    } catch (error) {
      console.error('📸 Image upload failed:', error);
      
      // Normalize error structure
      const normalizedError = {
        code: error.code || 500,
        message: error.message || error.toString(),
        result: []
      };
      
      throw normalizedError;
    }
  };

  onBeforeMount(verify)


  return {
    // Core DB
    dbAccess,
    dbAccessWithMultiTags,
    login,
    verify,
    logout,

    // Config/state
    commonConstants,
    commonParams,
    setTenantId,
    setSQLPath,

    // Helpers
    uniqueId,
    loadImage,
    setNotifier,
    saveToken,
    clearToken,
    getToken,

    // High-level (merged)
    load,
    execute,
    save,
    excecuteMultiQuery,
    executeMultiQuery,
    uploadImage,
    deleteImage,
  };
});
