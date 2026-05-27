import { defineStore, createPinia, setActivePinia } from 'pinia';
import { useBaseStore } from '@/stores/BaseStore';
import { ref, reactive, } from 'vue';
import { showSnackbar } from '@/components/Snackbar.vue';
import { usestaffDetailStore } from './staffDetailStore';


setActivePinia(createPinia());

export const useStaffMasterStore = defineStore('StaffMasterStore', () => {

    const baseStore = useBaseStore();
    const detailStore = usestaffDetailStore();
    const sqlPath = 'sou/staffDetail.sql';
    const staffList = ref([])
    const isShowModal = ref(false);
    const staffModalTitle = ref('');


    const evaluation_system_columns =
    [
        { field: 'userid', headerName: '社員コード',      cellStyle:{"text-align":"left", "padding": "4px"}, pinned: 'left', onCellClicked: rowCliked,},
        { field: 'username', headerName: '社員名',         cellStyle:{"text-align":"left", "padding": "4px"}, pinned: 'left', onCellClicked: rowCliked,},
        { field: 'staff_name_kana', headerName: '社員名（カナ）',  cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'approval_str', headerName: '申請状態',   cellStyle:{"text-align":"left", "padding": "4px"},onCellClicked: rowCliked, },
        { field: 'birthday', headerName: '生年月日',        cellStyle:{"text-align":"left", "padding": "4px"}, onCellClicked: rowCliked, },
        { field: 'usertype_name', headerName: '権限',            cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'department_name_show', headerName: '所属部門',   cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        { field: 'pc_mail', headerName: 'メールアドレス', cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: rowCliked,},
        // { field: 'is_lock', headerName: 'ロック',width:'20px' , cellStyle:{"text-align":"left", "padding": "4px"},  onCellClicked: unlockPass,},
    ]

    async function rowCliked(row) {
        const staff_id = row.data.staff_id
        staffModalTitle.value = '個人情報管理【' + row.data.userid + ':'+ row.data.username + '】'
        await detailStore.loadStaff(staff_id)

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


    const loadStaffList = async () => {
        const retArray = await generalLoadData('load_staff_list')
        console.log('retArray', retArray)
        staffList.value= retArray;

    }


    const CONST_DEF = {
        load_staff_list:'load_staff_list'
    }

    const generalLoadData = async (tag, p = {}) => {
        baseStore.sqlpath = sqlPath;
          const result = await baseStore.load(CONST_DEF[tag], p);
          return result;
      };
    

    return {
        staffList
        ,evaluation_system_columns
        ,isShowModal
        ,staffModalTitle
        ,loadStaffList
    }
});