import { defineStore, } from "pinia";
import { reactive, onMounted, computed  } from 'vue'
import { useDbStore } from "@/stores/useDbStore";


export const useDataStore = defineStore("dataStore", () => {
    const BaseStore = useDbStore()

    const states = reactive({
    })

    const data = reactive({
        userlist: [],               // for login user listing
        staffInfo: [],              // staff list 
        departmentList: [],
        check_userid_email: [],

        load_user_register: [],
        check_userid_email: [],
    })

    const sqlTags = {
        register_user: "register_user",   // for saving user
        load_user_register: "load_user_register",   // for loading user list for login user listing
        check_userid_email: "check_userid_email",   // for checking existing of userid or email when register user
        delete_user: "delete_user",                 // for deleting user
    };

    async function load_user_register(params) {
        const response = await BaseStore.registerUser()   
        (sqlTags.load_user_register, params, {
            ...options,
            loadingText: options.loadingText || '処理中です...',
        }) 

        const result = await BaseStore.excecuteMultiQuery(params);
        if( !result ) return false

        for (let key in result) {
            if( result[key].code === 0 ) {
                data[key] = result[key].result
            }
        }

        return result
    }

    async function register_user( params = {}, options = {}) {
        console.log("register_user params=", params)
        const response = await BaseStore.registerUser(sqlTags.register_user, params, {
          ...options})   
        return response
    }

    async function delete_user( params = {}, options = {}) {
        try {
            const response = await BaseStore.execute(sqlTags.delete_user, params, {
                ...options,
                loadingText: options.loadingText || '処理中です...',
            }) 
        } catch (error) {
            console.error(error)
            showSnackbar(error.message || 'エラーが発生しました。', 'error')
            return false
        }
    }


    const checkExistingOfUserid = async(p={}) => {
        const params = {
            check_userid_email: {SQL_TAG: sqlTags.check_userid_email, ...p },
        }

        const result = await BaseStore.excecuteMultiQuery(params);

        console.log("result=",result)

        if( !result || !result.check_userid_email) return false

        console.log("result.check_userid_email===", result?.check_userid_email, result?.check_userid_email.code,result?.check_userid_email.row_count)

        if( result.check_userid_email.code !== 0 ) return false

        if( result.check_userid_email.row_count > 0 ) return true

        return false
    }

    /** load onMounted end */
    const loadMasters = async(p={}) => {
        // const params = {
        //     departmentList: {SQL_TAG: 'load_department' },
        //     staffInfo: {SQL_TAG: 'load_staff_data' },
        // }

        // const result = await BaseStore.excecuteMultiQuery(params);

        // for (let key in result) {
        //     if( result[key].code === 0 ) {
        //         data[key] = result[key].result
        //     }
        // }
        
        // console.log("loadMasters====", data)
    }

    /** load master data */
    onMounted(async () => {
        await loadMasters()
    })

    // generate a flat data to agGrid use
    const flatData = computed(() => {
        console.log("flatData====", data?.userlist )
        return data?.userlist?.map(el => {
            if (el.content && typeof el.content === 'string') {
                el.content = JSON.parse(el.content);
            }
            let nel = { ...el }; // Spread operator to create a shallow copy
            nel = { ...nel, ...nel.content }; // Merge the object with the parsed "additinal"
            delete nel.content; // Fix typo and ensure property is deleted correctly
            delete nel.template_content; // Fix typo and ensure property is deleted correctly
            return nel;
        });
    })

    const selectedOriginalRow = (row) => {
        const dat = data.userlist || []
        const ret = dat.filter(el => el.userid === row.userid)
        if(ret || ret.length === 0 ) return {}
        return ret[0]
    }

    /**
     * purpose: selected staff is only one or multiple staffs, 
     * @param {*} v 
     * @param {*} data 
     * @returns 
     */
    function staffSelected(v, data) {
        if (!v || v.length === 0) return;
    
        if (v.length > 1) {
            data.staff_code = v.map(el => el.staff_code); // More concise
            return;
        }
    
        const val = v[0];
        data.staff_code = val.staff_code;
        data.department_code = val.department_code;
    
        staffDirectItems.value?.forEach(el => {
            console.log("el=", el, "val=", val?.[el]);
            if (data.content) {
                data.content[el] = val?.[el] ?? "";
            }
        });
    }

    // select <%thumbnail_column%> as thumbnail, 
    //     <%dat_column%>->thumbnail->>'mime' as mime, 
    //     <%dat_column%>->thumbnail->>'name' as name,  
    //     <%dat_column%>->thumbnail->>'size' as size
    // from masters.mtb_user_master
    // where user_id = <%idval%> or email = <%idval%>
    const loadImage = async (idval = 'userid3') => {
        const ret = await BaseStore.loadImage('loadImage', {idval: idval})
        console.log(ret)
        return ret
    } 

    const login = async (sqltag, params = {}) => BaseStore.login(sqltag, params);
    const logout = async () => BaseStore.logout();    

    return {
        states,
        sqlTags,
        data,
        flatData,
        selectedOriginalRow,
        staffSelected,
        checkExistingOfUserid,
        loadImage,
        login,
        logout,

        register_user,
        load_user_register,
        delete_user,
    }
})
