// Utilities
import { defineStore,  createPinia, setActivePinia } from 'pinia'
import { useBaseStore } from '@/stores/BaseStore';
import { ref, reactive } from "vue";
import { showSnackbar } from '@/components/Snackbar.vue';
import { useStaffMasterStore } from '@/stores/StaffMasterStore';

setActivePinia(createPinia());
export const usestaffDetailStore = defineStore('staffDetailStore', () => {
  const baseStore = useBaseStore();
  const staffMasterStore = useStaffMasterStore();

  const staffData = ref({})
  const diffData = ref({});
  const approvalStr = ref('');
  const dialogVisible = ref(false);
  const isMailCheck = ref(false);
  const showRejectDialog = ref(false);
  const rejectReason = ref('');

  const sqlPath = 'sou/staffDetail.sql';
  const qualList = ref([]);

  const carDefault = {
    imageRef:null,
    fileObjArray:[]
}

const resume = reactive(structuredClone(carDefault));

const loadStaff = async (staff_id) => {
    baseStore.sqlpath = sqlPath;
    staffData.value = {};
    diffData.value = {};
    approvalStr.value = '未申請'
    const [loadStaffData, loadDiffData] = 
    await Promise.all([generalLoadData('get_staff_detail', {staff_id:staff_id}), generalLoadData('get_staff_diff', {staff_id:staff_id})] )

    if(loadStaffData && loadStaffData[0]){
      staffData.value = JSON.parse(loadStaffData[0].data_json)
      approvalStr.value = loadStaffData[0].approval_str
    }
    staffData.value.staff_id = staff_id

    if(loadDiffData && loadDiffData[0]){
      diffData.value = JSON.parse(loadDiffData[0].data_json)
    }
    diffData.value.staff_id = staff_id;


    if(!staffData.value.dep_array || !staffData.value.dep_array[0]){
      staffData.value.dep_array = [{id:1}]
    }
    if(!staffData.value.qualification_array || !staffData.value.qualification_array[0]){
      staffData.value.qualification_array = [{}]
    }

    if(!staffData.value.training_array || !staffData.value.training_array[0] ){
      staffData.value.training_array = [{}]
    }

    if(!staffData.value.route_array || !staffData.value.route_array[0]){
      staffData.value.route_array = [{id:1}]
    }
    if(!staffData.value.health_array || !staffData.value.health_array[0]){
      staffData.value.health_array = [{}];
    }

  } 

  const myDataLoad = async (p={}) => {
    const res = await generalLoadData('get_my_id', p)
    await loadStaff(res[0].my_id)
    //loadStaff('1')
  }


  const saveStaff = async(is_temp = false) => {

    try {
      await saveImages();
      const jsonStr = JSON.stringify(staffData.value);
      baseStore.sqlpath = sqlPath;
      const res = await baseStore.save(CONST_DEF.save_staff_detail, 
        {staff_id:staffData.value.staff_id, jsonb_data:jsonStr, file_id3:resume.file_id3,
          is_temp: is_temp ? '1': '0'
         })
      if(!res)
        throw 'res false'
      showSnackbar('保存しました', 'success');

      await loadStaff(staffData.value.staff_id);
      return true;
    } catch (error) {
      showSnackbar('エラーが発生しました', 'error')
      console.error(error)
      return false;
    }

  }


  const saveMail = async() => {
    try {
        baseStore.sqlpath = sqlPath;
        if (validateEmail(staffData.value.update_pc_mail)) {
            const res = await baseStore.save(CONST_DEF.save_staff_mail, {staff_id:staffData.value.staff_id,"pc_mail":staffData.value.update_pc_mail})
            if(!res)
                throw 'res false'

            showSnackbar('メールアドレスを更新しました', 'success');
            dialogVisible.value = false;
              await loadStaff(staffData.value.staff_id);
            return false;
        }
        if (!validateEmail(staffData.value.update_pc_mail)) {
            showSnackbar('有効なメールアドレスを入力して下さい', 'error')
        }
    } catch (error) {
      showSnackbar('エラーが発生しました', 'error')
      console.error(error)
      return false;
    }

  }

  const saveImages = async() => {
    try {
      for(let i = 0; i < staffData.value?.qualification_array?.length; i++ ){
        const qua = staffData.value?.qualification_array?.[i];
        if(qua?.imageRef?.getFileNum && qua?.imageRef?.getFileNum() > 0){

          const imagArray = await qua.imageRef.saveImage();
          
            if(!imagArray)
                throw 'imageError'
        }
        qua.file_id = qua?.fileObjArray?.[0]?.id ?? 0;

        if(qua?.imageRef2?.getFileNum && qua?.imageRef2?.getFileNum() > 0){
          const imagArray = await qua.imageRef2.saveImage();
            if(!imagArray)
                throw 'imageError'
        }
        qua.file_id2 = qua?.fileObjArray2?.[0]?.id ?? 0;

      }

      for(let i= 0; i < staffData.value?.training_array?.length; i++){
        const training = staffData.value?.training_array?.[i];
        if(training?.imageRef?.getFileNum && training?.imageRef?.getFileNum() > 0){
          const imagArray = await training.imageRef.saveImage();
            if(!imagArray)
                throw 'imageError'
        }
        training.file_id = training?.fileObjArray?.[0]?.id ?? 0;
      }

      for(let i = 0; i < staffData.value?.health_array?.length; i++ ){
        const health = staffData.value?.health_array?.[i];
        if(health?.imageRef?.getFileNum && health?.imageRef?.getFileNum() > 0){

          const imagArray = await health.imageRef.saveImage();
          
            if(!imagArray)
                throw 'imageError'
        }
        health.file_id = health?.fileObjArray?.[0]?.id ?? 0;

        if(health?.imageRef2?.getFileNum && health?.imageRef2?.getFileNum() > 0){
          const imagArray = await health.imageRef2.saveImage();
            if(!imagArray)
                throw 'imageError'
        }
        health.file_id2 = health?.fileObjArray2?.[0]?.id ?? 0;

      }


    // 車検の画像登録
    if (resume.imageRef?.getFileNum() > 0) {
        const imagArray = await resume.imageRef.saveImage();
        
        if (!imagArray) {
            throw 'imageError';
        }
    }
    
    resume.file_id3 = 0;
    
    if (resume.fileObjArray) {
        resume.file_id3 = resume?.fileObjArray?.[0]?.id ?? 0;
    }

    } catch (error) {
      console.error(error)
      throw '画像保存エラー'
    }
  }

  //スタッフ承認
  const approvalStaff = async (staff_id) => {
    try {
      baseStore.sqlpath = sqlPath;

      const res = await baseStore.save(CONST_DEF.approval_staff, {staff_id:staff_id})
      if(!res)
        throw 'res false'
      return true;
    } catch (error) {
      console.error(error)
      showSnackbar('エラーが発生しました', 'error')
      return false
    }
  }

  const saveApprovalStaff = async () => {

    const res = await saveStaff();
    if(!res) return;
    await approvalStaff(staffData.value.staff_id);
    await loadStaff(staffData.value.staff_id);
    showSnackbar('承認しました。');
  }

//差し戻しモーダルの表示
  const showRebateModal = () => {
    rejectReason.value = '';
    showRejectDialog.value = true;
  }

  //差し戻し
  const rejectStaff = async () => {
    try {
      if (!rejectReason.value) {
        showSnackbar('差し戻し理由を入力してください', 'error');
        return;
      }
      const res = await baseStore.save(CONST_DEF.reject_staff, { staff_id:staffData.value.staff_id, reject_reason: rejectReason.value });
      if (!res) throw 'res false';
      showSnackbar('スタッフを差し戻しました', 'success');
      showRejectDialog.value = false;
      staffMasterStore.isShowModal = false;
    } catch (error) {
      console.error(error);
      showSnackbar('エラーが発生しました', 'error');
    }
  }

  const generalLoadData = async (tag, p = {}) => {
    baseStore.sqlpath = sqlPath;
      const result = await baseStore.load(CONST_DEF[tag], p);
      // if (!result || result.length === 0) return;
      return result;
  };

  const CONST_DEF = {
    get_staff_detail:'get_staff_detail'
    ,get_staff_diff:'get_staff_diff'
    ,save_staff_detail:'save_staff_detail'
    ,save_staff_mail:'save_staff_mail'
    ,get_my_id:'get_my_id'
    ,approval_staff:'approval_staff'
    ,reject_staff:'reject_staff'
  }


  //現住所
  const currentPostCodeSetter = async () => {
    const postcode = staffData.value.current_post_code
    const  address = await postCode2Address(postcode);
    if(!address.addresses[0]) return;
    staffData.value.current_address_1 = address.addresses[0].ja.prefecture;
    staffData.value.current_address_2 =  address.addresses[0].ja.address1 + address.addresses[0].ja.address2 + address.addresses[0].ja.address3 + address.addresses[0].ja.address4
    staffData.value.current_address_kana =  address.addresses[0].kana.prefecture + address.addresses[0].kana.address1 + address.addresses[0].kana.address2 
    + address.addresses[0].kana.address3 + address.addresses[0].kana.address4
  }

  //住民票住所
  const residencePostCodeSetter = async () => {
    const postcode = staffData.value.residence_post_code
    const  address = await postCode2Address(postcode);
    if(!address.addresses[0]) return;
    staffData.value.residence_address_1 = address.addresses[0].ja.prefecture;
    staffData.value.residence_address_2 =  address.addresses[0].ja.address1 + address.addresses[0].ja.address2 + address.addresses[0].ja.address3 + address.addresses[0].ja.address4
    staffData.value.residence_address_kana =  address.addresses[0].kana.prefecture + address.addresses[0].kana.address1 + address.addresses[0].kana.address2 
    + address.addresses[0].kana.address3 + address.addresses[0].kana.address4
  }

  //緊急連絡先
  const emergencyPostCodeSetter = async () => {
    const postcode = staffData.value.emergency_post_code
    const  address = await postCode2Address(postcode);
    if(!address.addresses[0]) return;
    staffData.value.emergency_address_1 = address.addresses[0].ja.prefecture;
    staffData.value.emergency_address_2 =  address.addresses[0].ja.address1 + address.addresses[0].ja.address2 + address.addresses[0].ja.address3 + address.addresses[0].ja.address4
    staffData.value.emergency_address_kana =  address.addresses[0].kana.prefecture + address.addresses[0].kana.address1 + address.addresses[0].kana.address2 
    + address.addresses[0].kana.address3 + address.addresses[0].kana.address4
  }

  //家族
  const dependentPostCodeStter = async (index) => {
    const postcode = staffData.value.dep_array[index].dependent_post_code;
    const  address = await postCode2Address(postcode);
    if(!address.addresses[0]) return;
    staffData.value.dep_array[index].dependent_address_1 = address.addresses[0].ja.prefecture;
    staffData.value.dep_array[index].dependent_address_2 =  address.addresses[0].ja.address1 + address.addresses[0].ja.address2 + address.addresses[0].ja.address3 + address.addresses[0].ja.address4
    staffData.value.dep_array[index].dependent_address_kana =  address.addresses[0].kana.prefecture + address.addresses[0].kana.address1 + address.addresses[0].kana.address2 
    + address.addresses[0].kana.address3 + address.addresses[0].kana.address4
  }

  const postCode2Address = async  (postcode) => {
    if(postcode.length != 7) return false;
    const url = 'https://jangatech.github.io/jp-postal-code-api/docs/api/v1/' + postcode + '.json'
    const res = await fetch(url)
    if(!res.ok){
      console.error(res)
      return;
    }
    return await res.json();
  }

  const changeTogether = (index) => {
    if(staffData.value.dep_array[index].dependent_together_flg !== '1') return;

    staffData.value.dep_array[index].dependent_post_code = staffData.value.current_post_code
    staffData.value.dep_array[index].dependent_address_1 = staffData.value.current_address_1
    staffData.value.dep_array[index].dependent_address_2 = staffData.value.current_address_2
    staffData.value.dep_array[index].dependent_address_3 = staffData.value.current_address_3
    staffData.value.dep_array[index].dependent_address_4 = staffData.value.current_address_4
    staffData.value.dep_array[index].dependent_address_kana = staffData.value.current_address_kana

  }

    // バリデーションルール
     const rules = {
        required: (value) => !!value || '必須項目です',
        email: (value) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(value) || '有効なメールアドレスを入力してください';
        },
    };
    
    // フォームの参照
    const baseForm = ref(null);

    const valForm = async () => {
        if (baseForm.value) {
            const { valid } = await baseForm.value.validate();
            setValidationResult(valid);
            showSnackbar('必須項目です', 'error');
        }
    };

    // メールアドレスのバリデーション関数
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email)) {
          isMailCheck.value = false;
          return false;
        }

        isMailCheck.value = true;
        return true;
      };

    // ローカルストレージに一時保存する
    const saveLocalStorage = () => {
        localStorage.setItem('staffData', JSON.stringify(staffData.value));
        showSnackbar('一時保存しました（画像は保存されません）', 'success');
    };

    //ローカルストレージから一時保存したデータを取得する
    const getLocalStorage = () => {
        const data = localStorage.getItem('staffData');
        if (data) {
            staffData.value = JSON.parse(data);
        }
    };


  return {
    staffData
    ,diffData
    ,approvalStr
    ,qualList
    ,rules
    ,baseForm
    ,resume
    ,dialogVisible
    ,isMailCheck
    ,showRejectDialog
    ,rejectReason
    ,showRebateModal
    ,valForm
    ,loadStaff
    ,saveStaff
    ,saveMail
    ,saveApprovalStaff
    ,rejectStaff
    ,myDataLoad
    ,currentPostCodeSetter
    ,residencePostCodeSetter
    ,emergencyPostCodeSetter
    ,dependentPostCodeStter
    ,changeTogether
    ,validateEmail
    ,saveLocalStorage
    ,getLocalStorage
  }
})
