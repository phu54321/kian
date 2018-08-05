import Vue from 'vue';

// Bootstrap
import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon.vue';
Vue.component('icon', Icon);

// Trumbowyg
import VueTrumbowyg from 'vue-trumbowyg';
import 'trumbowyg/dist/ui/trumbowyg.css';
import 'trumbowyg/dist/plugins/pasteimage/trumbowyg.pasteimage.min.js';
import 'trumbowyg/dist/plugins/preformatted/trumbowyg.preformatted.min.js';

Vue.use(VueTrumbowyg);
// <script src="trumbowyg/plugins/pasteimage/trumbowyg.pasteimage.min.js"></script>
// <script src="trumbowyg/plugins/preformatted/trumbowyg.preformatted.min.js"></script>


// Router
import VueRouter from 'vue-router';
import router from './router';
Vue.use(VueRouter);

// Axios
import axios from 'axios';
import VueAxios from 'vue-axios';

Vue.use(VueAxios, axios);

// App
import App from './App';
new Vue({
    el: '#app',
    render: h => h(App),
    router,
});
