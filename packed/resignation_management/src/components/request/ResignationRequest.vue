<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '@/stores/DataStore'
import ResignationRequestForm from '@/components/request/ResignationRequestForm.vue'
import ResignationRequestSubmitted from '@/components/request/ResignationRequestSubmitted.vue'

const dataStore = useDataStore()

const loaded = ref(false)
const editing = ref(false)
const profileDefaults = ref(null)

// TODO: テスト用ためstaff_idをハードコートにしました。
const staffId = ref('df67582c-f6ff-4fcf-be87-e5dacde15105')

onMounted(async () => {
    try {
        // 提出済みの退職願があるか必ず先に確認する
        await dataStore.get_my_resignation_request({
            staff_id: staffId.value,
        })

        // 未申請の場合のみ staff_personal_data から autofill
        if (!dataStore.states.myRequest) {
            profileDefaults.value = await dataStore.get_my_profile_defaults({
                staff_id: staffId.value,
            })
        }
    }
    finally {
        loaded.value = true
    }
})

const handleSubmitted = () => {
    editing.value = false
}
</script>

<template>
  <div class="request-page">
    <div v-if="!loaded" class="d-flex justify-center align-center pa-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <ResignationRequestSubmitted
      v-else-if="dataStore.states.myRequest && !editing"
      @edit="editing = true"
    />

    <ResignationRequestForm
      v-else
      :initial="dataStore.states.myRequest || profileDefaults"
      :extra-params="{ staff_id: staffId }"
      @submitted="handleSubmitted"
    />
  </div>
</template>

<style scoped>
.request-page {
  padding: 8px;
}
</style>
