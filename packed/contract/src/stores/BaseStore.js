import { defineStore, createPinia, setActivePinia } from "pinia";
import { useDBConnectionStore } from "@/stores/DBConnectionStore.js";
import { reactive } from 'vue'
// import { useSnackbar } from 'vuetify-use-dialog' // or use Vuetify's built-in snackbar

setActivePinia(createPinia());

/**
 * Base store that other stores inherit from
 * Adds message display functionality for DBConnectionStore access results
 * 
 * Chen. 2023/11/22
 * Converted to Vuetify version
 */
export const useBaseStore = defineStore('baseStore', () => {
    const dbStore = useDBConnectionStore();
    // Default SQL file unless specific request is made
    const sqlpath = 'fuji-sangyo/payroll/payroll-main-Template.sql'

    // the states of the module
    const state = reactive({
        staff_permission: '',
        loading: false, // Added loading state for Vuetify
        snackbar: {
            show: false,
            text: '',
            color: 'success',
            timeout: 3000
        }
    })

    // some parameters from outside, or initial properties
    const params = reactive({
        props: {}, // the parameters from login module. usually given from index.php, which contains login staff id
    })

    // Helper function for showing notifications with Vuetify snackbar
    const showNotification = (message, type = 'error', title = '') => {
        // You can implement this based on your Vuetify setup
        // Option 1: Using a composable/store for snackbar
        state.snackbar = {
            show: true,
            text: message,
            color: getSnackbarColor(type),
            timeout: 3000
        }
        
        // Option 2: You can emit this to a global snackbar component
        // Option 3: Use vuetify-use-dialog library
        console.log(`${type.toUpperCase()}: ${title} - ${message}`)
    }

    const getSnackbarColor = (type) => {
        switch(type) {
            case 'success': return 'success'
            case 'error': return 'error'
            case 'warning': return 'warning'
            case 'info': return 'info'
            default: return 'grey'
        }
    }

    // Helper function for loading state management
    const showLoading = () => {
        state.loading = true
    }

    const hideLoading = () => {
        state.loading = false
    }

    /**
     * purpose: for selecting data from db
     * @param {*} sqltag: the tag of a query statement
     * @param {*} param : any object parameters. 
     * @param {*} sqlfile : sql file path. when you omit this parameter, its default value is null
     * @returns : the query result: an object array  
     */
    const load = async (sqltag = null, param = {}, sqlfile = null) => {
        if (!sqltag) return null;

        if (!sqlfile)
            sqlfile = sqlpath

        showLoading();

        try {
            const resp = await dbStore.dbAccess(sqlfile, sqltag, { ...param });
            const result = resp[sqltag][0]

            if (result.code != 0) {
                showNotification('データ取得にエラーが発生しました。', 'error', 'データ取得エラー')
                return null
            }
            if (result.result && result.result.length === 0) {
                // Optional: Show warning for empty results
                // showNotification('条件に当てはまるデータはありませんでした。', 'warning', 'データなし')
                return null
            }

            return result.result

        } catch (error) {
            showNotification('エラーが発生しました。', 'error', 'エラー')
            return null
        }
        finally {
            hideLoading();
        }
    }

    /**
     * purpose: mainly for insert/update/delete
     * @param {*} sqltag: the tag of a sql statement
     * @param {*} param : any object parameters. 
     * @param {*} sqlfile : sql file path. when you omit this parameter, its default value is null
     * @returns : the query result: an object array  
     */
    const save = async (sqltag = null, params_data = {}, sqlfile = null) => {
        if (!sqltag) return null;

        if (!sqlfile)
            sqlfile = sqlpath

        showLoading();

        try {
            const resp = await dbStore.dbAccess(sqlfile, sqltag, { ...params_data });
            const result = resp[sqltag]
            const rst = Array.isArray(result) ? result : [result]

            let errorMessages = rst.filter(el => el.code != 0)
            if (errorMessages && errorMessages.length > 0) {
                showNotification('データ処理にエラーが発生しました。', 'error', '')
                return null
            }
            
            showNotification('データ処理をしました。', 'warning', '')
            return true

        } catch (error) {
            showNotification('エラーが発生しました。', 'error', 'エラー')
            return null
        }
        finally {
            hideLoading();
        }
    }

    // direct access to server
    const access = (url, formdata) => dbStore.access(url, formdata)

    // generate a unique code
    const uniqueId = (prefix) => dbStore.uniqueId(prefix)

    // Method to reset snackbar state
    const resetSnackbar = () => {
        state.snackbar.show = false
    }

    return {
        params,
        state,
        load,
        save,
        access,
        uniqueId,
        showLoading,
        hideLoading,
        showNotification,
        resetSnackbar,
    }
})