import { defineStore, } from "pinia";
import { useDBConnectionStore } from "@/stores/DBConnectionStore.js";
import { showSnackbar } from "@/utils/Snackbar.vue"; // Abstracted notification utility

/**
 * Base Store for extending functionality.
 * Adds messaging for database results and error handling.
 * 
 * Author: Chen
 * Dates: 2023/11/22, 2025/01/15
 */
export const useBaseStore = defineStore("baseStore", () => {
  const dbStore = useDBConnectionStore();

  // Set common parameters
  dbStore.commonParams.SQL_PATH = `${dbStore.tid}/master/staffDetail.sql`

  /**
   * to query data
   * @param {*} sqltag 
   * @param {*} param 
   * @returns 
   */
  const load = async (sqltag = null, param = {}) => {
    console.log("baseStore===lllllllllll==", sqltag, {...param})
    if (!sqltag) return null;
    try {
      const resp = await dbStore.dbAccess(sqltag, { ...param });
      if(!resp) {
        showSnackbar("データ取得にエラーが発生しました。", "error");
        return null;
      }
      
      if(resp.code != 0 ) {
        showSnackbar("データ取得にエラーが発生しました。", "error");
        return null;
      }
      const result = resp.result[sqltag];
      // const result = resp[sqltag][0];
      // console.log("baseStore===result====", result)

      if (result.code !== 0) {
        showSnackbar("データ取得にエラーが発生しました。", "error");
        return null;
      }
      if (!result.result || result.result.length === 0) {
        showSnackbar("条件に当てはまるデータはありませんでした。", "warning");
        return null;
      }

      return result.result;
    } catch (error) {
      console.error("Error in load function:", error);
      showSnackbar("エラーが発生しました。", "error");
      return null;
    }
  };

  /**
   * can execute multi sql statements
   * @param {*} params: {
   *                      'load_user': {'SQLTAG': 'load_user','userid': ''},
   *                      'load_department': {'SQLTAG': 'load_department'} 
   *                    }
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
  const excecuteMultiQuery = async (param = {}) => {
    // console.log("baseStore===lllllllllll==", sqltag, {...param})

    try {
      const resp = await dbStore.dbAccessWithMultiTags({ ...param });
      console.log("excecuteMultiQuery===", resp)

      if(resp.code != 0 ) {
        showSnackbar("データ取得にエラーが発生しました。", "error");
        return null;
      }
      return resp.result;

    } catch (error) {
      console.error("Error in load function:", error);
      showSnackbar("エラーが発生しました。", "error");
      return null;
    }
  };

  /** save/delete */
  const execute = async (sqltag = null, params = {}) => {
    if (!sqltag) return null;

    try {
      const resp = await dbStore.dbAccess(sqltag, { ...params });
      const result = resp.result[sqltag];
      const rst = Array.isArray(result) ? result : [result];

      const errorMessages = rst.filter((el) => el.code !== 0);
      // console.log("execute, result=====", resp, result, rst, errorMessages)

      if (errorMessages.length > 0) {
        showSnackbar("データ処理にエラーが発生しました。", "error");
        console.error("Error messages:", errorMessages);
        return null;
      }

      showSnackbar("データ処理をしました。", "success");

      return true;
    } catch (error) {
    //   console.error("Error in save function:", error);
      showSnackbar("エラーが発生しました。", "error");
      return null;
    }
  };

  // データをDBに保存する内部関数
  const save = async (sqltag = null, params = {}) => {
      if (!sqltag) return null;
      return await execute(sqltag, params)
  };

 
  const login = async (sqltag, params = {}) => dbStore.login(sqltag, params);
  const verify = async () => dbStore.verify();
  const logout = async () => dbStore.logout();
  const getId = (p) => dbStore.uniqueId(p);
  const loadImage = async(sqltag, params={}) => dbStore.loadImage(sqltag, params)

  return {
    login,
    verify,
    logout,
    load,
    execute,
    excecuteMultiQuery,
    getId,
    save,
    loadImage,
  };
});
