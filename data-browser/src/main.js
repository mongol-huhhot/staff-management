import { createApp, h } from "vue";
import wrapper from "vue3-webcomponent-wrapper";
import WebComponent from '@/components/top-page.ce.vue'
import { vLoading } from 'element-plus'
import 'element-plus/theme-chalk/dark/css-vars.css'
import 'element-plus/theme-chalk/el-loading.css'
import '@mdi/font/css/materialdesignicons.css'

const WebComponentInner = (component) => {
    return createApp(component)
        .directive('loading', vLoading)
}

const webComponent = wrapper(WebComponent, WebComponentInner, h);

window.customElements.define("data-browser-system", webComponent);

