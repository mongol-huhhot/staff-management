<!-- MainLayout.vue -->
<!-- <script setup>
import FormVuetifyContainer from '@/components/forms/FormVuetifyContainer.vue'
</script>

<template>
    <FormVuetifyContainer />
</template> -->


<!-- MainLayout.vue -->
<script setup>
import MainList from '@/components/MainList.vue'
import FormVuetifyContainer from '@/components/forms/FormVuetifyContainer.vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import {computed } from 'vue'


const props = defineProps({
  ApplicationType: {
    type:String,
    default: ()=>'staffs',
  }
})

const application_type = computed(() => props.ApplicationType || '')

</script>

<template>
  <v-container 
    fluid
    class="pa-0 main-layout-container"
  >
  <div class="layout">
    <div class="sub-layout">
  <Splitpanes
    ref="splitpanesRef"
    class="default-theme main-split"
    style="height: 100%; width: 100%;"
  >
    <Pane min-size="10">
    <div class="list-dialog-list-pane">
      <MainList 
      :ApplicationType="application_type"
      
      />
      </div>
    </Pane>
    


    <Pane min-size="10">
<div class="form-dialog-list-pane">
      <FormVuetifyContainer 
      :ApplicationType="application_type"
      
      />
      </div>
      
    </Pane>
  </Splitpanes>
  </div>
  </div>
  </v-container>
</template>

<style scoped>
.main-layout-container {
  height: calc(100vh);
  width: 100%;
}
.main-split{
    height: 100%;
}
.list-dialog-list-pane{
overflow-y: auto;
height: 100%;

}

.form-dialog-list-pane{
overflow-y: auto;
height: 100%;

}
.layout{
    /* flex: 1 1 auto;
    overflow: hidden;
    min-height: 0; */
    height: 100%;
    display: flex;
    flex-direction: column;
}
.sub-layout{
    flex: 1 1 auto;
    overflow: hidden;
    min-height: 0;
}

</style>

