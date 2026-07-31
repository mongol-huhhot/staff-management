import { reactive } from "vue";
import { defineStore } from "pinia";
import { useDbStore } from "@/stores/useDbStore";
import { useAppConfigStore } from "@/stores/AppConfigStore";
import { buildInitColumns } from "@/composables/useColumns";

const DEFAULT_PENDING_STATUSES = ['submitted']

export const useDataStore = defineStore("dataStore", () => {
    const baseStore = useDbStore();
    const appConfigStore = useAppConfigStore();

    const CONST_DEF = {
        get_item_category: 'masters.get_item_category',
        get_staff_profile_by_request: 'staff.profile.select_by_request',
    }

    const states = reactive({
        currentRow: {},
    })

    const data = reactive({
        'category': [],
        get_staff_profile_by_request: [],
        todos: [],
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
        return await runLoad(CONST_DEF.get_item_category, p, 'category')
    }

    const get_staff_profile_by_request = async (p = {}) => {
        return await runLoad(CONST_DEF.get_staff_profile_by_request, p, 'get_staff_profile_by_request')
    }

    const pendingStatuses = () => {
        const configured = appConfigStore?.DASHBOARD_CONFIG?.pending_statuses
        if (Array.isArray(configured) && configured.length) return configured.join(',')
        if (typeof configured === 'string' && configured) return configured
        return DEFAULT_PENDING_STATUSES.join(',')
    }

    // 処理待ち件数をカテゴリ別に取得して data.todos に保持する
    const loadTodos = async () => {
        // DB から取得できるまでは静的設定（DASHBOARD_CONFIG.todos）を初期表示にする
        if (!data.todos.length) {
            data.todos = appConfigStore?.DASHBOARD_CONFIG?.todos || []
        }

        const result = await dbAccessWithMultiTags({
            request_counts: {
                SQLTAG: appConfigStore.REQUEST_SAVE_TAGS?.count_category,
                category_code: 'staffs',
                request_statuses: pendingStatuses(),
                staff_id: null,
            },
        })

        if (result.code !== 0) {
            console.error('Failed to load todos:', result.message)
            return
        }

        const rows = result.data?.request_counts || []
        if (!rows.length) return

        data.todos = rows.map(cat => ({
            type: cat.remarks || cat.sub_category_name || cat.sub_category_code,
            text: cat.category_name,
            category_code: cat.category_code,
            sub_category_code: cat.sub_category_code,
            data_structure: cat.data_structure,
            ui_component: cat.ui_component,
            count: Number(cat.count) || 0,
        }))
    }

    // グリッドのセルクリックで選択行を共有する（user-master と同じチャネル）
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

        runSave,
        saveData,

        get_item_category,
        get_staff_profile_by_request,
        pendingStatuses,
        loadTodos,
        rowClicked,
        buildColumnsDefine,

        login,
        logout,
        verify,
        getLoginUser: baseStore.getLoginUser,
        dbAccessWithMultiTags,
    }
})
