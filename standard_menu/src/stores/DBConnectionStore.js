import { defineStore, createPinia, setActivePinia } from "pinia";
import { reactive } from "vue";
/**
 * revised version:
 * by chen, 2025/01/15
 */

setActivePinia(createPinia())

export const useDBConnectionStore = defineStore("dbConnectionStore", () => {
  const RETURN = 1;
  const RESULT_TYPE = 1;
  const QUERY_TYPE = 2;

  const commonConstants = reactive({
    TRANSATION_URL: "/dataEngine/v1/handleRequest/requestHandler.php",
    LOGIN_URL: "/dataEngine/v1/handleRequest/login.php",
    LOGOUT_URL: "/dataEngine/v1/handleRequest/logout.php",
    VERIFY_URL: "/dataEngine/v1/handleRequest/verify.php",
  });

  const commonParams = reactive({
    RETURN: RETURN,
    RESULT_TYPE: RESULT_TYPE,
    QUERY_TYPE: QUERY_TYPE,
    SQL_PATH: "",
    tid: '',
  });

  const access = async (url, formData) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || token.split('.').length !== 3) {
        console.log("access11111111111111111111111111111111111111")
        logout();
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
        },
        body: formData
      });

      // Check for new token in headers
      // const newToken = response.headers.get('X-Renewed-Token');
      // const expires = response.headers.get('X-Token-Expires');

      let newToken = null
      let expires = null
      if (response.headers.get('X-Renewed-Token')) {
        newToken = response.headers.get('X-Renewed-Token');
        expires = response.headers.get('X-Token-Expires');
        // Update storage with new token
      }

      if (newToken) {
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        if (expires) storage.setItem('token_expires', expires);
      }

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      return await response.json();

    } catch (error) {
      console.log("access22222222222222222222222222222222222222", error)
      if (error.message.includes('401')) logout();
      throw error;
    }
  };

  const transactionURL = (url = commonConstants.TRANSATION_URL) => {
    if (document.location.hostname !== "localhost") {
      const path = document.location.pathname;
      const paths = path.split("/");
      commonParams.tid = paths[1];
    }
    return `/${commonParams.tid}${url}`;
  };


  /**
   * can execute multi sql statements
   * @param {*} params: {
   *                      'load_user': {'SQLTAG': 'load_user','userid': ''},
   *                      'load_department': {'SQLTAG': 'load_department'} 
   *                    }
   * @param {*} URL: relative URL  
   * @param {*} options: any additional optioins
   * @returns: 
   *  [
   *     'code' => intval($arr[0]),
   *    'load_user'=>[
   * 
                    'code' => intval($arr[0]),
                    'result' => $stmt->fetchAll($queryType), .. the result of "load_user" query
                    'row_count' => $stmt->rowCount(),
                    'message' => sprintf("エラーコード:%s, エラー内容:%s", $arr[1], $arr[2]),
                    'action' => 'select'
        ],
        'load_department'=>[
    
                    'code' => intval($arr[0]),
                    'result' => $stmt->fetchAll($queryType), .. the result of "load_department" query
                    'row_count' => $stmt->rowCount(),
                    'message' => sprintf("エラーコード:%s, エラー内容:%s", $arr[1], $arr[2]),
                    'action' => 'select'
        ]
    ]
   */
  const dbAccessWithMultiTags = async (params, URL, options = {}) => {
    const { onSuccess, onError } = options;

    try {
        const json = { COMMON: { ...commonParams }, ...params };
        const url = transactionURL(URL);
        const response = await access(url, JSON.stringify({ json_string: json }));
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }
  };  
  
  const dbAccess = async (sqltag, params, URL, options = {}) => {
    const { onSuccess, onError } = options;

    try {
        const json = { COMMON: { ...commonParams }, [sqltag]: { SQL_TAG: sqltag, ...params } };
        const url = transactionURL(URL);
        const response = await access(url, JSON.stringify({ json_string: json }));
        if (onSuccess) onSuccess(response);
        return response;
    } catch (error) {
        if (onError) onError(error);
        throw error;
    }

  };  

  const login = async ( sqltag, params = {}, options = {}) => {
    const { onSuccess, onError } = options;

    const json = {
      COMMON: { ...commonParams },
      [sqltag]: { SQL_TAG: sqltag, ...params },
    };

    const url = transactionURL(commonConstants.LOGIN_URL);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ json_string: json }),
      });

      const result = await response.json();
      console.log("result222222222222----------------", result )
      
      if (result.status !== 'success') {
        throw new Error(result.error);
      }

      // PROPER token extraction
      // const { token, expires, user } = result.data;
      const { token, expires, user } = result.data;
      
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token received');
      }

      console.log( "login: result=====", result, user, params )

      // Store token properly
      if ( params.rememberMe) {
        localStorage.setItem( 'token', token );
        localStorage.setItem( 'token_expires', expires );
      } else {
        sessionStorage.setItem( 'token', token );
        sessionStorage.setItem( 'token_expires', expires );
      }

      return { user, token, expires: expires };

    } catch (error) {
      console.log("login error:::", error)
      clearAuth();
      throw error;
    }
  };

  const verify = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }
      
      const url = transactionURL(commonConstants.VERIFY_URL);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      // console.log("verify--- result====", result)

      if (result.status !== 'success') {
        throw new Error(result.message);
      }

      // Handle potential token renewal
      const newToken = result.data.token;
      if (newToken && newToken !== token) {
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('token', newToken);
        storage.setItem('token_expires', result.data.expires);
      }

      return result.data;

    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    try {
      const url = transactionURL(commonConstants.LOGOUT_URL);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("logout response====", response);

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }

      clearAuth();

    } catch (error) {
      console.error("Error during logout:", error.message);
      clearAuth();
    }
  };

  function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_expires');
  }

  return {
    dbAccess,
    dbAccessWithMultiTags,
    login,
    verify,
    logout,
    clearAuth,
    commonConstants,
    commonParams,
  };
});
