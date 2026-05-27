// src/main.webcomponent.js
import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import wrapper from 'vue3-webcomponent-wrapper'
import WebComponent from '@/components/top-page.ce.vue'
import { useDbStore } from '@/stores/useDbStore.js'

const WebComponentInner = (component) => {
  const app = createApp(component)
  const pinia = createPinia()
  app.use(pinia)

  const db = useDbStore(pinia)
  db.configure({
    tid: window.__SURUPAS_CONFIG__?.tid,
    sqlPath: window.__SURUPAS_CONFIG__?.sqlPath,
  })

  return app
}

const webComponent = wrapper(WebComponent, WebComponentInner, h)
window.customElements.define('generic-master-system', webComponent)
