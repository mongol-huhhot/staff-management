import { defineStore } from "pinia";
import { reactive } from "vue";
/**
 * revised version:
 * by chen, 2025/01/15
 */
export const useDBConnectionStore = defineStore("dbConnectionStore", () => {
  const RETURN = 1;
  const RESULT_TYPE = 1;
  const QUERY_TYPE = 2;

  const commonConstants = reactive({
    TRANSATION_URL: "/dataEngine/v1/handleRequest/requestHandler.php",
    LOGIN_URL: "/dataEngine/v1/handleRequest/login.php",
    LOGOUT_URL: "/dataEngine/v1/handleRequest/logout.php",
    VERIFY_URL: "/dataEngine/v1/handleRequest/verify.php",
    LOAD_IMAGE_URL: "/dataEngine/v1/handleRequest/loadImage.php",
  });

  const tid = ref(window.location.pathname.split('/').filter(Boolean)[0]);

  // If no tid and on localhost, set to default
  if (!tid.value && location.hostname === 'localhost') {
      tid.value = 'jwtr250558';
  }

  const commonParams = reactive({
    RETURN: RETURN,
    RESULT_TYPE: RESULT_TYPE,
    QUERY_TYPE: QUERY_TYPE,
    SQL_PATH: "",
    tid: tid.value,
  });

  const access = async (url, formData) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return null;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in access function:", error);
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

      if (onSuccess) onSuccess(response);

      if (!response.ok) {
        throw new Error(`Login failed with status ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error("Error during login:", error.message);
      throw error;
    }
  };

  const verify = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if(!token) return false;
      
      const url = transactionURL(commonConstants.VERIFY_URL);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("verify response====", response);
      if(response.ok) 
        return true;

      return fasle

    } catch (error) {
      console.error("Error during logout:", error.message);
      return false
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

      localStorage.removeItem('token');
      sessionStorage.removeItem('token');

    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  /** get blob fro image loading */
  const accessBlob = async (url, formData) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.error("Token not found");
        return null;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();

      const img = URL.createObjectURL(blob);

      // const link = document.createElement("a");
      // link.href = URL.createObjectURL(blob);
      // link.download = "debug_image.png";
      // link.click();

      return img
    } catch (error) {
      console.error("Error in access function:", error);
      throw error;
    }
  };

  /** load an image */
  const loadImage = async (sqltag, params = {}) => {
    const url = transactionURL(commonConstants.LOAD_IMAGE_URL);

    try {
      const json = { 
        COMMON: { ...commonParams }, 
        [sqltag]: { SQL_TAG: sqltag, ...params } 
      };
      
      const response = await accessBlob(url, JSON.stringify({ json_string: json }));

      return response;
    } catch (error) {
      console.error("Image load error:", error); // fallback log
      throw error;
    }
  };

  return {
    dbAccess,
    dbAccessWithMultiTags,
    login,
    verify,
    logout,
    commonConstants,
    commonParams,
    tid,
    loadImage,
  };
});
