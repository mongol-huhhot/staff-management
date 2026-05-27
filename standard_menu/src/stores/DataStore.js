import { defineStore, } from "pinia";
import { reactive, } from 'vue'
import { useBaseStore } from "@/stores/BaseStore";

export const useDataStore = defineStore("dataStore", () => {
    const BaseStore = useBaseStore()

    const states = reactive({
    })

    const data = reactive({
        menulist:[],
        loginuser:[],
    })
    
    /** load onMounted end */
    const loadMasters = async(p={}) => {
        const params = {
            menulist: {SQL_TAG: 'load_menu', ...p },
            loginuser: {SQL_TAG: 'load_user', ...p },
        }

        const result = await BaseStore.excecuteMultiQuery(params);

        for (let key in result) {
            if( result[key].code === 0 ) {
                data[key] = result[key].result.map(el=> {
                    if (el.content && typeof el.content === 'string')
                        el.content = JSON.parse(el.content)
                        Object.assign(el,el.content)

                    return el
                })
                data[key] = result[key].result
            }
        }
        
        console.log("loadMasters====", data)
    }

    return {
        states,
        data,
        loadMasters,
    }
})
