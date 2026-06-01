import { reactive, ref, computed, } from "vue"
// import { ElNotification, ElLoading,} from 'element-plus'
import { defineStore, createPinia, setActivePinia } from "pinia"
import { useDBConnectionStore } from '@/stores/DBConnectionStore.js'
import { showSnackbar } from '@/utils/Snackbar.vue';
// import { useLoading } from 'vuetify/lib/composables/loading';

// import { useMasterStore } from '@/stores/masters/MasterStore'

setActivePinia(createPinia())

export const useCSVUploadStore = defineStore('CSVUploadStore', () => { 
    const dbStore = useDBConnectionStore()
    // const { showLoading, hideLoading } = useLoading();

    const CONST_DEF = {
        sql_path: 'wsg/payroll/payroll-csv-Template.sql',
        csv_upload_insert: 'csv_upload_insert',
        csv_upload_history_list: 'csv_upload_history_list',
        csv_upload_data_select: 'csv_upload_data_select',
        trans_tag: 'csv_upload_insert_transaction',
        adopt_csv_upload_data_default_transaction: 'adopt_csv_upload_data_default_transaction',
        adopt_csv_upload_data_values_transaction: 'adopt_csv_upload_data_values_transaction',
        adopt_csv_upload_data_resident_transaction:'adopt_csv_upload_data_resident_transaction',
        adopt_csv_upload_data_bonus_transaction: 'adopt_csv_upload_data_bonus_transaction',
        get_error_log: 'get_error_log',
        csv_upload_delete: "csv_upload_delete",
    }

    const params = reactive({
        attributes:null,
    })

    const dataContainer = reactive({})

    const salaryYearMonth = ref(new Date())

    const saveResult = ref([])
    const errorMessages = ref([])
    const errorLog = computed(() => dataContainer['get_error_log'])

    const transactionID = () => {
        const id = 'sal_'
        return dbStore.uniqueId(id);
    }

    const load = async ( sqltag, params={} ) => {
        // showLoading();

        const p = {...params, ...params.attributes }

        try {
    
            const resp = await dbStore.dbAccess( CONST_DEF.sql_path, CONST_DEF[sqltag], { ...p } );
            const result = resp[sqltag][0]

            if(result.code != 0 ) {
                showSnackbar('データ取得にエラーが発生しました。', 'error')
                // ElNotification({
                //     title: '',
                //     message: 'データ取得にエラーが発生しました。',
                //     type: 'error',
                // })
                return []
            }
            if( result.result && result.result.length === 0 ){
                showSnackbar('条件に当てはまるデータはありませんでした。', 'warning')
                // ElNotification({
                //     title: '',
                //     message: '条件に当てはまるデータはありませんでした。',
                //     type: 'warning',
                // })
                return []
            }

            dataContainer[sqltag] = result.result

            return dataContainer[sqltag]

        } catch(error) {
            showSnackbar('エラーが発生しました。', 'error')
            // ElNotification({
            //     title: 'エラー',
            //     message: 'エラーが発生しました。',
            //     type: 'error',
            // })

            return null
        }
        finally {
            // hideLoading();
        }
    }

    const loadHistList = async () => load('csv_upload_history_list' )
    const loadHistData = async (p) => load('csv_upload_data_select', p)
    const loadErrorLog = async (transaction_id) => load('get_error_log', {transaction_id: transaction_id})

    /*** {transaction_id: transaction_id} */
    const adopt_evaluation_system_csv_process = (p={}) => {
        const ret = load('adopt_evaluation_system_csv_process', p)
        if( ret && ret.length != 0 ) {
            showSnackbar('データを処理しました。', 'warning')
        }
        return ret;        
    }

    /**
     * 
     * @param :{transaction_id: '', login_staff: '' }
     * @returns 
     */
    const adoptToDefault = async (p={}) => { 
        const ret = load('adopt_csv_upload_data_default_transaction', p)
        if( ret && ret.length != 0 ) {
            showSnackbar('データを処理しました。', 'warning')
            // ElNotification({
            //     title: '',
            //     message: 'データを処理しました。',
            //     type: 'waring',
            // })
        }
        return ret;
    }

    /**
     * 
     * @param {*} p = {transaction_id: '', login_staff: '', yearmonth:'' }
     * @returns 
     */
    const adoptToValues = async (p={}) => {
        const ret = load('adopt_csv_upload_data_values_transaction', p)
        if( ret && ret.length != 0 ) {
            showSnackbar('データを処理しました。', 'warning')
            // ElNotification({
            //     title: '',
            //     message: 'データを処理しました。',
            //     type: 'waring',
            // })
        }
    }

    /**
     * 
     * @param {*} p = {transaction_id: '', login_staff: '', yearmonth:'' }
     * @returns 
     */
    const adoptToBonus = async (p={}) => {
        const ret = load('adopt_csv_upload_data_bonus_transaction', p)
        if( ret && ret.length != 0 ) {
            showSnackbar('データを処理しました。', 'warning')            
            // ElNotification({
            //     title: '',
            //     message: 'データを処理しました。',
            //     type: 'waring',
            // })
        }
        return ret;
    }
    
    const doTransaction = async ( transaction_id, params ) =>  {
        const resp = await dbStore.dbAccess( CONST_DEF.sql_path, CONST_DEF.trans_tag, { transaction_id: transaction_id, ...params } );
        const result = resp[CONST_DEF.trans_tag][0]

        if(result.code != 0 ) {
            showSnackbar('データを処理しました。', 'warning')
            // ElNotification({
            //     title: '',
            //     message: 'データ処理にエラーが発生しました。',
            //     type: 'error',
            // })
            return null
        } 

        return true;
    }

    // Save csv data with transaction. Rollback if has any error
    const save = async ( csvdata, params={TRANSACTION:1} ) => {

        if( csvdata.length <= 0 ) return;

        const p = {...params, ...params.attributes }

        const transaction_id = transactionID();

        // showLoading();

        try {
    
            // 1. save csv data 
            const resp = await dbStore.dbAccess( CONST_DEF.sql_path, CONST_DEF.csv_upload_insert, {"LOOP":csvdata, transaction_id: transaction_id, ...p } );
            console.log(resp)

            const result = resp[CONST_DEF.csv_upload_insert]
            // console.log(result)
            // save result
            const rst = Array.isArray(result)?result:[result]

            // console.log(rst)
            saveResult.value = dataContainer[CONST_DEF.csv_upload_insert] = [...rst]

            // console.log(saveResult.value)
            errorMessages.value = dataContainer.errorMessages = rst.filter(el => el.code != 0)
            if(errorMessages.value) errorMessages.value = []
            
            // console.log(errorMessages)
            if( errorMessages.value && errorMessages.value.length > 0 ) {
                showSnackbar('データ保存にエラーが発生しました。', 'error')
                // ElNotification({
                //     title: '',
                //     message: 'データ保存にエラーが発生しました。',
                //     type: 'error',
                // })
                return null
            }

            const transactionResult = await doTransaction( transaction_id, p )
            if( !transactionResult ) {
                return null
            }

            loadErrorLog(transaction_id);

            showSnackbar('CSVデータを保存しました。', 'success')
            // ElNotification({
            //     title: '成功！',
            //     message: 'CSVデータを保存しました。',
            //     type: 'success',
            // })
        } catch(error) {
            showSnackbar('エラーが発生しました。', 'error')
            // ElNotification({
            //     title: 'エラー',
            //     message: 'エラーが発生しました。',
            //     type: 'error',
            // })
            return null
        }
        finally {
            // hideLoading();
        }

        return transaction_id
    }

    const remove = async(transaction_id, params={TRANSACTION:1}) => {
        // update_user = <%login_staff%>
        // where transaction_id = <%transaction_id%>;
        // csv_upload_delete
        const p = {...params, ...params.attributes }
        
        // showLoading();

        try {
            // 1. delete csv data 
            const resp = await dbStore.dbAccess( CONST_DEF.sql_path, CONST_DEF.csv_upload_delete, {transaction_id: transaction_id, ...p } );
            console.log(resp)

            const result = resp[CONST_DEF.csv_upload_delete]
            const rst = Array.isArray(result)?result:[result]

            dataContainer[CONST_DEF.csv_upload_delete] = [...rst]
            dataContainer.errorMessages = rst.filter(el => el.code != 0)
            if(errorMessages.value) errorMessages.value = []
            
            // console.log(errorMessages)
            if( errorMessages.value && errorMessages.value.length > 0 ) {
                showSnackbar('データ処理エラー', 'error')
                // ElNotification({
                //     title: '',
                //     message: 'データ処理エラー',
                //     type: 'error',
                // })
                return null
            }

            loadHistList();

            return true;
        } catch(error) {
            showSnackbar('エラーが発生しました。', 'error')
            // ElNotification({
            //     title: 'エラー',
            //     message: 'エラーが発生しました。',
            //     type: 'error',
            // })
            return null
        }
        finally {
            // hideLoading();
        }
    }

    return {
        dataContainer,
        saveResult,
        errorMessages,
        errorLog,
        salaryYearMonth,
        params,
        loadHistList,
        loadHistData,
        loadErrorLog,
        adoptToDefault,
        adoptToValues,
        adoptToBonus,
        load,
        save,
        remove,
        adopt_evaluation_system_csv_process,
    }
})
