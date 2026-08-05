import { reactive, } from "vue";
import { defineStore, createPinia, setActivePinia } from "pinia";
import { useDbStore } from "@/stores/useDbStore";

setActivePinia(createPinia());

export const useDataStore = defineStore("dataStore", () => {
    const baseStore = useDbStore();

    const CONST_DEF = {
        get_user_register: 'users.get_user_register',
    }

    const states = reactive({
        currentRow: null,
    })

    const data = reactive({
        'get_user_register': [],
    })

    const params = reactive({
        attributes: {}
    })

    const runLoad = async (sql_tag, p = {}, targetKey = null) => {
        if (!targetKey) targetKey = sql_tag
        const ret = await baseStore.load(sql_tag, p)
        if (targetKey) data[targetKey] = ret
        return ret
    }

    const runSave = async (sql_tag, p = {}, options = {}) => {
        return await baseStore.save(sql_tag, p, options)
    }

    const saveData = async (sqltag, p = {}, options = {}) => {
        return await runSave(sqltag, p, options)
    }

    const get_user_register = async (p = {}) => {
        return await runLoad(CONST_DEF.get_user_register, p, 'users.get_user_register')
    }

    // グリッドのセルクリックで選択行を共有する
    const rowClicked = (v) => {
        states.currentRow = v?.data || null
    }

    // TODO: 一覧実装時に列定義を追加
    function buildColumnsDefine() {
        return []
    }

    const login = async (p = {}, options = {}, SQL_PATH = null) => await baseStore.login('authenticate.login', p, options, SQL_PATH)
    const logout = async (p = {}) => await baseStore.logout(p)
    const verify = async (p = {}) => await baseStore.verify(p)

    const dbAccessWithMultiTags = async (params = {}, options = {}) => {
        try {
            return await baseStore.dbAccessWithMultiTags(params, options)
        } catch (error) {
            console.error('Error in dbAccessWithMultiTags:', error)
            return {
                code: -1,
                message: error.message || 'データ取得に失敗しました。',
                result: null,
                raw: null,
            }
        }
    }

    return {
        states,
        params,
        data,

        rowClicked,
        runSave,
        saveData,
        // build AG Grid columns on-demand
        buildColumnsDefine,

        get_user_register,
        login,
        logout,
        verify,
        dbAccessWithMultiTags,
        getLoginUser: baseStore.getLoginUser,
    }
})
