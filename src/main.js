import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as api from "./api";

// 工具引入
import "./utils/OutsiderComponentInstall";
import "./utils/svg";

// CSS库引入
import "windi.css";
import "ant-design-vue/dist/antd.less";
import "element-ui/lib/theme-chalk/index.css";
// import "animate.css";

// 自定义组件引入
import "./utils/DIYComponentsInstall";

// 自定义 css
import "./styles/forum-gloabal.css";
import "./styles/reset-ant.less";
import "./styles/transition.css";

// 自定义指令
import "./directives";

// 自定工具绑定到 Vue.prototype 上
import "./utils/tool";

Vue.config.productionTip = false;

// 注册接口
Vue.prototype.$api = api.default;

// 通讯总线
Vue.prototype.$bus = new Vue();

// Forum 中除了用户 id 以外所有 id 的长度
Vue.prototype.ID_LEN = 24;
Vue.prototype.USERID_LEN = 8;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
