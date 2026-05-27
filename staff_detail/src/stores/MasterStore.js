import { defineStore, createPinia, setActivePinia } from 'pinia';
import { useBaseStore } from '@/stores/BaseStore';
import { ref, reactive, } from 'vue';
import * as validations from '@/utils/ValidationFunctions.js'; // Ensure this import is correct
import { showSnackbar } from '@/components/Snackbar.vue';
// import dayjs from 'dayjs'

setActivePinia(createPinia());

export const useMasterStore = defineStore('masterStore', () => {
    const baseStore = useBaseStore();

    const ITEM_CLASS = 'user_management';
    const RECORD_LINK_ITEM = ['ju001',];

    const data = reactive({
        get_item_class: [],
        get_item_definitions: [],
        get_item_data: [],
        get_user_login_list: [],
        get_user_items: [],
        v_login_user_items_values: [],
        get_item_data_2: [],
        department_list: [],
        staff_list: [],
        get_v_user:[],
    });

    const conditions = reactive({
        department_id: '',
    })

    const columns = ref([]);
    const editData = ref({});
    const originalData = ref({})
    const gridData = ref([]);

    const messages = {
        '1': '新規（未編集）',
        '2': '新規（未保存）',
        '3': '更新（未編集）',
        '4': '更新（未保存）',
        '0': '保存済',
    }

    const states = reactive({
        currentRow: null,
        status: null, // 1: 新規,2:更新,0:保存済
    })

    const message = computed(() => {
        if(!states.status) return null
        if( states.status in messages )
            return messages[states.status]
        return null
    })

    const rowCliked = (v) => {
        states.currentRow = v.data
        editData.value = {...v.data};
        originalData.value = {...v.data};
        states.status = '3'
    }

    const evaluation_system_columns =
    [
        { field: 'ju001', headerName: '社員コード',      cellStyle:{"text-align":"left", "padding": "4px"}, pinned: 'left', onCellClicked: rowCliked,},
        { field: 'ju002', headerName: '社員名',         cellStyle:{"text-align":"left", "padding": "4px"}, pinned: 'left', onCellClicked: rowCliked,},
        { field: 'ju003', headerName: '社員名（カナ）',  cellStyle:{"text-align":"left", "padding": "4px"}, },
        { field: 'ju004', headerName: '性別区分',        cellStyle:{"text-align":"left", "padding": "4px"}, },
        { field: 'ju005', headerName: '生年月日',        cellStyle:{"text-align":"left", "padding": "4px"}, },
        { field: 'ju006', headerName: '権限',            cellStyle:{"text-align":"left", "padding": "4px"}, },
        { field: 'ju007', headerName: '所属部門コード',   cellStyle:{"text-align":"left", "padding": "4px"}, },
        { field: 'ju008', headerName: 'メールアドレス１', cellStyle:{"text-align":"left", "padding": "4px"}, },
        { field: 'ju009', headerName: '雇用形態コード',   cellStyle:{"text-align":"left", "padding": "4px"}, }
    ]

    const configs = {
        gentle_list: [
            { value: '0', title: '0-女性' },
            { value: '1', title: '1-男性' }
        ],
        user_type_list: [
            { value: '1', title: '1-スタッフ' },
            { value: '2', title: '2-部門管理者' },
            { value: '3', title: '3-システム管理者' }

        ],
        employment_status_list: [
            { value: '1',  title: '1-正社員' },
            { value: '3',  title: '3-嘱託社員' },
            { value: '4',  title: '4-アルバイト' },
            { value: '5',  title: '5-パート' },
            { value: '10', title: '10-役員' }
        ],
    };

    /***
     * load Item Definitions. commonly used  
     */
    async function fetchItemDefinitions() {
        const dat = await generalLoadData(CONST_DEF.get_item_definitions, { item_class: ITEM_CLASS });
        data.get_item_definitions = dat;
        data.get_item_definitions.forEach(el => {
            editData.value[el.item_name] = '';
            try {
                el.item_definitions = JSON.parse(el.item_definitions);
            } catch (e) {
                console.error('Failed to parse item_definitions:', e);
            }

            // set value to the default value by calling the call back function
            if ('default' in el.item_definitions) {
                const functionName = el.item_definitions.default;
                if (typeof validations[functionName] === 'function') {
                    editData.value[el.item_name] = validations[functionName]();
                }
            }
        });

        originalData.value = {...editData.value}

        columns.value = data.get_item_definitions.map(el => ({
            field: el.item_name,
            headerName: el.item_label
        }));
        // loadData();
    }


    /**
     * remove item data
     * @param {*} currentRow 
     * @returns 
     */

    async function removeData(currentRow) {
        if (!currentRow) return;

        if(!data.get_v_user || data.get_v_user.length === 0 ) return

        const dt = currentRow;

        const index = data.get_v_user.findIndex(staff => staff.staff_m_id === dt.staff_m_id);
        if( index === -1 ) {
            showSnackbar('このスタッフはまだ設定されてありません。', 'info');
            return;
        }
    
        const p = {link_value: dt.link_value, item_class: ITEM_CLASS }
        const ret = await baseStore.save(CONST_DEF.delete_item_data, p );
        if(!ret) {
            showSnackbar('削除失敗です。', 'error');    
            return
        }

        showSnackbar('削除しました', 'success');

        generalLoadData(CONST_DEF["get_v_user"], {});
    }

    const checkEdited = () => {
        if( !editData.value ) return false

        if( JSON.stringify(editData.value) != JSON.stringify(originalData.value) )  {
            if( states.status === '1' ) states.status = '2'
            if( states.status === '3' ) states.status = '4'
            return true
        }
        return false
    }

    const checkStaffDepartmentId = () => {
        if( !data.staff_list || data.staff_list.length === 0 ) return true

        const d = data.staff_list.filter(el => el.department_id === editData.value.department_id)

        if( !d || d.length === 0 ) return false

        return true
    }
    
    function validateData() {

        if(!checkEdited()) return // if no changes in the data, just return

        const messages = [];
        if (!data.get_item_definitions || data.get_item_definitions.length === 0) return;

        if( !checkStaffDepartmentId() ){
            messages.push(`「所属部門」:スタッフの所属部門ではないです。`);
        }

        data.get_item_definitions.forEach(el => {
            const functionName = el.item_definitions.validation_function;
            if (typeof validations[functionName] === 'function') {
                const ret = validations[functionName](editData.value[el.item_name]);
                if (ret) {
                    messages.push(`「${el.item_label}」:${ret}`);
                }
            } else {
                console.error(`Function ${functionName} is not defined`);
            }
        });

        if (messages.length > 0) {
            showSnackbar(messages.join('\n'), 'error');
            return false
        }

        return true
    }

    const generalLoadData = async (tag, p = {}) => {
        const result = await baseStore.load(CONST_DEF[tag], p);
        // if (!result || result.length === 0) return;

        data[tag] = result;

        return data[tag];
    };

    /***
     * save edited item data
     * add item_class,link_value,item_name to make the row data to an array data(one item should be one rrecord!)
     */
    async function generalSaveData() {
        if (!data.get_item_definitions || data.get_item_definitions.length === 0) return;

        let dat = { ...editData.value };

        const lk = RECORD_LINK_ITEM.map(el => (dat[el.toLowerCase()]));
        const lnkval = lk.join('_');

        const newItems = data.get_item_definitions
            .filter(el => el.item_name in dat)
            .map(el => ({
                item_name: el.item_name,
                item_class: ITEM_CLASS,
                item_values: { value: dat[el.item_name] },
                link_value: lnkval
            }));

            const ret = await baseStore.save(CONST_DEF.save_item_data, {LOOP:newItems});

        if(ret) {
            showSnackbar('データを保存しました。', 'success');
            originalData.value = { ...editData.value }
            generalLoadData(CONST_DEF["get_v_user"], {});
            return
        }

        showSnackbar('データ保存失敗です。', 'error');
    }

    const CONST_DEF = {
        get_item_class: 'get_item_class',
        get_item_definitions: 'get_item_definitions',
        get_item_data: 'get_item_data',
        save_item_class: 'save_item_class',
        save_item_definition: 'save_item_definition',
        save_item_data: 'save_item_data',
        delete_item_data: 'delete_item_data',
        delete_item_definition: 'delete_item_definition',
        get_user_login_list: 'get_user_login_list',
        get_user_items: 'get_user_items',
        v_login_user_items_values: 'v_login_user_items_values',
        get_item_data_2: 'get_item_data_2',
        department_list: 'department_list',
        staff_list: 'staff_list',
        get_v_user: 'get_v_user',
    };

    return {
        CONST_DEF,
        data,
        columns,
        editData,
        originalData,
        gridData,
        configs,
        evaluation_system_columns,
        states,
        validateData,
        checkEdited,
        fetchItemDefinitions,
        removeData,
        generalLoadData,
        generalSaveData,
        message,
        conditions,
    };
});
