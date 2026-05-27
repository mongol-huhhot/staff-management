<template>
    <v-row class="imageField">
        <v-col class="hidden-sm-and-down">
            <h3>{{ props.title }}QR登録</h3>
            <v-btn @click="createUrl">①画像保存QRの表示</v-btn>
            <v-btn @click="getMobileImage">②取込画像の表示</v-btn>
            <v-btn @click="reset">リセット</v-btn>
        </v-col>
    </v-row>
    <v-row>
        <v-col>
            <v-file-input v-model="files" density="compact" v-show="showImageInput" :label="props.title" accept="image/*,pdf" ></v-file-input>
            <img class="preView" style="display: block;" :src="fileObjArray[0]?.files">
        </v-col>
    </v-row>
    <Teleport to="#app">
        <DraggableModal v-show="qrShow" @closeEvent="() => qrShow = false" :x="300" :y="300" :w="370"  :h="450" :z="9999" stragename="qrModal8">
            <template v-slot:title >携帯から画像登録</template>
            <qrcode-vue :value="qrUrl" level="M" :size="300" ></qrcode-vue>
            <div type="info" style="margin-top: 10px; font-size: 14px;">携帯から保存後、②取り込み画像の表示を押下してください</div>
            <!-- <v-btn v-show="false"  class="white-bg" style="color: black;margin-top: 20px;float:right;" @click="getMobileImage">②取込画像の表示</v-btn> -->
        </DraggableModal>
    </Teleport>
</template>

<script setup>
import {ref,} from 'vue'
import QrcodeVue from 'qrcode.vue'
import { showSnackbar } from '@/components/Snackbar.vue';
import { useDBConnectionStore } from '@/stores/DBConnectionStore.js';
import { useBaseStore } from "@/stores/BaseStore.js";
import DraggableModal from './DraggableModal.vue';
const dbStore = useDBConnectionStore()
const baseStore = useBaseStore();
const files = ref();
const qrUrl = ref();
const seqTime = ref(new Date().getTime());
const sqlpath = 'souAccountTemplate.sql'
const qrShow = ref(false);
const showImageInput = ref(true);

const fileObjArray = defineModel('fileObjArray', {default:[]});
const props = defineProps({
    decsription:String, //ファイルの種別
    max_files:{ //アップロードできるファイル個数
        type:Number,
        default:1
    }
    ,title:{
        default:'画像'
        ,type:String
    }
});
 

const createUrl = async () => {
    const formData = new FormData();
    formData.append('symbol', props.decsription + new Date().getTime());
    formData.append('decsription', props.decsription);
    formData.append('max_files', props.max_files);
    const request = new Request('/jwtr250558/fileUp/jwt_file_url.php',{
        method:'POST',
        body:formData
    })
    const response = await fetch(request)
    if(!response.ok){
        showSnackbar('エラーが発生しました', 'red');
        return;
    }
    
    const resjson = await response.json()
    qrUrl.value = resjson.url;
    qrShow.value = true;
    console.log(resjson.url)
}


const getMobileImage = async ()=> {
    const sqlTag = 'get_guest_pool_files';
    const obj = {
        'decsription': props.decsription
    }
    let resp;
    try {
        resp = await dbStore.dbAccess( sqlpath, sqlTag,obj);
        console.log(resp)
        if(resp[sqlTag][0].code != 0){
            throw 'code != 0';
        }
        const result = resp[sqlTag][0].result;
        if(!result[0]){
            showSnackbar('ファイルが見つかりませんでした。', 'red');
            return
        }
        //pond.value.addFiles(result.map((e) => e.files))
        // result.map((e) => {
        //     const imageUrl = window.URL.createObjectURL(e.files) //URL生成
        //     console.log(imageUrl) //メモリ上のBlobを参照するURLがコンソールに表示される
        //     window.URL.revokeObjectURL(imageUrl) //URL破棄
        // })
        // fileLinks.value = result.map((e) => e.files);
        // fileIds.value = result.map((e) => e.id);
        fileObjArray.value = result;
        qrShow.value = false;
        showImageInput.value = false
        files.value = '';
        // pond.value.removeFiles();
    } catch (error) {
        console.log(resp)
        console.error(error)
        showSnackbar('エラーが発生しました', 'red');
    }

}
const reset =  () => {
    fileObjArray.value = [];
    showImageInput.value = true;
    files.value = ''
}

/**
 * 登録されたファイル個数を返却
 * @return {integer}
 */
 const getFileNum = () => {
    // const files = pond.value.getFiles();
    // console.log( ' files.value', files.value)
    // return files?.length
    console.log( ' files.value', files.value)
    if(files.value)
        return 1;
}

/**
 * filePond内に格納されたファイルをpoolに保存し、poolのIDをfileObjArray modelに格納
 */
const saveImage = async () =>{
    seqTime.value = new Date().getTime();
    let response;
    //ファイルを保存
    try {
        const formData = new FormData();
        //const files = await pond.value.prepareFiles();
        if(!files.value){
            return false;
        }
        // files.forEach(element => {
        //     formData.append('files[]', element.output)
        // });
        formData.append('files[]', files.value)
        formData.append('decsription', props.decsription)
        formData.append('fk_id', props.decsription + seqTime.value);
        const request = new Request('/jwtr250558/saveMultiBlobProcessFilePool.php',{
            method:'POST'
            ,body:formData
            }
        )
        response = await fetch(request)
        if(!response.ok){
            throw 'save file respons not ok'
        }
    } catch (error) {
        console.log(response);
        console.error(error);
        showSnackbar('エラーが発生しました', 'red');
        return false;
    }

    //保存したファイルIDを取得
    let resp;
    try {
        const sqlTag = 'get_pool_file_ids';
        const obj = {'fk_id': props.decsription + seqTime.value}
        resp = await dbStore.dbAccess( sqlpath, sqlTag,obj);
        const result = resp[sqlTag][0].result;
        if(!result[0]){
            throw 'file not fond';
        }
        fileObjArray.value = result;
        return result;
    } catch (error) {
        console.log(resp);
        console.error(error);
        showSnackbar('エラーが発生しました', 'red');
        return false;
    }
    return true;
}



defineExpose({
    saveImage,
    getFileNum,
    reset
})



</script>

<style scoped>


</style>