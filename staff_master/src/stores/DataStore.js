import { defineStore, } from "pinia";
import { reactive, onMounted, computed  } from 'vue'
import { useBaseStore } from "@/stores/BaseStore";


export const useDataStore = defineStore("dataStore", () => {
    const BaseStore = useBaseStore()

    const states = reactive({
    })  

    const data = reactive({
        get_staff_detail: [],
        load_user_master: [],
    }) 

    const load = async (sqltag, param = {}) => {
        // console.log("dataStore===load===", sqltag, {...param})
        if (!sqltag) return null;
        try {
            const resp = await BaseStore.load(sqltag, { ...param });
            if(!resp) {
                return null;
            }
            data[sqltag] = resp;
            return resp;
        } catch (error) {
            console.error("Error in load function:", error);
            return null;
        }
    };
    
    return {
        states,
        data,
        load,
    }
})
