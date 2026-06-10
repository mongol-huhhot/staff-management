<script setup>
import { reactive } from 'vue'

const form = reactive({
    userid:'',
    password:''
})

async function doLogin(){

    const loginJson = {
        COMMON:{
            tid:'premier'
        },

        login:{
            SQL_PATH:'showcase/generic-folder/auth.sql',
            SQL_TAG:'login',
            RETURN:1,

            user:form.userid,
            password:form.password
        }
    }

    const res = await fetch(
        '/premier/dataEngine/v3/databaseEngine.php',
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                json_string:JSON.stringify(loginJson)
            })
        }
    )

    const result = await res.json()

    console.log(result)

    const loginInfo = result.login?.[0]

    if(!loginInfo || loginInfo.code != 0){
        alert('login failed')
        return
    }

    const token = loginInfo.token

    localStorage.setItem('token', token)

    await loadUser()
}

async function loadUser(){

    const token = localStorage.getItem('token')

    const json = {
        COMMON:{
            tid:'premier'
        },

        load_user:{
            SQL_PATH:'showcase/generic-folder/auth.sql',
            SQL_TAG:'load_user',
            RETURN:1,

            userid:form.userid
        }
    }

    const res = await fetch(
        '/premier/dataEngine/v3/databaseEngine.php',
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body:JSON.stringify({
                json_string:JSON.stringify(json)
            })
        }
    )

    const result = await res.json()

    console.log('USER=',result)
}
</script>

<template>
<div style="padding:20px">

    <div>
        <input v-model="form.userid" placeholder="userid">
    </div>

    <div>
        <input
            v-model="form.password"
            type="password"
            placeholder="password"
        >
    </div>

    <button @click="doLogin">
        LOGIN
    </button>

</div>
</template>
