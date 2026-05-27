import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from "./plugins/vuetify";
import App from './App.vue'
import Snackbar from "@/utils/Snackbar.vue"; // Abstracted notification utility

// import {JsonEditorPlugin} from 'vue3-ts-jsoneditor';


// import router from './router'

const app = createApp(App)

app.use(createPinia())
// app.use(router)
app.use(vuetify)
// app.use(JsonEditorPlugin)
// app.component('showSnackbar', showSnackbar);
app.component('Snackbar', Snackbar);

app.config.globalProperties.$Snackbar = Snackbar;

app.mount("#app");

// app.mount('#app')
