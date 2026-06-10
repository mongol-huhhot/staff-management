<template>
  <v-card>
    <v-card-text>
      {{ form}}
      <v-text-field
        v-model="form.userid"
        label="User ID"
      />

      <v-text-field
        v-model="form.password"
        label="Password"
        type="password"
      />

      <v-btn
        color="primary"
        :loading="loading"
        @click="login"
      >
        Login
      </v-btn>

    </v-card-text>
  </v-card>
</template>

<script setup>
import { reactive, ref } from 'vue'

const emit = defineEmits([
  'loginSuccess',
  'loginError',
  'loginStatus'
])

const loading = ref(false)

const form = reactive({
  userid:'',
  password:''
})

async function login(){

  loading.value = true

  emit('loginStatus',{
    loading:true
  })

  try{

    const payload = {
      COMMON:{
        tid:'premier',
        RETURN:1,
        RESULT_TYPE:1,
        QUERY_TYPE:2,
        SQL_PATH:'premier/showcase/master/userMasterSqlTemplate.sql',
        AUTH_REQUIRED:0,
        TRANSACTION:0
      },
      login:{
        SQL_TAG:'login',
        userid:form.userid,
        password:form.password
      }
    }

    const response = await fetch('/premier/dataEngine/v3/databaseEngine.php',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        json_string:JSON.stringify(payload)
      })
    })

    const json = await response.json()

    if(json.COMMON.code !== 0){
      throw new Error(json.COMMON.message)
    }

    const userData = json.login.result?.[0]

    /**
     * JWT
     */
    if(userData?.token){
      localStorage.setItem('token',userData.token)
    }

    localStorage.setItem('user',JSON.stringify(userData))

    emit('loginSuccess',userData)

    emit('loginStatus',{
      loading:false,
      success:true,
      user:userData
    })

  }catch(e){

    emit('loginError',e)

    emit('loginStatus',{
      loading:false,
      success:false,
      error:e.message
    })

  }finally{
    loading.value = false
  }

}
</script>