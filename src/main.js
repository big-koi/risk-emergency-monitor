import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router/router'

import './router/index'
// import * as ol from "ol";
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue'
import { Icon } from "ant-design-vue";
import iconFont from "./assets/diit-icon/iconfont.js";

import * as diitWidgets from "../static/config/js/diitMap/diitWidgets";

import './assets/css/base.css'
import './assets/css/font.css'

import common from './utils/common'

import drag from './directives/drag'
import resizable from './directives/resizable'; // 根据你的路径调整
import dragResizableDirective  from './directives/drag-resizable'; // 根据你的路径调整
// 全局注册指令
Vue.directive('resizable', resizable);
// 全局注册拖拽指令
Vue.directive('drag', drag)
// 全局注册拖拽缩放指令
Vue.directive('dragResizable', dragResizableDirective)

// 自定义引用
const customIcon = Icon.createFromIconfontCN({ scriptUrl: iconFont })
Vue.component('diit-icon', customIcon)
Vue.use(Antd);
Vue.use(diitWidgets);
Vue.prototype.common = common;

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
// 存储原始的setItem方法
const orignalSetItem = sessionStorage.setItem;
// 重写setItem方法
sessionStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event('setItemEvent');
  setItemEvent.newValue = newValue;
  window.dispatchEvent(setItemEvent);
  orignalSetItem.apply(this, arguments);
}
// 监听事件
window.addEventListener('setItemEvent', (e) => {
  console.log(e)
});
