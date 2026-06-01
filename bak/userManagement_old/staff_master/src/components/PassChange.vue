<template>
    <v-container class="align-center fill-height">
      <v-row justify="center">
        <v-col>            
              <v-card>
                <v-card-title tonal class="text-center">
                    <span class="title-text">パスワード変更</span>
                </v-card-title>
                <v-form>
                    <v-text-field
                    v-model="password"
                    label="新しいパスワード"
                    type="password"
                    required
                    outlined
                    dense
                ></v-text-field>
                <v-text-field
                    v-model="password2"
                    label="新しいパスワード再入力"
                    type="password"
                    required
                    outlined
                    dense
                ></v-text-field>
                <v-btn  @click="updatePass" color="primary" block class="my-4 py-3">変更</v-btn>
                </v-form>
              </v-card>   
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useBaseStore } from '@/stores/BaseStore';
  import { showSnackbar } from '@/components/Snackbar.vue';


  const baseStore = useBaseStore();
  
  const password = ref('');
  const password2 = ref('');


  const updatePass = async() => {

    if(password.value == ''){
        return;
    }
    if(password.value !== password2.value){
        showSnackbar('パスワードとパスワード再入力が異なります','red');
        return
    }

    try {
        baseStore.sqlpath = 'sou/staffDetail.sql';
        const res = await baseStore.save('update_user_hash', {pass:password.value})

        baseStore.state.passChangeMode = false;
        baseStore.state.loginMode = true;
        showSnackbar('パスワードを変更しました。')
    } catch (error) {
        showSnackbar('エラーが発生しました', 'red');
        console.error(error)
    }
  }
  

  </script>
  
  <style scoped>
  .fill-height {
    min-height: 100vh;
  }
  .v-card {
    padding: 40px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  }
  .v-card-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  @media (max-width: 604px) {
  .title-text {
    font-size: 20px;
  }

}
  </style>
  