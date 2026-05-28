import { defineStore, } from "pinia";
import { reactive, } from 'vue'
//  import { useBaseStore } from "@/stores/BaseStore";
import { useDbStore } from "@/stores/useDbStore";

export const useDataStore = defineStore("dataStore", () => {
    const DbStore = useDbStore()

    const states = reactive({
    })

    const data = reactive({
        menulist:[],
        loginuser:[],
    })
    
    /** load onMounted end */
    // const loadMasters = async(p={}) => {
    //     const params = {
    //         menulist: {SQL_TAG: 'menu.load_menu', ...p },
    //         loginuser: {SQL_TAG: 'menu.load_user', ...p },
    //     }
    //     const dat = await DbStore.dbAccessWithMultiTags(params);
    //     const result = dat?.data; // must be [data] item, not the whole resp which contains code and message!!!
    //     if( dat.code === 0 ) {
    //         for (let key in result) {
    //             data[key] = result[key]
    //         }
    //     }
    //     console.log("dataStore loadMasters result===", data)

    //     return data;
    // }

    const loadMasters = async (p = {}) => {
        const params = {
            menulist: {
                SQL_TAG: 'menu.load_menu',
                ...p,
            },

            loginuser: {
                SQL_TAG: 'menu.load_user',
                ...p,
            },
        }

        const dat = await DbStore.dbAccessWithMultiTags(
            params,
            {
                loading: true,
                loadingText: 'マスタデータ読込中...',
            }
        )

        const result = dat?.data || {}

        if (dat?.code === 0) {

            Object.keys(result).forEach((key) => {

                let rows = result[key]

                // array only
                if (Array.isArray(rows)) {

                    rows = rows.map((row) => {

                        // content JSON.parse
                        if (
                            row?.content &&
                            typeof row.content === 'string'
                        ) {
                            try {
                                row.content = JSON.parse(row.content)
                            } catch (e) {
                                console.warn(
                                    `JSON parse failed: ${key}.content`,
                                    e
                                )
                            }
                        }

                        return row
                    })
                }

                data[key] = rows
            })
        }

        return data
    }

    return {
        states,
        data,
        loadMasters,
    }
})
