import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from "./plugins/vuetify";
import App from './App.vue'
import Snackbar from "@/utils/Snackbar.vue"; // Abstracted notification utility
import i18n from './i18n'
import 'flag-icons/css/flag-icons.min.css'

// import {JsonEditorPlugin} from 'vue3-ts-jsoneditor';


// import router from './router'

const app = createApp(App)

app.use(createPinia())
// app.use(router)
app.use(vuetify)
// app.use(JsonEditorPlugin)
// app.component('showSnackbar', showSnackbar);
app.component('Snackbar', Snackbar);
app.use(i18n);

app.config.globalProperties.$Snackbar = Snackbar;

app.mount("#app");

// Listen for lang changes from other frames
window.addEventListener('storage', (e) => {
  if (e.key === 'lang' && e.newValue !== i18n.global.locale.value) {
    i18n.global.locale.value = e.newValue
  }
})

// app.mount('#app')
