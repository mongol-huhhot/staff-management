import { reactive, } from "vue";
import { defineStore, createPinia, setActivePinia } from "pinia";
import { useDbStore} from "@/stores/useDbStore";
import { buildInitColumns, }  from '@/composables/useColumns'

setActivePinia(createPinia());

export const useDataStore = defineStore("dataStore", () => {
    const baseStore = useDbStore();

    const CONST_DEF = {
        get_user_register: 'users.get_user_register',
        get_item_category: 'masters.get_item_category',
        get_item_dictionary: 'masters.get_item_dictionary',
        get_staff_information_list: 'staff.get_information_list',
    }

    const states = reactive({
        currentRow: null,
    })

    const data = reactive({
        'get_user_register': [],
        'get_item_category': [],
        'get_item_dictionary': [],
        'get_staff_information_list': [],
    })

    const params = reactive({
        attributes: {}
    })

    const runLoad = async (sql_tag, p = {}, targetKey = null) => {
        if(!targetKey) targetKey=sql_tag
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

    const get_item_category = async (p = {}) => {
        return await runLoad(CONST_DEF.get_item_category, p,  'masters.get_item_category')
    }

    const get_item_dictionary = async (p = {}) => {
        return await runLoad(CONST_DEF.get_item_dictionary, p,  'masters.get_item_dictionary')
    }

    const get_user_register = async (p = {}) => {
        return await runLoad(CONST_DEF.get_user_register, p,  'users.get_user_register')
    }

    // スタッフ一覧（limit/offset によるサーバーページング、total_count 付き）
    const get_staff_information_list = async (p = {}) => {
        return await runLoad(CONST_DEF.get_staff_information_list, p,  'get_staff_information_list')
    }

    // グリッドのセルクリックで選択行を共有する
    const rowClicked = (v) => {
        states.currentRow = v?.data || null
    }

    // StaffList 用の列定義。onRowClicked は staff_code/staff_name セルに紐づく
    function buildColumnsDefine(onRowClicked) {
        return buildInitColumns(onRowClicked)
    }

    const login = async (p = {}, options = {}, SQL_PATH = null) => await baseStore.login('authenticate.login', p, options, SQL_PATH)
    const logout = async (p = {}) =>  await baseStore.logout(p)
    const verify = async (p = {}) =>  await baseStore.verify(p)

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

        get_item_category,
        get_item_dictionary,
        get_user_register,
        get_staff_information_list,
        login,
        logout,
        verify,
        dbAccessWithMultiTags,
        getLoginUser: baseStore.getLoginUser,
    }
})
