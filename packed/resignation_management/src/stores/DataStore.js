import { reactive, } from "vue";
import { defineStore, createPinia, setActivePinia } from "pinia";
import { useDbStore } from "@/stores/useDbStore";
import { buildResignationColumns, } from '@/composables/useColumns'
import { parseAndFlattenJsonbFields } from '@/composables/utilFactory'
import { MOCK_RESIGNATION_ROWS, mockMyRequestStore } from '@/stores/mock/resignationMock'
import { getMockTaskMaster, saveMockTaskMaster } from '@/stores/mock/resignationProcedureMock'

setActivePinia(createPinia());

export const useDataStore = defineStore("dataStore", () => {
    const baseStore = useDbStore();

    const CONST_DEF = {
        get_user_register: 'users.get_user_register',
        get_resignation_application_list: 'resignation.get_application_list',
        save_resignation_approval: 'resignation.save_approval',
        get_my_resignation_request: 'resignation.get_my_request',
        save_resignation_request: 'resignation.save_request',
        get_staff_information: 'staff.get_information',
        get_user_staff: 'users.get_user_staff',
        get_resignation_task_master: 'resignation.get_task_master',
        save_resignation_task_master: 'resignation.save_task_master',
    }

    const states = reactive({
        currentRow: null,
        myRequest: null,
    })

    const data = reactive({
        'get_user_register': [],
        'get_resignation_application_list': [],
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

    // ログインユーザーに紐付く staff を解決する (staff_apply top-page の同名処理と同じタグ)
    const get_user_staff = async (p = {}) => {
        return await runLoad(CONST_DEF.get_user_staff, p)
    }

    // 退職申請一覧（フィルター条件は SQL 側パラメータとしてそのまま渡す）
    const get_resignation_application_list = async (p = {}) => {
        const ret = await runLoad(
            CONST_DEF.get_resignation_application_list,
            p,
            'get_resignation_application_list'
        )

        // SQL タグ未定義の間はローカル開発のみモックで画面確認できるようにする
            console.warn('[DataStore] resignation.get_application_list 未定義のためモックデータを使用')
            data['get_resignation_application_list'] = MOCK_RESIGNATION_ROWS
            return MOCK_RESIGNATION_ROWS

        return ret
    }

    // 承認（action: 'approve'）・差戻し（action: 'remand'）
    const save_resignation_approval = async (p = {}, options = {}) => {
        const ok = await runSave(CONST_DEF.save_resignation_approval, p, options)
        if (ok) return true

        // SQL タグ未定義の間はローカル開発のみモック更新で画面確認できるようにする
        if (import.meta.env.DEV) {
            console.warn('[DataStore] resignation.save_approval 未定義のためモック更新')
            const row = MOCK_RESIGNATION_ROWS.find(r => r.staff_code === p.staff_code)
            if (row) {
                row.status = p.action === 'approve' ? 'approved' : 'remanded'
                if (p.action === 'approve') {
                    row.approved_at = new Date().toISOString().slice(0, 10)
                }
            }
            return true
        }

        return false
    }

    // 本人の退職願を取得（未申請は null。未申請時の警告スナックバーは抑止）
    const get_my_resignation_request = async (p = {}) => {
        const ret = await baseStore.load(
            CONST_DEF.get_my_resignation_request,
            p,
            { showNoDataMessage: false }
        )

        // 本番行は data_jsonb にフォーム内容が入っているため flatten する
        let row = ret?.length
            ? parseAndFlattenJsonbFields(ret, ['data_jsonb'])[0]
            : null

        if (!row && import.meta.env.DEV) {
            row = mockMyRequestStore.current
        }

        states.myRequest = row
        return row
    }

    const get_my_profile_defaults = async (p = {}) => {
        const res = await dbAccessWithMultiTags({
            address: { SQLTAG: CONST_DEF.get_staff_information, category_code: 'address', ...p },
            contact: { SQLTAG: CONST_DEF.get_staff_information, category_code: 'contact', ...p },
        })

        if (res?.code === 0) {
            const flat = (rows) =>
                parseAndFlattenJsonbFields(rows || [], ['data_jsonb'])[0] || {}

            const address = flat(res.data?.address)
            const contact = flat(res.data?.contact)

            const defaults = {
                // ★ contact 側の実キーは mtb_item_dictionary で要確認 (候補を順に採用)
                phone: contact.phone_number ?? contact.phone ?? contact.mobile_phone ?? '',
                postal_code: address.postal_code ?? '',
                prefecture: address.prefecture ?? '',
                city: address.city ?? '',
                town: address.town ?? '',
                address_line1: address.address_line1 ?? '',
                address_line2: address.address_line2 ?? '',
            }

            if (Object.values(defaults).some(v => v)) return defaults
        }

        return null
    }

    // チェックリスト管理画面 (?type=checklist) — 手続きマスター取得
    const get_resignation_task_master = async (p = {}) => {
        const ret = await baseStore.load(
            CONST_DEF.get_resignation_task_master,
            p,
            { showNoDataMessage: false }
        )

        if (ret?.length) return ret

        // SQL タグ未定義の間はローカル開発のみモックで画面確認できるようにする
        if (import.meta.env.DEV) {
            console.warn('[DataStore] resignation.get_task_master 未定義のためモックデータを使用')
            return getMockTaskMaster()
        }

        return ret || []
    }

    // 手続きマスター保存（1行ずつ UPSERT、削除は enabled='0'）
    const save_resignation_task_master = async (tasks = [], options = {}) => {
        const login_user = baseStore.getLoginUser()?.user_id || ''

        let ok = true
        for (const t of tasks) {
            ok = await runSave(CONST_DEF.save_resignation_task_master, { ...t, login_user }, options)
            if (!ok) break
        }
        if (ok) return true

        // SQL タグ未定義の間はローカル開発のみモック更新で画面確認できるようにする
        if (import.meta.env.DEV) {
            console.warn('[DataStore] resignation.save_task_master 未定義のためモック更新')
            saveMockTaskMaster(tasks)
            return true
        }

        return false
    }

    const save_resignation_request = async (p = {}, options = {}) => {
        const payload = {
            login_user: baseStore.getLoginUser()?.user_id || '',
            ...p,
        }

        const ok = await runSave(CONST_DEF.save_resignation_request, payload, options)

        if (!ok) return false

        if (!p.staff_code) states.myRequest = { ...p }
        return true
    }

    // グリッドのセルクリックで選択行を共有する
    const rowClicked = (v) => {
        states.currentRow = v?.data || null
    }

    function buildColumnsDefine(handlers = {}) {
        return buildResignationColumns(handlers)
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
        get_user_staff,
        get_resignation_application_list,
        save_resignation_approval,
        get_my_resignation_request,
        get_my_profile_defaults,
        get_resignation_task_master,
        save_resignation_task_master,
        save_resignation_request,
        login,
        logout,
        verify,
        dbAccessWithMultiTags,
        getLoginUser: baseStore.getLoginUser,
    }
})
