import { defineStore, createPinia, setActivePinia } from 'pinia';
import { useBaseStore } from '@/stores/BaseStore';
import { ref, } from 'vue';
import { showSnackbar } from '@/components/Snackbar.vue';
import { usestaffDetailStore } from './staffDetailStore';
import { useStatesStore } from '@/stores/AppStatesStore';
import { forEach } from 'lodash';

setActivePinia(createPinia());

export const useStaffMasterStore = defineStore('StaffMasterStore', () => {

    const baseStore = useBaseStore();
    // This store is used to manage the staff detail modal
    // It is used to show the staff detail modal and to manage the data in the modal
    const detailStore = usestaffDetailStore();
    // This store is used to manage the states of the staff detail modal
    // It is used to show the staff detail modal and to manage the data in the modal
    const statesStore = useStatesStore() 

    const sqlPath = 'sou/staffDetail.sql';
    const staffList = ref([])
    const staffDraftList = ref([])
    const isShowModal = ref(false);
    const staffModalTitle = ref('');

    const status = ref(localStorage.getItem('splitStatus') || 'pending');
    
    // const newRecord = ref(false);

    // This is the list that will be shown in the table
    // It will be either staffList or staffDraftList depending on the status
    // 'approved' status will show staffList, 'draft' or 'pending' will show staffDraftList
    // 'draft' and 'pending' are the same in this case
    // 'approved' data can not be edited, so it will be shown in read-only
    // mode, while 'draft' and 'pending' data can be edited.
    // 'draft' data is the data that is being edited, while 'pending' data
    // is the data that is waiting for approval.     
    // 'draft' data is the data that is being edited, while 'pending' data
    // is the data that is waiting for approval.
    // 'approved' data is the data that has been approved and can not be edited.
    // 'rejected' data is the data that has been rejected and can not be edited
    // 'confirmed' data is the data that has been confirmed and can not be edited.
    // 'removed' data is the data that has been removed and can not be edited.
    // 'pending' data is the data that is waiting for approval and can be edited.
    // 'draft' data is the data that is being edited and can be saved.
    const current_list = ref([])
    // This is the selected staff data that will be shown in the modal
    // It will be either current_data or draft_data depending on the status
    // 'approved' status will show current_data, 'draft' or 'pending' will show draft_data
    // 'draft' and 'pending' are the same in this case
    const selectedStaff = ref({})

    const evaluation_system_columns =
    [
        { field: 'staff_code', headerName: '社員コード',      cellStyle:{"text-align":"left", "padding": "4px"}, pinned: 'left', onCellClicked: rowCliked,},
        { field: 'staff_name', headerName: '社員名',         cellStyle:{"text-align":"left", "padding": "4px"}, pinned: 'left', onCellClicked: rowCliked,},
        { field: 'kana_name', headerName: '社員名（カナ）',  cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'approval_str', headerName: '申請状態',   cellStyle:{"text-align":"left", "padding": "4px"},onCellClicked: rowCliked, },
        { field: 'birthday', headerName: '生年月日',        cellStyle:{"text-align":"left", "padding": "4px"}, onCellClicked: rowCliked, },
        // { field: 'usertype_name', headerName: '権限',            cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'department_code', headerName: '所属部門コード',   cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'department_name', headerName: '所属部門名',   cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'pc_mail', headerName: 'メールアドレス', cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        // { field: 'is_lock', headerName: 'ロック',width:'20px' , cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: unlockPass,},
    ]

    const flatItems = ['staff_name', 'kana_name', 'birthday', 'department_code', 'pc_mail']
    const arrayItems = ['dep_array', 'route_array', 'health_array', 'training_array', 'qualification_array']
    
    const parseSelectedData = (row) => {
        if(!row) return {};

        row.current_data = typeof row.current_data === 'string' ? JSON.parse(row.current_data || '{}') : row.current_data;
        row.draft_data = typeof row.draft_data === 'string' ? JSON.parse(row.draft_data || '{}') : row.draft_data;
        forEach(flatItems, (item) => {
            if(row.current_data && row.current_data[item] !== undefined) {
                row[item] = row.current_data[item];
            } else if(row.draft_data && row.draft_data[item] !== undefined) {
                row[item] = row.draft_data[item];
            } else {
                row[item] = '';
            }
        });

        forEach(arrayItems, (item) => {
            if(row.current_data && row.current_data[item] && Array.isArray(row.current_data[item])) {
                row[item] = row.current_data[item];
            }
            else if(row.draft_data && row.draft_data[item] && Array.isArray(row.draft_data[item])) {
                row[item] = row.draft_data[item];
            }
            else {
                row[item] = [];
            }
        });

        row.approval_str = row.is_lock ? 'ロック中' : (row.is_approved ? '承認済み' : '未承認');
        row.is_lock = row.is_lock ? 'ロック中' : 'ロックなし';
        row.staff_code = row.staff_code || '';
        return data;
    }

    async function rowCliked(row) {
        console.log("rowCliked", row)
        if(!row || !row.data) {
            console.warn("No data found in rowCliked")
            return;
        }
        staffModalTitle.value = '個人情報管理【' + row.data.staff_code + ':'+ row.data.staff_name + '】'

        for (const key in row.data) {
            if (row.data.hasOwnProperty(key)) {
                const value = row.data[key];
                if (value !== null && typeof value !== 'object') {
                    detailStore.staffData[key] = value;
                }
            }
        }

        if(statesStore.showDataStates === 'approved') {
            selectedStaff.value = row.data?.current_data
        } else {
            selectedStaff.value = row.data?.draft_data
        }

        console.log("selected data===", row.data, detailStore.staffData)

        isShowModal.value = true;
    }
    
    async function unlockPass (row){
        if(!row.data.is_lock)
            return;
        const staff_id = row.data.staff_id;
        let res
        try {
            res = await baseStore.save('unlock_pass', {staff_id});
            if(!res)
                throw 'res  false'
            showSnackbar('ロックを解除しました。', 'success');
        } catch (error) {
            showSnackbar('エラーが発生しました', 'error')
            console.log(res)
            console.error(error)
        }
        loadStaffList();
    } 

    const loadStaffList = async (p={}) => {
        const retArray = await generalLoadData( 'get_staff_detail', p )

        console.log('retArray', retArray)
        if(!retArray || retArray.length === 0 ) {
            staffList.value = [{}]
            staffDraftList.value = [{}]
            current_list.value = staffList.value
            console.log("No data found in staff master")
            showSnackbar('スタッフ情報が見つかりません。', 'warning');
            return
        }

        // retArray.forEach(el => {
        //     if(el?.current_data && typeof el.current_data === 'string' ) {
        //         el.current_data = JSON.parse(el.current_data)
        //         el.staff_name = el.current_data.staff_name
        //         el.kana_name = el.current_data.kana_name
        //         el.birthday = el.current_data.birthday
        //         el.department_name = el.current_data.department_name
        //         el.pc_mail = el.current_data.pc_mail
        //         el.dep_array = el.current_data.dep_array || []
        //         el.route_array  = el.current_data.route_array || []
        //         el.health_array = el.current_data.health_array || []
        //         el.training_array = el.current_data.training_array || []
        //         el.qualification_array = el.current_data.qualification_array || []
        //     }
        //     if(el?.draft_data && typeof el.draft_data === 'string' ) {
        //         el.draft_data = JSON.parse(el.draft_data)
        //         el.staff_name = el.draft_data.staff_name
        //         el.kana_name = el.draft_data.kana_name
        //         el.birthday = el.draft_data.birthday
        //         el.department_name = el.draft_data.department_name
        //         el.pc_mail = el.draft_data.pc_mail
        //         el.dep_array = el.draft_data.dep_array || []
        //         el.route_array  = el.draft_data.route_array || []
        //         el.health_array = el.draft_data.health_array || []
        //         el.training_array = el.draft_data.training_array || []
        //         el.qualification_array = el.draft_data.qualification_array || []
        //     }
        // });

        staffList.value = retArray.map(el => {
            if(el?.current_data && typeof el.current_data === 'string' ) {
                el.current_data = JSON.parse(el.current_data)
                el.staff_name = el.current_data.staff_name
                el.kana_name = el.current_data.kana_name
                el.birthday = el.current_data.birthday
                el.department_name = el.current_data.department_name
                el.pc_mail = el.current_data.pc_mail
                el.dep_array = el.current_data.dep_array || []
                el.route_array  = el.current_data.route_array || []
                el.health_array = el.current_data.health_array || []
                el.training_array = el.current_data.training_array || []
                el.qualification_array = el.current_data.qualification_array || []
            }
            return el
        });

        staffDraftList.value = retArray.map(el => {
            if(el?.draft_data && typeof el.draft_data === 'string' ) {
                el.draft_data = JSON.parse(el.draft_data)
                el.staff_name = el.draft_data.staff_name
                el.kana_name = el.draft_data.kana_name
                el.birthday = el.draft_data.birthday
                el.department_name = el.draft_data.department_name
                el.pc_mail = el.draft_data.pc_mail
                el.dep_array = el.draft_data.dep_array || []
                el.route_array  = el.draft_data.route_array || []
                el.health_array = el.draft_data.health_array || []
                el.training_array = el.draft_data.training_array || []
                el.qualification_array = el.draft_data.qualification_array || []
            } 
            return el
        })

        const status = localStorage.getItem('splitStatus') || 'pending'
        if (status === 'approved') 
            current_list.value = staffList.value
        else 
            current_list.value = staffDraftList.value

        console.log( "staffList.value====", staffList.value, staffDraftList.value, current_list.value )
    }

    const CONST_DEF = {
        get_staff_detail:'get_staff_detail'
    }

    const generalLoadData = async (tag, p = {}) => {
        baseStore.sqlpath = sqlPath;
          const result = await baseStore.load(CONST_DEF[tag], p);
          return result;
      };
    

    return {
        staffList
        ,staffDraftList
        ,current_list
        ,selectedStaff
        ,evaluation_system_columns
        ,isShowModal
        ,staffModalTitle
        ,status
        ,loadStaffList
    }
});

