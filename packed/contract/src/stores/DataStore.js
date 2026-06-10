import { reactive, computed, ref, markRaw } from 'vue'
import { defineStore } from 'pinia'
import { useBaseStore } from '@/stores/BaseStore.js'
import { useAppConfigStore } from '@/stores/AppConfigStore'
import { buildInitColumns, }  from '@/composables/useColumns'
import dayjs from 'dayjs'

/**
 * IMPORTANT:
 *  - Do NOT store AG Grid colDefs (functions/components) inside Pinia state.
 *  - Build them on-demand with buildColumnsDefine().
 */
export const useDataStore = defineStore('dataStore', () => {
    const baseStore = useBaseStore()
    const configStore = useAppConfigStore()
    configStore.loadFromWindow()

    const CONST_DEF = {
    
    }

    // ✅ Pinia state must be JSON-serializable
    const states = reactive({
    })

    // ✅ data container (keep serializable only)
    const data = reactive({
        staffList: [],
        contractList: [],
    })

    const params = reactive({
        attributes: {},
    })

    const itemDefs = ref([]) // array of DB items (serializable)

    const runLoad = async (sql_tag, p = {}, targetKey = null) => {
        if(!targetKey) targetKey=sql_tag
        const ret = await baseStore.load(sql_tag, p)
        if (targetKey) data[targetKey] = ret
        return ret
    }

    const runSave = async (sql_tag, p = {}) => {
        return await baseStore.save(sql_tag, p)
    }

    const getContractDetail = async () => {
        if (!states.currentRow) return null
        const ret = await runLoad('get_contract_detail', { contract_id: states.currentRow.contract_id })
        data.contractDetail = ret
        return ret
    }

    /**
     * ✅ Build colDefs for the current salary items list.
     *
     * Usage in component:
     *   const cols = salaryData.buildColumnsDefine((p)=>salaryData.rowCliked(p))
     *   <AgGridPro :columns="cols" ... />
     */
    function buildColumnsDefine(onRowClicked) {
        const cols = buildInitColumns(onRowClicked, params.revision_type)

        const items = Array.isArray(itemDefs.value) ? itemDefs.value : []
        for (let i = 0; i < items.length; i++) {
            cols.push({
                headerName: items[i].item_label,
                field: items[i].item_name,
                cellStyle: { textAlign: 'right', padding: '4px' },
            })
        }
        return cols
    }

    async function rowCliked(v) {
        states.currentRow = v?.data || null
        await getContractDetail()
    }

    return {
        states,
        data,
        params,
        buildColumnsDefine,
        buildInitColumns,
        runLoad,
        runSave,
        getContractDetail,
    }
})
