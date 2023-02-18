import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as api from "./api";
import { Manager } from "socket.io-client";
import Bus from "./utils/bus";

// 工具引入
import "./utils/OutsiderComponentInstall";
import "./utils/svg";

// CSS库引入
import "windi.css";
// import "ant-design-vue/dist/antd.less";
import "./styles/atom-one-dark.min.css";

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
Vue.prototype.$bus = Bus;

// Forum 中除了用户 id 以外所有 id 的长度
Vue.prototype.ID_LEN = 24;
Vue.prototype.USERID_LEN = 8;

// 挂载全局 socket
const manager = new Manager("http://localhost:3000");
const socket = manager.socket("/");
// 在 option 中加入 auth 会导致连接出问题，不懂
Vue.prototype.socket = socket;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
