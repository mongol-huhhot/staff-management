/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'


ModuleRegistry.registerModules([
  AllCommunityModule,
])

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'

const app = createApp(App).component('AgGridVue', AgGridVue)

registerPlugins(app)

app.mount('#app')
