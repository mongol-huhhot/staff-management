import { defineStore, } from "pinia";
import { reactive, onMounted, computed  } from 'vue'
import { useBaseStore } from "@/stores/BaseStore";

export const useDataStore = defineStore("dataStore", () => {
    const BaseStore = useBaseStore()

    const states = reactive({
    })

    const data = reactive({
        userlist: [],               // for login user listing
        staffInfo: [],              // staff list 
        departmentList: [],
        check_userid_email: [],
    })

    const sqlTags = {
        
    };

    const runLoad = async (sql_tag, p = {}, targetKey = null) => {
        if(!targetKey) targetKey=sql_tag
        const ret = await BaseStore.load(sql_tag, p)
        if (targetKey) data[targetKey] = ret
        return ret
    }

    const runSave = async (sql_tag, p = {}) => {
        return await BaseStore.save(sql_tag, p)
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
    }
})
