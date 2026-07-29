// DataBrowserStore.js
import { reactive, } from "vue"
import { defineStore, createPinia, setActivePinia } from "pinia"
import { useDbStore } from '@/stores/useDbStore'
// import { useMasterStore } from '@/stores/masters/MasterStore'

setActivePinia(createPinia())

export const useDataBrowserStore = defineStore('dataBrowserStore', () => {
    const dbStore = useDbStore()
    
    const CONST_DEF = {
        get_user_info: 'get_user_info',
        get_work_report: 'get_work_report',
        get_payroll_data: 'get_payroll_data',
        // get_contact_data:'get_contact_data',
        // get_staff_master_data:'get_staff_master_data',
        get_qualification_level:'get_qualification_level',
        get_department_position:'get_department_position',
        get_secondment:'get_secondment',
        get_performance_evaluation:'get_performance_evaluation',
    }

    const states = reactive({
        current_month: '',
        current_approve_deadline: '',
        attributes: null,
        currentRow: null,
    })

    const data = {
        get_user_info: [],
        get_work_report: [] ,
        get_payroll_data: [] ,
        // get_contact_data:[],
        // get_staff_master_data:[],
        get_qualification_level:[],
        get_department_position:[],
        get_secondment:[],
        get_performance_evaluation:[],
    }

    const params = reactive({
        attributes: {}
    })

    const getData = async(sqltag='',  p={}) => {
        console.log("getData====",sqltag,  p)
        if ( sqltag==='' ) return
        if( !(sqltag in CONST_DEF) ) return

        const ret = await dbStore.load(sqltag, p)
        if( !ret || ret.length === 0 ) return

        data[sqltag] = ret

        return data[sqltag]
    }

    const login = async (p = {}, options = {}, SQL_PATH = null) =>
        await dbStore.login('authenticate.login', p, options, SQL_PATH)
    const verify = async (options = {}) => await dbStore.verify(options)
    const logout = async (options = {}) => await dbStore.logout(options)

    return {
        states,
        data,
        params,

        getData,

        login,
        verify,
        logout,
    }
})