import { createApp, h } from "vue";
import wrapper from "vue3-webcomponent-wrapper";
import WebComponent from '@/components/main-entrance.ce.vue'
import heic2any from 'heic2any';
import { createPinia } from "pinia";

// グローバルに公開
window.heic2any = heic2any;

const WebComponentInner = (component) => {
    return createApp(component)
        .use(createPinia()) 
        // .directive('loading', vLoading)
}

const webComponent = wrapper(WebComponent, WebComponentInner, h);

window.customElements.define("image-uplaod", webComponent);


