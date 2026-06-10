import { defineStore, } from "pinia";
import { reactive, computed  } from 'vue'
import { useDbStore } from "@/stores/useDbStore";
import { showSnackbar } from "@/utils/Snackbar.vue"; // Abstracted notification utility

export const useDataStore = defineStore("dataStore", () => {
    const BaseStore = useDbStore()

    const states = reactive({
    })

    const data = reactive({
        userlist: [],               // for login user listing
        staffInfo: [],              // staff list 
        departmentList: [],
    })

    const sqlTags = {
        userlist: 'users.get_user_register',
    };

    const checkExistingOfUserid = async(p={}) => {
        const params = {
            check_userid_email: {SQL_TAG: 'users.check_userid_email', ...p },
        }

        const result = await BaseStore.dbAccessWithMultiTags(params);

        console.log("result=",result)

        if( !result || !result.check_userid_email) return false

        console.log("result.check_userid_email===", result?.check_userid_email, result?.check_userid_email.code,result?.check_userid_email.row_count)

        if( result.check_userid_email.code !== 0 ) return false

        if( result.check_userid_email.row_count > 0 ) return true

        return false
    }

    /** load onMounted end */
    const loadMasters = async(p={}) => {
        const params = {
            departmentList: {SQL_TAG: 'users.load_department' },
            staffInfo: {SQL_TAG: 'users.load_staff_data' },
            jobList: {SQL_TAG: 'users.load_job_type' },
            employmentList: {SQL_TAG: 'users.load_employment_status' },
            get_role_list: {SQL_TAG: 'users.get_role_list' },
            // userlist: {SQL_TAG: 'users.load_user_master', ...p },
        }

        const result = await BaseStore.dbAccessWithMultiTags(params);

        for (let key in result) {
            if( result[key].code === 0 ) {
                data[key] = result[key].result
            }
        }
        data['departmentList'].push({department_name: "未定",text:"9999:未定",value: "9999",})
        
        console.log("loadMasters====", data)
    }

    const userlist = async (param = {}) => {
        try {
            const params = {
                userlist: {
                    SQL_TAG: sqlTags.userlist,
                    ...param
                },
            };

            const result = await BaseStore.dbAccessWithMultiTags(params);

            console.log("userlist result=", result);

            if (!result || !result.userlist) {
                showSnackbar("データ取得に失敗しました。", "error");
                return null;
            }

            if (result.userlist.code !== 0) {
                showSnackbar("データ取得に失敗しました。", "error");
                return null;
            }

            // JSONB parse
            const parsedResult = (result.userlist.result || []).map(row => {
                const newRow = { ...row };

                ['content', 'draft_content'].forEach(key => {
                    try {
                        if (
                            typeof newRow[key] === 'string' &&
                            newRow[key].trim() !== ''
                        ) {
                            newRow[key] = JSON.parse(newRow[key]);
                        }
                    } catch (e) {
                        console.error(`JSON parse failed: ${key}`, e);
                        newRow[key] = null;
                    }
                });

                return newRow;
            });

            return parsedResult;

        } catch (error) {
            console.error("Error in userlist:", error);
            showSnackbar("エラーが発生しました。", "error");
            return null;
        }
    };

    /** load master data */
    // onMounted(async () => {
    //     await loadMasters()
    // })

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
        const ret = await BaseStore.loadImage('users.loadImage', {idval: idval})
        console.log(ret)
        return ret
    } 

    const login = async (p = {}) =>  await BaseStore.login('users.authenticate.login', p)
    const logout = async (p = {}) =>  await BaseStore.logout('users.authenticate.logout', p)
    const verify = async (p = {}) =>  await BaseStore.verify('users.authenticate.verify', p)
    const multiQuery = async (blocks = {}, options = {}) => BaseStore.multiQuery(blocks, options)
    const dbAccessWithMultiTags = async (params = {}, options = {}) => {
        try {
            return await BaseStore.dbAccessWithMultiTags(params, options)
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
        sqlTags,
        data,
        flatData,
        selectedOriginalRow,
        staffSelected,
        loadImage,
        login,
        logout,
        verify,
        multiQuery,
        dbAccessWithMultiTags,
        userlist,
        checkExistingOfUserid,
    }
})

