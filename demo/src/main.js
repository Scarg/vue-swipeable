import Vue from 'vue';
import App from './App.vue';

import {Swipeable} from '../../dist/index.js';

Vue.config.productionTip = false;
Vue.directive('swipeable', Swipeable);

new Vue({
  render: h => h(App),
}).$mount('#app');
