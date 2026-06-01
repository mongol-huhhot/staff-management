// main.js
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import wrapper from 'vue3-webcomponent-wrapper'
import WebComponent from '@/components/top-page.ce.vue'

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
// import { ja } from 'vuetify/locale'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const WebComponentInner = (component) => {
  const app = createApp(component)

  app.use(vuetify)
  app.use(createPinia())

  return app
}

const webComponent = wrapper(WebComponent, WebComponentInner, h)

if (!customElements.get('generic-master-system')) {
  customElements.define('generic-master-system', webComponent)
}
