import { defineStore, createPinia, setActivePinia } from "pinia";
import { reactive } from 'vue'

setActivePinia(createPinia());

/**
 * AgGrid共通テーブル用ストア
* 
 * 陳。2024/04/08
 */
export const useAgGridStore = defineStore('agGridStore', () => {
    const params = reactive({
        data: [],
        columns:null,
        show_op:false,
        title: null,
        download_file_name: null,
        filters:[],
        showCols: {},
        filteredCount: 0,
        FilteredData: [],
        filtered_columns: null,
    })
    
    return {
        params
    }
})
